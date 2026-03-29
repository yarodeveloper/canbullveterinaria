<?php

namespace App\Traits;

use Carbon\Carbon;

trait ParsesDocumentTemplates
{
    /**
     * Replaces placeholders in a template with actual data.
     */
    protected function parseTemplate(string $content, array $data = []): string
    {
        $replacements = [
            '{date}' => Carbon::now()->format('d/m/Y'),
            '{time}' => Carbon::now()->format('H:i'),
        ];

        // 1. Pet Information
        if (isset($data['pet'])) {
            $pet = $data['pet'];
            $replacements['{pet_name}'] = $pet->name;
            $replacements['{pet_species}'] = $pet->species ?? '---';
            $replacements['{pet_breed}'] = $pet->breed ?? '---';
            $replacements['{pet_weight}'] = $pet->weight ? $pet->weight . ' kg' : '---';
            $replacements['{pet_sex}'] = $pet->gender ?? '---';
            
            // Age calculation
            if (isset($pet->dob)) {
                $dob = Carbon::parse($pet->dob);
                $now = Carbon::now();
                
                $years = $dob->diffInYears($now);
                $months = $dob->diffInMonths($now) % 12;
                
                if ($years > 0) {
                    $ageString = $years . ($years == 1 ? ' año' : ' años');
                    if ($months > 0) {
                        $ageString .= ' y ' . $months . ($months == 1 ? ' mes' : ' meses');
                    }
                } else {
                    $ageString = $months . ($months == 1 ? ' mes' : ' meses');
                }
                $replacements['{pet_age}'] = $ageString;
            } else {
                $replacements['{pet_age}'] = '---';
            }
            
            // Link to owner
            if ($pet->owner) {
                $replacements['{client_name}'] = $pet->owner->name;
                $replacements['{client_phone}'] = $pet->owner->phone ?? '---';
                $replacements['{client_address}'] = $pet->owner->address ?? '---';
                $replacements['{client_id}'] = $pet->owner->tax_id ?? '---';
            }
        }

        // 2. Veterinarian Information
        if (isset($data['veterinarian'])) {
            $replacements['{veterinarian_name}'] = $data['veterinarian']->name;
            $replacements['{veterinarian_cedula}'] = $data['veterinarian']->professional_license ?? '---';
        }

        // 3. Branch Information
        if (isset($data['branch'])) {
            $replacements['{branch_name}'] = $data['branch']->name;
            $replacements['{branch_address}'] = $data['branch']->address ?? '---';
            $replacements['{branch_phone}'] = $data['branch']->phone ?? '---';
        }

        // 4. Custom Placeholders (Folio, etc.)
        if (isset($data['extra'])) {
            foreach ($data['extra'] as $key => $value) {
                $replacements["{{$key}}"] = $value;
            }
        }

        // Default empty placeholders if not provided
        $defaults = [
            '{pet_name}' => '_________________',
            '{client_name}' => '_________________',
            '{veterinarian_name}' => '_________________',
            '{veterinarian_cedula}' => '_________________',
            '{folio}' => '_________________',
            '{witness_name}' => '_________________',
        ];

        foreach ($defaults as $tag => $val) {
            if (!isset($replacements[$tag])) {
                $replacements[$tag] = $val;
            }
        }

        return str_replace(array_keys($replacements), array_values($replacements), $content);
    }
}
