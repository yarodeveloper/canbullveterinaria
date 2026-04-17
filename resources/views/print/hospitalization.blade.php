@php
    $settings = \App\Models\SiteSetting::all()->pluck('value', 'key');
    $logoUrl = $settings['site_logo'] ?? null;
    $primaryColor = $settings['primary_color'] ?? '#84329B';
    $secondaryColor = $settings['secondary_color'] ?? '#EC4899';
    $siteName = $settings['site_name'] ?? 'Veterinaria';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Hospitalización — {{ $hospitalization->pet?->name }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page {
            size: letter portrait;
            margin: 10mm 10mm 10mm 10mm;
        }

        body {
            font-family: 'Inter', sans-serif;
            color: #111827;
            background: white;
            padding: 15px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.3;
            font-size: 10px;
        }

        .no-print {
            display: block; width: 100%; padding: 10px;
            background: {{ $primaryColor }}; color: white; text-align: center;
            font-weight: 900; text-transform: uppercase; border: none;
            border-radius: 8px; cursor: pointer; margin-bottom: 15px;
            font-family: inherit; font-size: 11px;
        }

        @media print {
            .no-print { display: none !important; }
            body { padding: 0; max-width: 100%; }
            .section { page-break-inside: avoid; }
        }

        /* Header */
        .header-section { margin-bottom: 15px; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 10px; }
        .header-flex { display: flex; justify-content: space-between; align-items: center; }
        .clinic-name { font-size: 20px; font-weight: 900; color: {{ $primaryColor }}; }
        .report-title { text-align: right; }
        .report-title h1 { font-size: 16px; font-weight: 900; color: #111827; margin: 0; }
        .report-title p { font-size: 8px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-top: 2px; }

        /* Sections */
        .section { margin-bottom: 12px; }
        .section-header {
            background: #f3f4f6; padding: 4px 10px; border-radius: 4px;
            font-size: 8px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.05em; color: #374151; margin-bottom: 6px;
            border-left: 3px solid {{ $primaryColor }};
        }

        /* Grid */
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .info-item label { font-size: 7px; font-weight: 900; color: #9ca3af; text-transform: uppercase; display: block; }
        .info-item p { font-size: 10px; font-weight: 700; color: #111827; }

        /* Tables */
        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        th {
            background: #f9fafb; text-align: left; font-size: 7px; font-weight: 900;
            text-transform: uppercase; color: #6b7280; padding: 4px 6px;
            border-bottom: 1px solid #e5e7eb;
        }
        td { padding: 4px 6px; border-bottom: 1px solid #f3f4f6; font-size: 9px; vertical-align: top; }
        tr:last-child td { border-bottom: none; }

        .controlled-badge {
            background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
            font-size: 6px; font-weight: 900; text-transform: uppercase;
            padding: 1px 3px; border-radius: 2px;
        }

        /* Kardex Specific */
        .kardex-table td { font-size: 8px; }
        .vital-tag { font-weight: 700; color: {{ $primaryColor }}; }

        /* Summary box */
        .summary-box {
            background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;
            padding: 8px; margin-top: 5px; font-style: italic; color: #4b5563;
        }

        /* Signatures */
        .signatures { display: flex; justify-content: space-around; margin-top: 30px; text-align: center; }
        .sig-box { width: 180px; }
        .sig-line { border-top: 1px solid #111827; margin-top: 40px; padding-top: 4px; font-size: 8px; font-weight: 900; text-transform: uppercase; }

        .footer { margin-top: 20px; font-size: 7px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 8px; }
    </style>
</head>
<body>
    <button onclick="window.print()" class="no-print">🖨️ Imprimir / Guardar Reporte Clínico</button>

    <div class="header-section">
        <div class="header-flex">
            <div style="display: flex; align-items: center; gap: 15px;">
                @if($logoUrl)
                    <img src="{{ Str::startsWith($logoUrl, 'http') ? $logoUrl : asset($logoUrl) }}" style="max-height: 50px;" alt="Logo">
                @else
                    <div style="background: {{ $primaryColor }}; padding: 8px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <img src="{{ asset('icons/pet-svgrepo-com.svg') }}" style="max-height: 30px; filter: brightness(0) invert(1);">
                    </div>
                @endif
                <div>
                    @php
                        $branch = $hospitalization->branch ?? $hospitalization->pet?->branch ?? null;
                    @endphp
                    <h2 class="clinic-name" style="color: {{ $primaryColor }}; text-transform: uppercase;">{{ $branch->name ?? $siteName }}</h2>
                    <p style="font-size: 8px; color: #6b7280; font-weight: 700;">{{ $branch->address ?? '' }} | TEL: {{ $branch->phone ?? '' }}</p>
                </div>
            </div>
            <div class="report-title">
                <h1>REPORTE DE HOSPITALIZACIÓN</h1>
                <p>Expediente Clínico de Internamiento</p>
                <p style="color: {{ $primaryColor }}; font-weight: 900;">Ingreso: {{ $hospitalization->admission_date->format('d/m/Y H:i') }}</p>
            </div>
        </div>
    </div>

    <!-- Info Paciente y Dueño -->
    <div class="section">
        <div class="section-header">Información del Paciente y Propietario</div>
        <div class="info-grid">
            <div class="info-item">
                <label>Paciente</label>
                <p>{{ $hospitalization->pet?->name }}</p>
            </div>
            <div class="info-item">
                <label>Especie/Raza</label>
                <p>{{ $hospitalization->pet?->species }} / {{ $hospitalization->pet?->breed }}</p>
            </div>
            <div class="info-item">
                <label>Sexo/Edad</label>
                <p>{{ $hospitalization->pet?->gender === 'male' ? 'Macho' : 'Hembra' }} / {{ $hospitalization->pet?->dob ? \Carbon\Carbon::parse($hospitalization->pet->dob)->age . ' años' : 'N/A' }}</p>
            </div>
            <div class="info-item">
                <label>Peso Inicial</label>
                <p>{{ $hospitalization->initial_weight }} kg</p>
            </div>
            <div class="info-item">
                <label>Propietario</label>
                <p>{{ $hospitalization->pet?->owner?->name }}</p>
            </div>
            <div class="info-item">
                <label>Teléfono</label>
                <p>{{ $hospitalization->pet?->owner?->phone }}</p>
            </div>
            <div class="info-item">
                <label>Veterinario</label>
                <p>{{ $hospitalization->veterinarian?->name }}</p>
            </div>
            <div class="info-item">
                <label>Estado Actual</label>
                <p>{{ strtoupper($hospitalization->status) }}</p>
            </div>
        </div>
    </div>

    <!-- Motivo -->
    <div class="section">
        <div class="section-header">Motivo del Internamiento</div>
        <p style="font-size: 11px; font-weight: 600;">{{ $hospitalization->reason }}</p>
    </div>

    <!-- Medicación Base -->
    <div class="section">
        <div class="section-header">Tratamiento e Indicaciones Médicas</div>
        @if(count($hospitalization->medications ?? []) > 0)
            <table>
                <thead>
                    <tr>
                        <th style="width: 30%;">Medicamento</th>
                        <th>Concentración</th>
                        <th>Dosis mg/kg</th>
                        <th>Dosis Total</th>
                        <th>Vía</th>
                        <th>Notas/Frecuencia</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($hospitalization->medications as $med)
                        <tr>
                            <td>
                                @if(!empty($med['is_controlled'])) <span class="controlled-badge">⚠️</span> @endif
                                <strong>{{ $med['name'] }}</strong>
                            </td>
                            <td>{{ $med['concentration'] ?? '—' }}</td>
                            <td>{{ $med['dose_mg_kg'] ?? '—' }}</td>
                            <td>{{ $med['total_dose'] ?? '—' }}</td>
                            <td>{{ $med['route'] ?? '—' }}</td>
                            <td style="font-style: italic;">{{ $med['notes'] ?? '—' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="font-style: italic; color: #9ca3af;">No se registraron medicamentos en el plan de tratamiento.</p>
        @endif
    </div>

    <!-- Kardex de Monitoreo -->
    <div class="section">
        <div class="section-header">Kardex de Monitoreo (Signos Vitales y Evaluación Clínica)</div>
        @if($hospitalization->monitorings->count() > 0)
            <table class="kardex-table">
                <thead>
                    <tr>
                        <th style="width: 10%;">F/H</th>
                        <th style="width: 12%;">Constantes</th>
                        <th style="width: 12%;">Mucosas/LLC</th>
                        <th style="width: 10%;">E. General</th>
                        <th style="width: 8%;">Dolor</th>
                        <th style="width: 20%;">Hallazgos Físicos</th>
                        <th>Tratamiento y Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    @php
                        $monitorings = $hospitalization->monitorings->sortByDesc('created_at');
                    @endphp
                    @foreach($monitorings as $m)
                        <tr>
                            <td>
                                <strong>{{ $m->created_at->format('d/m H:i') }}</strong><br>
                                <span style="font-size: 7px; color: #6b7280;">{{ $m->recorder?->name }}</span>
                            </td>
                            <td>
                                T: <span class="vital-tag">{{ $m->temperature ?? '--' }}°C</span><br>
                                FC: <span class="vital-tag">{{ $m->heart_rate ?? '--' }}</span><br>
                                FR: <span class="vital-tag">{{ $m->respiratory_rate ?? '--' }}</span>
                            </td>
                            <td>
                                <strong>M:</strong> {{ $m->mucosa_color ?? '--' }}<br>
                                <strong>LLC:</strong> {{ $m->capillary_refill_time ?? '--' }}s
                            </td>
                            <td>
                                <strong>CC:</strong> {{ $m->bcs ?? '--' }}/5<br>
                                <strong>Ment:</strong> {{ $m->mental_state ?? '--' }}
                            </td>
                            <td style="text-align: center;">
                                <div style="font-weight: 900; font-size: 11px; color: {{ $m->pain_score > 5 ? '#dc2626' : '#84329B' }};">
                                    {{ $m->pain_score ?? '0' }}/10
                                </div>
                            </td>
                            <td>
                                <p><strong>Ganglios:</strong> {{ $m->lymph_nodes ?? '--' }}</p>
                                <p><strong>Abdom:</strong> {{ $m->abdominal_palpation ?? '--' }}</p>
                            </td>
                            <td>
                                @if($m->medication_administered)
                                    <p><strong>Fármacos:</strong> {{ $m->medication_administered }}</p>
                                @endif
                                @if($m->notes)
                                    <p style="margin-top: 2px;">{{ $m->notes }}</p>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <p style="font-style: italic; color: #9ca3af;">Sin registros de monitoreo en el kardex.</p>
        @endif
    </div>

    @if($hospitalization->discharge_notes)
        <div class="section">
            <div class="section-header">Protocolo de Alta / Conclusión de Internamiento</div>
            <div class="summary-box">
                <p><strong>Fecha de salida:</strong> {{ $hospitalization->discharge_date ? $hospitalization->discharge_date->format('d/m/Y H:i') : '—' }}</p>
                <div style="margin-top: 5px;">{{ $hospitalization->discharge_notes }}</div>
            </div>
        </div>
    @endif

    <div class="signatures">
        <div class="sig-box">
            <div class="sig-line">Firma Médico Veterinario</div>
            <p style="font-size: 7px; margin-top: 2px;">{{ $hospitalization->veterinarian?->name }}</p>
        </div>
        <div class="sig-box">
            <div class="sig-line">Firma Propietario / Responsable</div>
            <p style="font-size: 7px; margin-top: 2px;">{{ $hospitalization->pet?->owner?->name }}</p>
        </div>
    </div>

    <div class="footer">
        Generado automáticamente por el Sistema de Gestión Clínica {{ $hospitalization->branch?->name ?? $siteName }} el {{ date('d/m/Y H:i') }}. 
        Este documento es un resumen oficial del expediente de internamiento y tiene validez clínica.
    </div>
</body>
</html>
