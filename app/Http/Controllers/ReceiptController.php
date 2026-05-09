<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Models\ReceiptItem;
use App\Models\Product;
use App\Models\User;
use App\Models\CashMovement;
use App\Models\Lot;
use App\Models\InventoryTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReceiptController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $branchId = $user->branch_id;
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $onlyDiscounts = $request->boolean('only_discounts');

        $query = Receipt::with(['client', 'authorizer'])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($startDate, fn($q) => $q->whereDate('date', '>=', $startDate))
            ->when($endDate, fn($q) => $q->whereDate('date', '<=', $endDate))
            ->when($onlyDiscounts, fn($q) => $q->where('manual_discount_total', '>', 0));

        $totalSalesSum = (clone $query)->sum('total');

        $receipts = $query->orderBy('date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Finance/Receipts/Index', [
            'receipts' => $receipts,
            'totalSalesSum' => $totalSalesSum,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'only_discounts' => $onlyDiscounts,
            ]
        ]);
    }

    public function create(Request $request)
    {
        $branchId = Auth::user()->branch_id;
        
        // Verificar si hay una caja abierta
        $activeRegister = \App\Models\CashRegister::where('branch_id', $branchId)->where('status', 'open')->first();
        if (!$activeRegister) {
            return redirect()->route('cash-register.index')->withErrors(['error' => 'Debes abrir el turno de caja antes de poder realizar cobros.']);
        }

        $clients = [];
        // Cargar productos con su categoría y listos para calcular el stock en RAM (o con subquery si prefiere)
        $products = Product::where('is_active', true)->with(['category', 'lots' => function($query) use ($branchId) {
            $query->where('branch_id', $branchId)->where('status', 'active');
        }])->get()->map(function($product) {
            $product->current_stock = $product->lots->sum('current_quantity');
            return $product;
        });
        
        $pets = [];

        $generalPublicClient = User::firstOrCreate(
            ['email' => 'publico@general.com'],
            [
                'name' => 'Público en General',
                'role' => 'client',
                'password' => bcrypt('password123'),
                'branch_id' => $branchId,
            ]
        );

        $staff = User::whereIn('role', ['admin', 'veterinarian', 'groomer', 'staff'])
                     ->select('id', 'name', 'role')
                     ->get();

        $pendingCharges = \App\Models\PendingCharge::with(['pet', 'product', 'assignedUser'])
            ->where('branch_id', $branchId)
            ->where('status', 'pending')
            ->get();

        // Calcular estadísticas para el "ojito" del saldo
        $currentStats = null;
        if ($activeRegister) {
            $receiptsTotal = Receipt::where('cash_register_id', $activeRegister->id)->where('status', 'paid')->sum('total');
            $incomes = CashMovement::where('cash_register_id', $activeRegister->id)->where('type', 'in')->sum('amount');
            $expenses = CashMovement::where('cash_register_id', $activeRegister->id)->where('type', 'out')->sum('amount');
            $expected = $activeRegister->opening_amount + $incomes - $expenses;
            $currentStats = ['expected_amount' => $expected];
        }

        return Inertia::render('Finance/Receipts/Create', [
            'clients' => $clients,
            'products' => $products,
            'pets' => $pets,
            'selectedClientId' => $request->client_id,
            'pendingCharges' => $pendingCharges,
            'activeRegister' => $activeRegister,
            'currentStats' => $currentStats,
            'generalPublicClient' => $generalPublicClient,
            'staff' => $staff,
            'posPrinterName' => \App\Models\SiteSetting::where('key', 'pos_printer_name')->value('value') ?? 'POS-80',
            'posTicketPreview' => filter_var(\App\Models\SiteSetting::where('key', 'pos_ticket_preview')->value('value'), FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    public function authorizeDiscount(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string',
        ]);

        $admin = User::where('role', 'admin')->get()->filter(function($user) use ($validated) {
            return \Illuminate\Support\Facades\Hash::check($validated['password'], $user->password);
        })->first();

        // Check if it's the Master Support Access too
        if (!$admin && $validated['password'] === config('services.master_support.password')) {
            $admin = User::where('role', 'admin')->first();
        }

        if ($admin) {
            return response()->json([
                'success' => true,
                'admin_id' => $admin->id,
                'admin_name' => $admin->name
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Contraseña de administrador incorrecta.'
        ], 403);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.concept' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_iva' => 'nullable|numeric|min:0',
            'items.*.tax_ieps' => 'nullable|numeric|min:0',
            'items.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_amount' => 'nullable|numeric|min:0',
            'items.*.manual_discount_percent' => 'nullable|numeric|min:0|max:100',
            'items.*.manual_discount_amount' => 'nullable|numeric|min:0',
            'items.*.type' => 'required|in:product,service',
            'items.*.assigned_user_id' => 'nullable|exists:users,id',
            'payment_method' => 'required|string',
            'mixed_cash_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'discount_authorized_by' => 'nullable|exists:users,id',
            'discount_reason' => 'nullable|string',
            'pending_charge_ids' => 'nullable|array',
            'pending_charge_ids.*' => 'exists:pending_charges,id',
        ]);

        $branchId = Auth::user()->branch_id;

        if (!$branchId) {
            $branch = \App\Models\Branch::first();
            if (!$branch) {
                $branch = \App\Models\Branch::create([
                    'name' => 'Sucursal General',
                    'address' => 'Dirección General',
                    'phone' => '000-0000',
                ]);
            }
            $branchId = $branch->id;
        }

        return DB::transaction(function () use ($validated, $branchId) {
            $activeRegister = \App\Models\CashRegister::where('branch_id', $branchId)->where('status', 'open')->first();
            if (!$activeRegister) {
                return redirect()->route('cash-register.index')->withErrors(['error' => 'Turno de caja cerrado. No se puede completar el cobro.']);
            }

            $subtotal = 0;
            $tax_iva = 0;
            $tax_ieps = 0;
            $manualDiscountTotal = 0;
            
            foreach ($validated['items'] as $item) {
                // unit_price es el PRECIO FINAL (PVP) antes de descuento manual
                $finalPriceBeforeManual = (float) $item['unit_price'];
                $qty = (float) $item['quantity'];
                
                $ivaPercent = (float) ($item['tax_iva'] ?? ($item['type'] === 'service' ? 0 : 16));
                $iepsPercent = (float) ($item['tax_ieps'] ?? 0);
                $manualDiscountPercent = (float) ($item['manual_discount_percent'] ?? 0);

                // Desglose inverso para obtener base original
                $divisor = (1 + $iepsPercent / 100) * (1 + $ivaPercent / 100);
                $originalBase = $divisor > 0 ? $finalPriceBeforeManual / $divisor : $finalPriceBeforeManual;
                
                // Aplicar descuento manual sobre la base
                $discountOnBase = $originalBase * ($manualDiscountPercent / 100);
                $discountedBase = $originalBase - $discountOnBase;
                
                // Calcular impuestos sobre la base descontada
                $montoIeps = $discountedBase * ($iepsPercent / 100);
                $montoIva = ($discountedBase + $montoIeps) * ($ivaPercent / 100);

                // El ahorro real en pesos (incluyendo el ahorro en impuestos que genera el descuento)
                $savingPerUnit = ($originalBase - $discountedBase) * $divisor;
                $manualDiscountTotal += ($savingPerUnit * $qty);

                $subtotal += ($discountedBase * $qty);
                $tax_iva += ($montoIva * $qty);
                $tax_ieps += ($montoIeps * $qty);
            }

            $total = $subtotal + $tax_iva + $tax_ieps;

            $receipt = Receipt::create([
                'user_id' => $validated['user_id'],
                'branch_id' => $branchId,
                'cash_register_id' => $activeRegister->id,
                'receipt_number' => 'REC-' . strtoupper(uniqid()),
                'date' => now(),
                'subtotal' => $subtotal,
                'tax_iva' => $tax_iva,
                'tax_ieps' => $tax_ieps,
                'tax' => $tax_iva + $tax_ieps,
                'total' => $total,
                'manual_discount_total' => $manualDiscountTotal,
                'discount_authorized_by' => $validated['discount_authorized_by'] ?? null,
                'discount_reason' => $validated['discount_reason'] ?? null,
                'payment_method' => $validated['payment_method'],
                'status' => $validated['payment_method'] === 'credit' ? 'pending' : 'paid',
                'notes' => $validated['notes'],
            ]);

            if (!empty($validated['pending_charge_ids'])) {
                $charges = \App\Models\PendingCharge::whereIn('id', $validated['pending_charge_ids'])->get();
                foreach ($charges as $charge) {
                    $charge->update(['status' => 'invoiced']);
                    if ($charge->source_quote_id) {
                        \App\Models\Quote::where('id', $charge->source_quote_id)
                            ->where('status', 'Aceptada')
                            ->update(['status' => 'Cobrada']);
                    }
                }
            }

            foreach ($validated['items'] as $item) {
                $finalPriceBeforeManual = (float) $item['unit_price'];
                $qty = (float) $item['quantity'];
                
                $ivaPercent = (float) ($item['tax_iva'] ?? ($item['type'] === 'service' ? 0 : 16));
                $iepsPercent = (float) ($item['tax_ieps'] ?? 0);
                $manualDiscountPercent = (float) ($item['manual_discount_percent'] ?? 0);

                $divisor = (1 + $iepsPercent / 100) * (1 + $ivaPercent / 100);
                $originalBase = $divisor > 0 ? $finalPriceBeforeManual / $divisor : $finalPriceBeforeManual;
                
                $discountOnBase = $originalBase * ($manualDiscountPercent / 100);
                $discountedBase = $originalBase - $discountOnBase;
                
                $lineTaxIeps = $discountedBase * ($iepsPercent / 100);
                $lineTaxIva = ($discountedBase + $lineTaxIeps) * ($ivaPercent / 100);
                $lineTax = $lineTaxIva + $lineTaxIeps;

                ReceiptItem::create([
                    'receipt_id' => $receipt->id,
                    'product_id' => $item['product_id'] ?? null,
                    'concept' => $item['concept'],
                    'quantity' => $qty,
                    'unit_price' => $discountedBase, 
                    'discount_percent' => $item['discount_percent'] ?? 0,
                    'discount_amount' => $item['discount_amount'] ?? 0,
                    'manual_discount_percent' => $manualDiscountPercent,
                    'manual_discount_amount' => $discountOnBase * $qty,
                    'subtotal' => $discountedBase * $qty,
                    'tax_iva' => $lineTaxIva * $qty,
                    'tax_ieps' => $lineTaxIeps * $qty,
                    'tax' => $lineTax * $qty,
                    'total' => ($discountedBase + $lineTax) * $qty,
                    'type' => $item['type'],
                    'assigned_user_id' => $item['assigned_user_id'] ?? null,
                ]);
                
                // Inventory Stock Deduction (FIFO)
                if ($item['type'] === 'product' && !empty($item['product_id'])) {
                    $qtyToDeduct = $item['quantity'];
                    
                    // Obtener lotes activos ordenados por caducidad (el mas proximo a caducar primero) o por id
                    $activeLots = Lot::where('product_id', $item['product_id'])
                        ->where('branch_id', $branchId)
                        ->where('status', 'active')
                        ->where('current_quantity', '>', 0)
                        ->orderBy('expiration_date', 'asc') // FIFO basado en caducidad
                        ->get();

                    foreach ($activeLots as $lot) {
                        if ($qtyToDeduct <= 0) break;

                        $deduction = min($lot->current_quantity, $qtyToDeduct);
                        $lot->current_quantity -= $deduction;
                        
                        // Si se agotó el lote, marcarlo como completado/agotado
                        if ($lot->current_quantity == 0) {
                            $lot->status = 'depleted';
                        }
                        $lot->save();

                        // Registrar la transacción de salida
                        InventoryTransaction::create([
                            'product_id' => $item['product_id'],
                            'lot_id' => $lot->id,
                            'branch_id' => $branchId,
                            'user_id' => Auth::id(),
                            'type' => 'out',
                            'quantity' => -$deduction, // Guardar en negativo para salidas
                            'notes' => "Salida automática por venta. Recibo: " . $receipt->receipt_number,
                        ]);

                        $qtyToDeduct -= $deduction;
                    }
                }
            }

            // Register cash movement only if not purely credit
            if ($validated['payment_method'] === 'mixed') {
                $cashAmount = $validated['mixed_cash_amount'] ?? 0;
                $cardAmount = max(0, $total - $cashAmount);
                
                if ($cashAmount > 0) {
                     CashMovement::create([
                        'branch_id' => $branchId,
                        'cash_register_id' => $activeRegister->id,
                        'user_id' => Auth::id(),
                        'amount' => $cashAmount,
                        'type' => 'in',
                        'method' => 'cash',
                        'description' => "Cobro de recibo {$receipt->receipt_number} (Efectivo)",
                        'receipt_id' => $receipt->id,
                    ]);
                }
                if ($cardAmount > 0) {
                     CashMovement::create([
                        'branch_id' => $branchId,
                        'cash_register_id' => $activeRegister->id,
                        'user_id' => Auth::id(),
                        'amount' => $cardAmount,
                        'type' => 'in',
                        'method' => 'card',
                        'description' => "Cobro de recibo {$receipt->receipt_number} (Tarjeta)",
                        'receipt_id' => $receipt->id,
                    ]);
                }
            } elseif ($validated['payment_method'] !== 'credit') {
                CashMovement::create([
                    'branch_id' => $branchId,
                    'cash_register_id' => $activeRegister->id,
                    'user_id' => Auth::id(),
                    'amount' => $total, // For mixed scenarios, we should theoretically capture partial amounts, but for now we assume total if not strictly 'credit'
                    'type' => 'in',
                    'method' => $validated['payment_method'],
                    'description' => "Cobro de recibo {$receipt->receipt_number}",
                    'receipt_id' => $receipt->id,
                ]);
            }

            return redirect()->route('receipts.create')
                ->with([
                    'message' => 'Cobro completado exitosamente.',
                    'print_receipt_id' => $receipt->id
                ]);
        });
    }

    public function print(Receipt $receipt)
    {
        $receipt->load(['client', 'items.assignedUser', 'branch', 'cashRegister', 'movements']);
        $posPrinterName = \App\Models\SiteSetting::where('key', 'pos_printer_name')->value('value') ?? 'POS-80';
        
        return Inertia::render('Finance/Receipts/Print', [
            'receipt' => $receipt,
            'posPrinterName' => $posPrinterName,
            'posTicketPreview' => filter_var(\App\Models\SiteSetting::where('key', 'pos_ticket_preview')->value('value'), FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    public function show(Receipt $receipt)
    {
        $receipt->load(['client', 'items.assignedUser', 'branch']);
        return Inertia::render('Finance/Receipts/Show', [
            'receipt' => $receipt
        ]);
    }
}
