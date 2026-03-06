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
    public function index()
    {
        $user = Auth::user();
        $branchId = $user->branch_id;

        $query = Receipt::with('client');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $receipts = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Finance/Receipts/Index', [
            'receipts' => $receipts
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

        $clients = User::where('role', 'client')->where('email', '!=', 'publico@general.com')->get();
        // Cargar productos con su categoría y listos para calcular el stock en RAM (o con subquery si prefiere)
        $products = Product::where('is_active', true)->with(['category', 'lots' => function($query) use ($branchId) {
            $query->where('branch_id', $branchId)->where('status', 'active');
        }])->get()->map(function($product) {
            $product->current_stock = $product->lots->sum('current_quantity');
            return $product;
        });
        
        // Cargar mascotas con sus dueños (considerando múltiples dueños con owners()) y también owner() por compatibilidad
        $pets = \App\Models\Pet::with(['owners', 'owner'])->get();

        $generalPublicClient = User::firstOrCreate(
            ['email' => 'publico@general.com'],
            [
                'name' => 'Público en General',
                'role' => 'client',
                'password' => bcrypt('password123'),
                'branch_id' => $branchId,
            ]
        );

        return Inertia::render('Finance/Receipts/Create', [
            'clients' => $clients,
            'products' => $products,
            'pets' => $pets,
            'selectedClientId' => $request->client_id,
            'activeRegister' => $activeRegister,
            'generalPublicClient' => $generalPublicClient
        ]);
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
            'items.*.type' => 'required|in:product,service',
            'payment_method' => 'required|string',
            'mixed_cash_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
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
            $tax = 0;
            
            foreach ($validated['items'] as $item) {
                $lineSubtotal = $item['quantity'] * $item['unit_price'];
                $ivaPercent = $item['tax_iva'] ?? ($item['type'] === 'service' ? 0 : 16);
                $iepsPercent = $item['tax_ieps'] ?? 0;

                $lineTaxIva = $lineSubtotal * ($ivaPercent / 100);
                $lineTaxIeps = $lineSubtotal * ($iepsPercent / 100);
                $lineTax = $lineTaxIva + $lineTaxIeps;

                $subtotal += $lineSubtotal;
                $tax += $lineTax;
            }

            $total = $subtotal + $tax;

            $receipt = Receipt::create([
                'user_id' => $validated['user_id'],
                'branch_id' => $branchId,
                'cash_register_id' => $activeRegister->id,
                'receipt_number' => 'REC-' . strtoupper(uniqid()),
                'date' => now(),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'status' => $validated['payment_method'] === 'credit' ? 'pending' : 'paid',
                'notes' => $validated['notes'],
            ]);

            foreach ($validated['items'] as $item) {
                $lineSubtotal = $item['quantity'] * $item['unit_price'];
                $ivaPercent = $item['tax_iva'] ?? ($item['type'] === 'service' ? 0 : 16);
                $iepsPercent = $item['tax_ieps'] ?? 0;

                $lineTaxIva = $lineSubtotal * ($ivaPercent / 100);
                $lineTaxIeps = $lineSubtotal * ($iepsPercent / 100);
                $lineTax = $lineTaxIva + $lineTaxIeps;

                ReceiptItem::create([
                    'receipt_id' => $receipt->id,
                    'concept' => $item['concept'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $lineSubtotal,
                    'tax' => $lineTax,
                    'total' => $lineSubtotal + $lineTax,
                    'type' => $item['type'],
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

            return redirect()->route('receipts.show', $receipt->id)
                ->with('message', 'Recibo generado correctamente.');
        });
    }

    public function show(Receipt $receipt)
    {
        $receipt->load(['client', 'items', 'branch']);
        return Inertia::render('Finance/Receipts/Show', [
            'receipt' => $receipt
        ]);
    }
}
