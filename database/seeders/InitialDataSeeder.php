<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Pet;
use App\Models\User;
use App\Models\MedicalRecord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear Sucursal
        $branch = Branch::create([
            'name' => 'CanBull Matriz',
            'address' => 'Av. Principal 123, CDMX',
            'phone' => '555-0192',
            'email' => 'matriz@canbull.com',
            'tax_id' => 'CANB123456XYZ',
        ]);

        // 2. Crear Veterinario (Admin de Sucursal)
        $vet = User::create([
            'name' => 'Dr. Alejandro Magno',
            'email' => 'vet@canbull.com',
            'password' => Hash::make('password'),
            'role' => 'veterinarian',
            'branch_id' => $branch->id,
            'phone' => '555-8888',
        ]);

        // 3. Crear Cliente
        $client = User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan@cliente.com',
            'password' => Hash::make('password'),
            'role' => 'client',
            'branch_id' => $branch->id,
            'phone' => '555-9999',
            'address' => 'Colonia Roma Norte, Calle Zacatecas 45',
            'emergency_contact_name' => 'María Pérez (Hermana)',
            'emergency_contact_phone' => '555-1122',
            'tax_id' => 'PEJJ800101XYZ',
        ]);

        // 4. Crear Mascota
        $pet = Pet::create([
            'name' => 'Rocky',
            'species' => 'Canino',
            'breed' => 'Golden Retriever',
            'gender' => 'male',
            'dob' => '2020-05-15',
            'color' => 'Dorado',
            'weight' => 28.5,
            'user_id' => $client->id,
            'branch_id' => $branch->id,
            'notes' => 'Alergia al pollo. Muy amigable.',
            'is_aggressive' => false,
            'chronic_conditions' => 'Displasia de cadera leve',
        ]);

        $pet->owners()->attach($client->id, ['relation_type' => 'Owner', 'is_primary' => true]);

        // 5. Crear Historial Clínico (SOAP)
        MedicalRecord::create([
            'pet_id' => $pet->id,
            'user_id' => $vet->id,
            'branch_id' => $branch->id,
            'type' => 'consultation',
            'subjective' => 'El dueño reporta que Rocky ha estado rascándose mucho la oreja izquierda en los últimos 2 días.',
            'objective' => 'Inflamación leve en el canal auditivo externo izquierdo. Presencia de cerumen oscuro. No presenta fiebre.',
            'assessment' => 'Otitis externa leve, posiblemente fúngica o por ácaros.',
            'plan' => 'Limpieza de oídos con solución antiséptica. Aplicación de gotas óticas (OtoVet) cada 12 horas por 7 días.',
            'vital_signs' => [
                'weight' => 28.5,
                'temp' => 38.2,
                'hr' => 84,
                'rr' => 22
            ]
        ]);
    }
}
