<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PetBreedSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $breeds = [
            // --- CANINOS ---
            ['species' => 'Canino', 'name' => 'Affenpinscher', 'size' => 'Pequeño', 'adult_weight' => '3-6 kg', 'notes' => 'Juguetón, "cara de mono"'],
            ['species' => 'Canino', 'name' => 'Bichón Maltés', 'size' => 'Pequeño', 'adult_weight' => '1.8-4 kg', 'notes' => 'Pelo blanco largo, cariñoso'],
            ['species' => 'Canino', 'name' => 'Chihuahua', 'size' => 'Pequeño', 'adult_weight' => '1.5-3 kg', 'notes' => 'El más pequeño del mundo'],
            ['species' => 'Canino', 'name' => 'Pomerania (Pomeranian)', 'size' => 'Pequeño', 'adult_weight' => '1.8-3.5 kg', 'notes' => 'Peludo como zorro, energético'],
            ['species' => 'Canino', 'name' => 'Pug', 'size' => 'Pequeño', 'adult_weight' => '6-8 kg', 'notes' => 'Cara arrugada, muy sociable'],
            ['species' => 'Canino', 'name' => 'Shih Tzu', 'size' => 'Pequeño', 'adult_weight' => '4-7 kg', 'notes' => 'Pelo largo, tranquilo'],
            ['species' => 'Canino', 'name' => 'Yorkshire Terrier', 'size' => 'Pequeño', 'adult_weight' => '2-3.2 kg', 'notes' => 'Pelo sedoso, valiente'],
            ['species' => 'Canino', 'name' => 'Beagle', 'size' => 'Mediano', 'adult_weight' => '9-11 kg', 'notes' => 'Nariz infalible, alegre'],
            ['species' => 'Canino', 'name' => 'Border Collie', 'size' => 'Mediano', 'adult_weight' => '14-20 kg', 'notes' => 'El más inteligente'],
            ['species' => 'Canino', 'name' => 'Bóxer', 'size' => 'Mediano', 'adult_weight' => '25-32 kg', 'notes' => 'Activo, protector'],
            ['species' => 'Canino', 'name' => 'Bulldog Francés', 'size' => 'Mediano', 'adult_weight' => '8-14 kg', 'notes' => 'Orejas grandes, tranquilo'],
            ['species' => 'Canino', 'name' => 'Chow Chow', 'size' => 'Mediano', 'adult_weight' => '20-32 kg', 'notes' => 'Lengua azul, independiente'],
            ['species' => 'Canino', 'name' => 'Cocker Spaniel', 'size' => 'Mediano', 'adult_weight' => '12-15 kg', 'notes' => 'Pelo bonito, familiar'],
            ['species' => 'Canino', 'name' => 'Dálmata', 'size' => 'Mediano', 'adult_weight' => '20-32 kg', 'notes' => 'Manchado, energético'],
            ['species' => 'Canino', 'name' => 'Fox Terrier', 'size' => 'Mediano', 'adult_weight' => '7-9 kg', 'notes' => 'Cazador nato, valiente'],
            ['species' => 'Canino', 'name' => 'Pitbull Terrier Americano', 'size' => 'Mediano', 'adult_weight' => '13-27 kg', 'notes' => 'Fuerte, leal (con socialización)'],
            ['species' => 'Canino', 'name' => 'Shiba Inu', 'size' => 'Mediano', 'adult_weight' => '7-11 kg', 'notes' => 'Independiente, como un zorro'],
            ['species' => 'Canino', 'name' => 'Dóberman', 'size' => 'Grande', 'adult_weight' => '32-45 kg', 'notes' => 'Elegante, guardián'],
            ['species' => 'Canino', 'name' => 'Golden Retriever', 'size' => 'Grande', 'adult_weight' => '25-34 kg', 'notes' => 'Cariñoso, excelente con niños'],
            ['species' => 'Canino', 'name' => 'Gran Danés', 'size' => 'Grande', 'adult_weight' => '45-90 kg', 'notes' => '"Gentil gigante"'],
            ['species' => 'Canino', 'name' => 'Labrador Retriever', 'size' => 'Grande', 'adult_weight' => '25-36 kg', 'notes' => 'El más popular, juguetón'],
            ['species' => 'Canino', 'name' => 'Mastín Inglés', 'size' => 'Grande', 'adult_weight' => '80-100 kg', 'notes' => 'Protector, calmado'],
            ['species' => 'Canino', 'name' => 'Pastor Alemán', 'size' => 'Grande', 'adult_weight' => '22-40 kg', 'notes' => 'Leal, versátil'],
            ['species' => 'Canino', 'name' => 'Rottweiler', 'size' => 'Grande', 'adult_weight' => '35-60 kg', 'notes' => 'Fuerte, confiable'],
            ['species' => 'Canino', 'name' => 'San Bernardo', 'size' => 'Grande', 'adult_weight' => '64-120 kg', 'notes' => 'Gigante bonachón, rescatador'],
            ['species' => 'Canino', 'name' => 'Terranova', 'size' => 'Grande', 'adult_weight' => '45-68 kg', 'notes' => 'Nadador experto, gentil'],

            // --- FELINOS ---
            ['species' => 'Felino', 'name' => 'Bambino', 'size' => 'Pequeño', 'adult_weight' => '2-4 kg', 'notes' => 'Sin pelo, patas cortas'],
            ['species' => 'Felino', 'name' => 'Cornish Rex', 'size' => 'Pequeño', 'adult_weight' => '2.5-4.5 kg', 'notes' => 'Pelo rizado, juguetón'],
            ['species' => 'Felino', 'name' => 'Munchkin', 'size' => 'Pequeño', 'adult_weight' => '2.5-4 kg', 'notes' => 'Patas cortas, activo'],
            ['species' => 'Felino', 'name' => 'Singapura', 'size' => 'Pequeño', 'adult_weight' => '2-4 kg', 'notes' => 'El más pequeño, curioso'],
            ['species' => 'Felino', 'name' => 'Abisinio', 'size' => 'Mediano', 'adult_weight' => '3-5.5 kg', 'notes' => 'Activo, elegante'],
            ['species' => 'Felino', 'name' => 'Americano de Pelo Corto', 'size' => 'Mediano', 'adult_weight' => '3.5-6 kg', 'notes' => 'Robusto, adaptable'],
            ['species' => 'Felino', 'name' => 'Azul Ruso', 'size' => 'Mediano', 'adult_weight' => '3-5 kg', 'notes' => 'Pelo azul-gris, afectuoso'],
            ['species' => 'Felino', 'name' => 'Balinés', 'size' => 'Mediano', 'adult_weight' => '3-5 kg', 'notes' => 'Pelo largo, siamés con cola'],
            ['species' => 'Felino', 'name' => 'Bengalí', 'size' => 'Mediano', 'adult_weight' => '4-6 kg', 'notes' => 'Manchado como leopardo, enérgico'],
            ['species' => 'Felino', 'name' => 'Británico Shorthair', 'size' => 'Mediano', 'adult_weight' => '4-7 kg', 'notes' => 'Redondo, tranquilo'],
            ['species' => 'Felino', 'name' => 'Burmés', 'size' => 'Mediano', 'adult_weight' => '3-5 kg', 'notes' => 'Extrovertido, musculoso'],
            ['species' => 'Felino', 'name' => 'Europeo Común', 'size' => 'Mediano', 'adult_weight' => '3.5-6 kg', 'notes' => 'El "gato de casa" típico'],
            ['species' => 'Felino', 'name' => 'Oriental', 'size' => 'Mediano', 'adult_weight' => '4-6 kg', 'notes' => 'Orejas grandes, vocal'],
            ['species' => 'Felino', 'name' => 'Persa', 'size' => 'Mediano', 'adult_weight' => '4-7 kg', 'notes' => 'Cara plana, pelo largo'],
            ['species' => 'Felino', 'name' => 'Siamés', 'size' => 'Mediano', 'adult_weight' => '4-6 kg', 'notes' => 'Vocal, apegado'],
            ['species' => 'Felino', 'name' => 'Sphynx', 'size' => 'Mediano', 'adult_weight' => '3-5 kg', 'notes' => 'Sin pelo, cálido'],
            ['species' => 'Felino', 'name' => 'Bosque de Noruega', 'size' => 'Grande', 'adult_weight' => '5-9 kg', 'notes' => 'Robusto, pelo semilargo'],
            ['species' => 'Felino', 'name' => 'Chausie', 'size' => 'Grande', 'adult_weight' => '6-12 kg', 'notes' => 'Híbrido, atlético'],
            ['species' => 'Felino', 'name' => 'Maine Coon', 'size' => 'Grande', 'adult_weight' => '6-11 kg', 'notes' => 'Gigante gentil, cola larga'],
            ['species' => 'Felino', 'name' => 'Nebelung', 'size' => 'Grande', 'adult_weight' => '5-8 kg', 'notes' => 'Pelo largo gris, tímido'],
            ['species' => 'Felino', 'name' => 'Ragdoll', 'size' => 'Grande', 'adult_weight' => '5.5-9 kg', 'notes' => 'Relajado como un trapo'],
            ['species' => 'Felino', 'name' => 'Savannah', 'size' => 'Grande', 'adult_weight' => '5-11 kg', 'notes' => 'Híbrido alto, manchado'],
            ['species' => 'Felino', 'name' => 'Siberiano', 'size' => 'Grande', 'adult_weight' => '6-10 kg', 'notes' => 'Hipolergénico, fuerte'],

            // --- OTROS / EXÓTICOS ---
            ['species' => 'Otros', 'name' => 'Hurón (Ferret)', 'size' => 'Pequeño', 'adult_weight' => '0.7-2 kg', 'notes' => 'Muy activo, curioso y sociable.'],
            ['species' => 'Otros', 'name' => 'Cuyo (Cobaya)', 'size' => 'Pequeño', 'adult_weight' => '0.7-1.2 kg', 'notes' => 'Tranquilo, herbívoro, vocalizador.'],
            ['species' => 'Otros', 'name' => 'Conejo Enano', 'size' => 'Pequeño', 'adult_weight' => '0.8-1.5 kg', 'notes' => 'Asustadizo, requiere espacio.'],
            ['species' => 'Otros', 'name' => 'Conejo Belier', 'size' => 'Pequeño', 'adult_weight' => '1.5-2.5 kg', 'notes' => 'Orejas caídas, dócil.'],
            ['species' => 'Otros', 'name' => 'Hamster Sirio', 'size' => 'Pequeño', 'adult_weight' => '100-150g', 'notes' => 'Nocturno, territorial.'],
            ['species' => 'Otros', 'name' => 'Canario', 'size' => 'Pequeño', 'adult_weight' => '15-30g', 'notes' => 'Ave cantora, delicada.'],
            ['species' => 'Otros', 'name' => 'Periquito Australiano', 'size' => 'Pequeño', 'adult_weight' => '30-40g', 'notes' => 'Ave social, inteligente.'],
            ['species' => 'Otros', 'name' => 'Ninfa (Cockatiel)', 'size' => 'Pequeño', 'adult_weight' => '80-120g', 'notes' => 'Crestuda, amigable.'],
            ['species' => 'Otros', 'name' => 'Loro Huasteco', 'size' => 'Mediano', 'adult_weight' => '300-500g', 'notes' => 'Inteligente, imitador.'],
            ['species' => 'Otros', 'name' => 'Tortuga Japonesa', 'size' => 'Pequeño', 'adult_weight' => '0.5-2 kg', 'notes' => 'Acuática, requiere filtrado.'],
            ['species' => 'Otros', 'name' => 'Erizo Africano', 'size' => 'Pequeño', 'adult_weight' => '250-600g', 'notes' => 'Nocturno, solitario.'],
            ['species' => 'Otros', 'name' => 'Chinchilla', 'size' => 'Pequeño', 'adult_weight' => '400-800g', 'notes' => 'Pelo extremadamente suave, saltarina.'],
        ];

        foreach ($breeds as $breed) {
            \App\Models\PetBreed::updateOrCreate(
                ['species' => $breed['species'], 'name' => $breed['name']],
                [
                    'size' => $breed['size'],
                    'adult_weight' => $breed['adult_weight'],
                    'notes' => $breed['notes']
                ]
            );
        }
    }
}
