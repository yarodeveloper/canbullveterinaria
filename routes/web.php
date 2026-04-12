<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ConsentController;
use App\Http\Controllers\GroomingOrderController;
use App\Http\Controllers\PreventiveRecordController;

Route::get('/', function () {
    $settings = \App\Models\SiteSetting::all()->pluck('value', 'key');

    return Inertia::render('Welcome', [
        'settings' => $settings,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Public Carnet
Route::get('/carnet/{uuid}', [\App\Http\Controllers\PublicPetController::class, 'carnet'])->name('public.carnet');

Route::get('/sitemap.xml', [\App\Http\Controllers\SitemapController::class, 'index']);

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/pets/search', [\App\Http\Controllers\PetController::class, 'search'])->name('pets.search');
    Route::post('/pets/{pet}/link-owner', [\App\Http\Controllers\PetController::class, 'linkOwner'])->name('pets.link-owner');
    Route::post('/pets/{pet}/photo', [\App\Http\Controllers\PetController::class, 'updatePhoto'])->name('pets.update-photo');
    Route::resource('pets', \App\Http\Controllers\PetController::class);
    Route::resource('clients', \App\Http\Controllers\ClientController::class);

    Route::get('/breeds/search', [\App\Http\Controllers\PetBreedController::class, 'search'])->name('breeds.search');
    Route::resource('breeds', \App\Http\Controllers\PetBreedController::class);
    Route::get('/medical-records', [\App\Http\Controllers\MedicalRecordController::class, 'index'])->name('medical-records.index');
    Route::get('/pets/{pet}/medical-records/create', [\App\Http\Controllers\MedicalRecordController::class, 'create'])->name('medical-records.create');
    Route::post('/pets/{pet}/medical-records', [\App\Http\Controllers\MedicalRecordController::class, 'store'])->name('medical-records.store');
    Route::get('/medical-records/{medicalRecord}/edit', [\App\Http\Controllers\MedicalRecordController::class, 'edit'])->name('medical-records.edit');
    Route::get('/medical-records/{medicalRecord}', [\App\Http\Controllers\MedicalRecordController::class, 'show'])->name('medical-records.show');
    Route::put('/medical-records/{medicalRecord}', [\App\Http\Controllers\MedicalRecordController::class, 'update'])->name('medical-records.update');
    Route::get('/medical-records/{medicalRecord}/print/{template}', [\App\Http\Controllers\MedicalRecordController::class, 'printConsent'])->name('medical-records.consent.print');
    Route::get('/medical-records/{medicalRecord}/prescription', [\App\Http\Controllers\MedicalRecordController::class, 'printPrescription'])->name('medical-records.prescription.print');
    Route::get('/medical-records/{medicalRecord}/report', [\App\Http\Controllers\MedicalRecordController::class, 'printReport'])->name('medical-records.report.print');

    Route::get('/consents', [ConsentController::class, 'index'])->name('consents.index');
    Route::get('/pets/{pet}/consents/create', [ConsentController::class, 'create'])->name('consents.create');
    Route::post('/consents', [ConsentController::class, 'store'])->name('consents.store');
    Route::get('/consents/{consent}', [ConsentController::class, 'show'])->name('consents.show');

    // Grooming Orders
    Route::get('/grooming-orders', [GroomingOrderController::class, 'index'])->name('grooming-orders.index');
    Route::get('/grooming-orders/create', [GroomingOrderController::class, 'create'])->name('grooming-orders.create');
    Route::post('/grooming-orders', [GroomingOrderController::class, 'store'])->name('grooming-orders.store');
    Route::get('/grooming-orders/{groomingOrder}', [GroomingOrderController::class, 'show'])->name('grooming-orders.show');
    Route::put('/grooming-orders/{groomingOrder}', [GroomingOrderController::class, 'update'])->name('grooming-orders.update');
    Route::post('/grooming-orders/{groomingOrder}/complete', [GroomingOrderController::class, 'complete'])->name('grooming-orders.complete');

    // Documentos Externos (PDF, Images)
    Route::post('pet-documents', [\App\Http\Controllers\PetDocumentController::class, 'store'])->name('pet-documents.store');
    Route::get('pet-documents/{document}/download', [\App\Http\Controllers\PetDocumentController::class, 'download'])->name('pet-documents.download');
    Route::delete('pet-documents/{document}', [\App\Http\Controllers\PetDocumentController::class, 'destroy'])->name('pet-documents.destroy');

    // Agenda Médica
    Route::resource('appointments', \App\Http\Controllers\AppointmentController::class);
    
    // Tareas Administrativas
    Route::post('tasks', [\App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
    Route::put('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
    Route::delete('tasks/{task}', [\App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');

    // Carnet de Vacunación / Preventivos
    Route::get('preventive-records', [PreventiveRecordController::class, 'index'])->name('preventive-records.index');
    Route::post('preventive-records', [PreventiveRecordController::class, 'store'])->name('preventive-records.store');
    Route::put('preventive-records/{preventiveRecord}', [PreventiveRecordController::class, 'update'])->name('preventive-records.update');
    Route::delete('preventive-records/{preventiveRecord}', [PreventiveRecordController::class, 'destroy'])->name('preventive-records.destroy');

    // Gestión Web
    Route::get('/settings/web', [\App\Http\Controllers\SiteSettingController::class, 'index'])->name('settings.web.index');
    Route::post('/settings/web', [\App\Http\Controllers\SiteSettingController::class, 'update'])->name('settings.web.update');

    // Mantenimiento de Protocolos de Salud (Vacunas, etc)
    Route::resource('health-protocols', \App\Http\Controllers\HealthProtocolController::class);

    // Plantillas de Documentos (Configuración)
    Route::get('/document-templates', [\App\Http\Controllers\DocumentTemplateController::class, 'index'])->name('document-templates.index');
    Route::get('/document-templates/guide', [\App\Http\Controllers\DocumentTemplateController::class, 'quickGuide'])->name('document-templates.guide');
    Route::get('/document-templates/{template}/preview', [\App\Http\Controllers\DocumentTemplateController::class, 'preview'])->name('document-templates.preview');
    Route::post('/document-templates', [\App\Http\Controllers\DocumentTemplateController::class, 'store'])->name('document-templates.store');
    Route::put('/settings/documents/{template}', [\App\Http\Controllers\DocumentTemplateController::class, 'update'])->name('document-templates.update');
    Route::delete('/settings/documents/{template}', [\App\Http\Controllers\DocumentTemplateController::class, 'destroy'])->name('document-templates.destroy');
    Route::get('/pets/{pet}/print-template/{template}', [\App\Http\Controllers\DocumentTemplateController::class, 'print'])->name('document-templates.print');

    // Hospitalización
    Route::resource('hospitalizations', \App\Http\Controllers\HospitalizationController::class);
    Route::get('/hospitalizations/{hospitalization}/report', [\App\Http\Controllers\HospitalizationController::class, 'printReport'])->name('hospitalizations.report');
    Route::post('/hospitalizations/{hospitalization}/monitoring', [\App\Http\Controllers\HospitalizationController::class, 'storeMonitoring'])->name('hospitalizations.monitoring.store');
    Route::get('/hospitalizations/{hospitalization}/consent/{template}', [\App\Http\Controllers\HospitalizationController::class, 'printConsent'])->name('hospitalizations.consent.print');

    // Cirugías
    Route::resource('surgeries', \App\Http\Controllers\SurgeryController::class);
    Route::get('/surgeries/{surgery}/report', [\App\Http\Controllers\SurgeryController::class, 'printReport'])->name('surgeries.report');
    Route::get('/surgeries/{surgery}/consent/{template}', [\App\Http\Controllers\SurgeryController::class, 'printConsent'])->name('surgeries.consent.print');

    // Eutanasia
    Route::resource('euthanasias', \App\Http\Controllers\EuthanasiaController::class);
    Route::get('/euthanasias/{euthanasia}/report', [\App\Http\Controllers\EuthanasiaController::class, 'printReport'])->name('euthanasias.report');
    Route::get('/euthanasias/{euthanasia}/consent/{template}', [\App\Http\Controllers\EuthanasiaController::class, 'printConsent'])->name('euthanasias.consent.print');


    // Inventario y Farmacia
    Route::get('/inventory', [\App\Http\Controllers\InventoryController::class, 'index'])->name('inventory.index');
    Route::post('/inventory', [\App\Http\Controllers\InventoryController::class, 'store'])->name('inventory.store');
    Route::get('/inventory/audit', [\App\Http\Controllers\InventoryController::class, 'audit'])->name('inventory.audit');
    Route::get('/inventory/movements', [\App\Http\Controllers\InventoryController::class, 'movements'])->name('inventory.movements');
    Route::get('/inventory/{product}', [\App\Http\Controllers\InventoryController::class, 'show'])->name('inventory.show');
    Route::put('/inventory/{product}', [\App\Http\Controllers\InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('/inventory/{product}', [\App\Http\Controllers\InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('/inventory/{product}/lots', [\App\Http\Controllers\InventoryController::class, 'storeLot'])->name('inventory.lots.store');
    Route::post('/inventory/{product}/adjust', [\App\Http\Controllers\InventoryController::class, 'adjustStock'])->name('inventory.adjust');

    // Categorias de productos y servicios
    Route::resource('product-categories', \App\Http\Controllers\ProductCategoryController::class)->except(['create', 'show', 'edit']);


    // Finanzas (Cortes de Caja, Recibos y Movimientos)
    Route::get('/cash-register', [\App\Http\Controllers\CashRegisterController::class, 'index'])->name('cash-register.index');
    Route::post('/cash-register/open', [\App\Http\Controllers\CashRegisterController::class, 'open'])->name('cash-register.open');
    Route::post('/cash-register/close/{cashRegister}', [\App\Http\Controllers\CashRegisterController::class, 'close'])->name('cash-register.close');
    Route::get('/cash-register/{cashRegister}/print', [\App\Http\Controllers\CashRegisterController::class, 'print'])->name('cash-register.print');

    Route::resource('receipts', \App\Http\Controllers\ReceiptController::class);
    Route::get('/receipts/{receipt}/print', [\App\Http\Controllers\ReceiptController::class, 'print'])->name('receipts.print');
    Route::get('/cash', [\App\Http\Controllers\CashController::class, 'index'])->name('cash.index');
    Route::post('/cash', [\App\Http\Controllers\CashController::class, 'store'])->name('cash.store');
    Route::get('/cash/{cashMovement}/print', [\App\Http\Controllers\CashController::class, 'print'])->name('cash.print');
    Route::post('/settings/pos-printer', [\App\Http\Controllers\SiteSettingController::class, 'updatePosPrinter'])->name('settings.pos-printer.update');
    Route::post('/settings/branch-switcher', [\App\Http\Controllers\BranchSwitcherController::class, 'update'])->name('settings.branch-switcher.update');
    // Sucursales
    Route::resource('branches', \App\Http\Controllers\BranchController::class);

    // Personal y Usuarios
    // Reportes Analíticos
    Route::get('/reports/sales-by-employee', [\App\Http\Controllers\ReportController::class, 'salesByEmployee'])->name('reports.sales-by-employee');
    Route::get('/reports/patients-attended', [\App\Http\Controllers\ReportController::class, 'patientsAttended'])->name('reports.patients-attended');
    Route::get('/reports/stock-by-branch', [\App\Http\Controllers\ReportController::class, 'stockByBranch'])->name('reports.stock-by-branch');

    Route::resource('staff', \App\Http\Controllers\StaffController::class);
    Route::resource('roles', \App\Http\Controllers\RoleController::class);

});

require __DIR__.'/auth.php';
