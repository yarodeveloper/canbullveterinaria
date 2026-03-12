<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/pets/search', [\App\Http\Controllers\PetController::class, 'search'])->name('pets.search');
    Route::post('/pets/{pet}/link-owner', [\App\Http\Controllers\PetController::class, 'linkOwner'])->name('pets.link-owner');
    Route::resource('pets', \App\Http\Controllers\PetController::class);
    Route::resource('clients', \App\Http\Controllers\ClientController::class);

    Route::get('/breeds/search', [\App\Http\Controllers\PetBreedController::class, 'search'])->name('breeds.search');
    Route::resource('breeds', \App\Http\Controllers\PetBreedController::class);
    Route::get('/pets/{pet}/medical-records/create', [\App\Http\Controllers\MedicalRecordController::class, 'create'])->name('medical-records.create');
    Route::post('/pets/{pet}/medical-records', [\App\Http\Controllers\MedicalRecordController::class, 'store'])->name('medical-records.store');
    Route::get('/medical-records/{medicalRecord}', [\App\Http\Controllers\MedicalRecordController::class, 'show'])->name('medical-records.show');

    Route::get('/consents', [\App\Http\Controllers\ConsentController::class, 'index'])->name('consents.index');
    Route::get('/pets/{pet}/consents/create', [\App\Http\Controllers\ConsentController::class, 'create'])->name('consents.create');
    Route::post('/pets/{pet}/consents', [\App\Http\Controllers\ConsentController::class, 'store'])->name('consents.store');
    Route::get('/consents/{consent}', [\App\Http\Controllers\ConsentController::class, 'show'])->name('consents.show');

    // Documentos Externos (PDF, Images)
    Route::post('pet-documents', [\App\Http\Controllers\PetDocumentController::class, 'store'])->name('pet-documents.store');
    Route::get('pet-documents/{document}/download', [\App\Http\Controllers\PetDocumentController::class, 'download'])->name('pet-documents.download');
    Route::delete('pet-documents/{document}', [\App\Http\Controllers\PetDocumentController::class, 'destroy'])->name('pet-documents.destroy');

    // Agenda Médica
    Route::resource('appointments', \App\Http\Controllers\AppointmentController::class);

    // Carnet de Vacunación / Preventivos
    Route::post('preventive-records', [\App\Http\Controllers\PreventiveRecordController::class, 'store'])->name('preventive-records.store');
    Route::delete('preventive-records/{preventiveRecord}', [\App\Http\Controllers\PreventiveRecordController::class, 'destroy'])->name('preventive-records.destroy');

    // Gestión Web
    Route::get('/settings/web', [\App\Http\Controllers\SiteSettingController::class, 'index'])->name('settings.web.index');
    Route::post('/settings/web', [\App\Http\Controllers\SiteSettingController::class, 'update'])->name('settings.web.update');

    // Plantillas de Documentos (Configuración)
    Route::get('/settings/documents', [\App\Http\Controllers\DocumentTemplateController::class, 'index'])->name('document-templates.index');
    Route::post('/settings/documents', [\App\Http\Controllers\DocumentTemplateController::class, 'store'])->name('document-templates.store');
    Route::put('/settings/documents/{template}', [\App\Http\Controllers\DocumentTemplateController::class, 'update'])->name('document-templates.update');
    Route::delete('/settings/documents/{template}', [\App\Http\Controllers\DocumentTemplateController::class, 'destroy'])->name('document-templates.destroy');

    // Hospitalización
    Route::resource('hospitalizations', \App\Http\Controllers\HospitalizationController::class);
    Route::post('/hospitalizations/{hospitalization}/monitoring', [\App\Http\Controllers\HospitalizationController::class, 'storeMonitoring'])->name('hospitalizations.monitoring.store');
    Route::get('/hospitalizations/{hospitalization}/consent/{template}', [\App\Http\Controllers\HospitalizationController::class, 'printConsent'])->name('hospitalizations.consent.print');

    // Cirugías
    Route::resource('surgeries', \App\Http\Controllers\SurgeryController::class);
    Route::get('/surgeries/{surgery}/consent/{template}', [\App\Http\Controllers\SurgeryController::class, 'printConsent'])->name('surgeries.consent.print');

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
    Route::get('/cash', [\App\Http\Controllers\CashController::class, 'index'])->name('cash.index');
    Route::post('/cash', [\App\Http\Controllers\CashController::class, 'store'])->name('cash.store');
    Route::get('/cash/{cashMovement}/print', [\App\Http\Controllers\CashController::class, 'print'])->name('cash.print');
    // Personal y Usuarios
    Route::resource('staff', \App\Http\Controllers\StaffController::class);

});

require __DIR__.'/auth.php';
