@php
    $settings = \App\Models\SiteSetting::all()->pluck('value', 'key');
    $primaryColor = $settings['primary_color'] ?? '#84329B';
    $secondaryColor = $settings['secondary_color'] ?? '#a855f7';
    $siteName = $settings['site_name'] ?? 'Veterinaria';
    $logoUrl = $settings['site_logo'] ?? null;
    $vitalSigns = $record->vital_signs ?? [];
    $anamnesis = $record->anamnesis ?? [];
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Historia Clínica — {{ $record->id }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page {
            size: letter portrait;
            margin: 10mm;
        }

        body {
            font-family: 'Inter', sans-serif;
            color: #1f2937;
            background: white;
            padding: 15px;
            line-height: 1.4;
            font-size: 11px;
        }

        .no-print {
            display: block; width: 100%; padding: 10px;
            background: {{ $primaryColor }}; color: white; text-align: center;
            font-weight: 900; text-transform: uppercase; border: none;
            border-radius: 10px; cursor: pointer; margin-bottom: 20px;
            font-family: inherit; font-size: 11px;
        }

        @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
        }

        .report-header {
            background: linear-gradient(135deg, {{ $primaryColor }}, {{ $secondaryColor }});
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .report-header h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
        .report-header .meta { text-align: right; }
        .report-header .meta p { font-size: 9px; font-weight: 700; opacity: 0.8; margin-top: 2px; }

        .section {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            margin-bottom: 10px;
            overflow: hidden;
            background: #fdfdfd;
        }

        .section-header {
            background: #f1f5f9;
            padding: 6px 12px;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
        }

        .section-content { padding: 10px 12px; }

        .grid { display: grid; gap: 10px; }
        .grid-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-3 { grid-template-columns: repeat(3, 1fr); }
        .grid-4 { grid-template-columns: repeat(4, 1fr); }

        .data-point label {
            display: block;
            font-size: 8px;
            font-weight: 900;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 1px;
        }

        .data-point span {
            font-size: 10px;
            font-weight: 700;
            color: #1e293b;
        }

        .soap-container { margin-top: 5px; }
        .soap-block {
            border-left: 3px solid {{ $primaryColor }};
            padding: 8px 12px;
            background: #f9fafb;
            margin-bottom: 8px;
        }
        .soap-block header {
            font-size: 8px;
            font-weight: 900;
            color: {{ $primaryColor }};
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .soap-block .text { font-size: 11px; white-space: pre-wrap; font-weight: 500; }

        .tag {
            display: inline-block;
            padding: 2px 5px;
            background: #e0f2fe;
            color: #0369a1;
            border-radius: 4px;
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .footer {
            margin-top: 20px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="no-print">🖨️ Imprimir Historial Clínico</button>

    <header class="report-header">
        <div style="display: flex; align-items: center; gap: 15px;">
            @if($logoUrl)
                <img src="{{ Str::startsWith($logoUrl, 'http') ? $logoUrl : asset($logoUrl) }}" style="max-height: 45px; width: auto; filter: brightness(0) invert(1);">
            @else
                <div style="background: white; padding: 5px; border-radius: 8px;">
                    <img src="{{ asset('icons/pet-svgrepo-com.svg') }}" style="max-height: 30px;">
                </div>
            @endif
            <div>
                <h1>Historial Clínico</h1>
                <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">{{ $record->branch?->name ?? $siteName }}</p>
            </div>
        </div>
        <div class="meta">
            <p>Folio: MR-{{ str_pad($record->id, 6, '0', STR_PAD_LEFT) }}</p>
            <p>Fecha: {{ $record->created_at->format('d/m/Y H:i') }}</p>
            <p>Médico: {{ $record->veterinarian?->name }}</p>
        </div>
    </header>

    <div class="section">
        <div class="section-header">Información del Paciente y Propietario</div>
        <div class="section-content">
            <div class="grid grid-4">
                <div class="data-point"><label>Paciente</label><span>{{ $record->pet->name }}</span></div>
                <div class="data-point"><label>Especie / Raza</label><span>{{ $record->pet->species }} ({{ $record->pet->breed->name ?? $record->pet->breed ?? 'Mestizo' }})</span></div>
                <div class="data-point"><label>Sexo</label><span>{{ $record->pet->gender }}</span></div>
                <div class="data-point"><label>Edad</label><span>{{ $record->pet->dob ? \Carbon\Carbon::parse($record->pet->dob)->age . ' años' : '—' }}</span></div>
                <div class="data-point"><label>Propietario</label><span>{{ $record->pet->owner?->name ?? '—' }}</span></div>
                <div class="data-point"><label>Teléfono</label><span>{{ $record->pet->owner?->phone ?? '—' }}</span></div>
            </div>
        </div>
    </div>

    <div class="grid grid-2">
        <div class="section">
            <div class="section-header">Constantes Vitales</div>
            <div class="section-content">
                <div class="grid grid-3">
                    <div class="data-point"><label>Peso</label><span>{{ $vitalSigns['weight'] ?? '--' }} kg</span></div>
                    <div class="data-point"><label>Temperatura</label><span>{{ $vitalSigns['temp'] ?? '--' }} °C</span></div>
                    <div class="data-point"><label>Frec. Card.</label><span>{{ $vitalSigns['hr'] ?? '--' }} bpm</span></div>
                    <div class="data-point"><label>Frec. Resp.</label><span>{{ $vitalSigns['rr'] ?? '--' }} rpm</span></div>
                    <div class="data-point"><label>Mucosas</label><span>{{ $vitalSigns['mucous'] ?? '--' }}</span></div>
                    <div class="data-point"><label>TLLC</label><span>{{ $vitalSigns['tllc'] ?? '--' }} s</span></div>
                </div>
            </div>
        </div>
        <div class="section">
            <div class="section-header">Historial / Anamnesis</div>
            <div class="section-content">
                <div class="data-point"><label>Motivo</label><span>{{ $anamnesis['reason'] ?? 'Sin motivo registrado.' }}</span></div>
                <div class="grid grid-2" style="margin-top: 10px;">
                    <div class="data-point"><label>Mood</label><span>{{ $anamnesis['mood'] ?? '--' }}</span></div>
                    <div class="data-point"><label>Apetito</label><span>{{ $anamnesis['appetite'] ?? '--' }}</span></div>
                </div>
                @if(($anamnesis['vomiting'] ?? '') === 'Presente')
                    <div class="tag" style="margin-top: 5px; background: #fee2e2; color: #b91c1c;">Vómito Detectado</div>
                @endif
            </div>
        </div>
    </div>

    <div class="section" style="margin-top: 5px;">
        <div class="section-header">Hallazgos y Evaluación (SOAP)</div>
        <div class="section-content soap-container">
            <div class="soap-block">
                <header>Subjetivo</header>
                <div class="text">{{ $record->subjective ?? 'Sin observaciones' }}</div>
            </div>
            <div class="soap-block">
                <header>Objetivo</header>
                <div class="text">{{ $record->objective ?? 'Sin hallazgos físicos' }}</div>
            </div>
            <div class="soap-block">
                <header>Diagnóstico / Análisis</header>
                <div class="text" style="font-weight: 700;">{{ $record->assessment ?? 'Sin diagnóstico definitivo' }}</div>
            </div>
            <div class="soap-block" style="background: #e0f2fe; border-color: #0ea5e9;">
                <header style="color: #0ea5e9;">Indicaciones / Plan de Tratamiento</header>
                @if(!empty($record->medications))
                    <div class="medications-mini-list" style="margin-bottom: 10px;">
                        @foreach($record->medications as $med)
                            <div style="font-size: 10px; margin-bottom: 5px; border-bottom: 1px dashed #bae6fd; padding-bottom: 3px;">
                                <strong style="text-transform: uppercase;">{{ $med['name'] }}</strong>: 
                                <span>{{ $med['dosage'] }} — {{ $med['frequency'] }} — {{ $med['duration'] }}</span>
                                @if(!empty($med['notes']))
                                    <p style="font-size: 8px; font-style: italic; color: #64748b;">Nota: {{ $med['notes'] }}</p>
                                @endif
                            </div>
                        @endforeach
                    </div>
                @endif
                <div class="text">{{ $record->plan ?? 'Sin indicaciones registradas.' }}</div>
            </div>
        </div>
    </div>

    @if($record->attachments->count() > 0)
    <div class="section">
        <div class="section-header">Evidencia Adjunta (Imágenes/PDFs)</div>
        <div class="section-content">
            <p style="font-size: 9px; color: #64748b;">Se adjuntaron <strong>{{ $record->attachments->count() }}</strong> archivos a este registro médico.</p>
        </div>
    </div>
    @endif

    <div class="footer">
        <div>
            <p>Firma Médico:</p>
            <p style="margin-top: 25px; border-top: 1px solid #1e293b; display: inline-block; min-width: 150px; color: #1e293b; font-weight: 700;">{{ $record->veterinarian?->name }}</p>
        </div>
        <div style="text-align: right;">
            <p>{{ $record->branch?->name ?? $siteName }} Software Veterinario — Registro #{{ $record->id }}</p>
            @php
                $branch = $record->branch ?? null;
            @endphp
            @if($branch && $branch->phone) <p>Tel: {{ $branch->phone }}</p> @endif
            <p>Ced: {{ $record->veterinarian?->professional_id ?? 'N/A' }}</p>
        </div>
    </div>
</body>
</html>
