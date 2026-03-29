@php
    $settings = \App\Models\SiteSetting::all()->pluck('value', 'key');
    $logoUrl = $settings['site_logo'] ?? null;
    $primaryColor = $settings['primary_color'] ?? '#84329B';
    $secondaryColor = $settings['secondary_color'] ?? '#EC4899';
    $siteName = $settings['site_name'] ?? 'CanBull';
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Protocolo Quirúrgico — {{ $surgery->pet?->name }} — {{ $surgery->surgery_type }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page {
            size: letter portrait;
            margin: 8mm 8mm 8mm 8mm;
        }

        body {
            font-family: 'Inter', sans-serif;
            color: #111827;
            background: white;
            padding: 10px;
            max-width: 850px;
            margin: 0 auto;
            line-height: 1.25;
            font-size: 9px;
        }

        .no-print {
            display: block; width: 100%; padding: 10px;
            background: {{ $primaryColor }}; color: white; text-align: center;
            font-weight: 900; text-transform: uppercase; border: none;
            border-radius: 6px; cursor: pointer; margin-bottom: 12px;
            font-family: inherit; font-size: 10px;
        }

        @media print {
            .no-print { display: none !important; }
            body { padding: 0; max-width: 100%; }
            .section { page-break-inside: avoid; }
        }

        /* Header */
        .header-section { margin-bottom: 12px; border-bottom: 2px solid {{ $primaryColor }}; padding-bottom: 8px; }
        .header-flex { display: flex; justify-content: space-between; align-items: flex-start; }
        .report-title { text-align: right; }
        .report-title h1 { font-size: 14px; font-weight: 900; color: #111827; margin: 0; text-transform: uppercase; }
        .report-title p { font-size: 8px; font-weight: 700; color: {{ $primaryColor }}; text-transform: uppercase; margin-top: 1px; }

        /* Sections */
        .section { margin-bottom: 10px; }
        .section-header {
            background: {{ $primaryColor }}10; padding: 3px 8px; border-radius: 4px;
            font-size: 8px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.05em; color: {{ $primaryColor }}; margin-bottom: 5px;
            border-left: 3px solid {{ $primaryColor }};
        }

        /* Info Boxes */
        .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .info-item label { font-size: 7px; font-weight: 900; color: #9ca3af; text-transform: uppercase; display: block; }
        .info-item p { font-size: 9px; font-weight: 700; color: #111827; }

        /* Vitals Grid */
        .vitals-grid { 
            display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; 
            background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0;
        }
        .vitals-item { text-align: center; border-right: 1px solid #e2e8f0; }
        .vitals-item:last-child { border-right: none; }
        .vitals-item label { font-size: 6px; color: #64748b; font-weight: 900; text-transform: uppercase; }
        .vitals-item p { font-size: 10px; font-weight: 900; color: #1e293b; }

        /* Tables for Meds */
        table { width: 100%; border-collapse: collapse; margin-top: 3px; }
        th {
            background: #f9fafb; text-align: left; font-size: 7px; font-weight: 900;
            text-transform: uppercase; color: #6b7280; padding: 3px 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        td { padding: 3px 5px; border-bottom: 1px solid #f3f4f6; font-size: 8px; }
        .controlled-badge { color: #dc2626; font-weight: 900; font-size: 7px; }

        /* Checklists */
        .checklist-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 4px; }
        .check-item { display: flex; align-items: center; gap: 4px; font-size: 8px; }
        .check-box { width: 10px; height: 10px; border: 1px solid #d1d5db; border-radius: 2px; text-align: center; line-height: 8px; font-weight: 900; color: #059669; }

        /* Notes box */
        .notes-box {
            background: white; border: 1px solid #e5e7eb; border-radius: 4px;
            padding: 6px; margin-top: 4px; font-size: 9px; line-height: 1.4; color: #374151; min-height: 40px;
        }

        /* ASA Badge */
        .asa-badge {
            background: #111827; color: white; padding: 2px 6px; border-radius: 10px;
            font-size: 9px; font-weight: 900; display: inline-block;
        }

        /* Signatures */
        .signatures { display: flex; justify-content: space-around; margin-top: 25px; text-align: center; }
        .sig-box { width: 25%; }
        .sig-line { border-top: 1px solid #111827; margin-top: 35px; padding-top: 3px; font-size: 7px; font-weight: 900; text-transform: uppercase; }

        .footer { margin-top: 15px; font-size: 7px; color: #9ca3af; text-align: center; border-top: 1px solid #f3f4f6; padding-top: 5px; }
    </style>
</head>
<body>
    <button onclick="window.print()" class="no-print">🖨️ Imprimir Protocolo Quirúrgico Completo</button>

    <div class="header-section">
        <div class="header-flex">
            <div>
                @if($logoUrl)
                    <img src="{{ Str::startsWith($logoUrl, 'http') ? $logoUrl : asset($logoUrl) }}" style="max-height: 45px;" alt="Logo">
                @else
                @php
                    $branch = $surgery->branch ?? $surgery->pet?->branch ?? null;
                    $branchName = $branch->name ?? $siteName;
                @endphp
                <div style="font-size: 18px; font-weight: 900; color: {{ $primaryColor }}; text-transform: uppercase;">{{ $branchName }}</div>
                <p style="font-size: 7px; color: #6b7280; font-weight: 700;">{{ $branch->address ?? '' }} | TEL: {{ $branch->phone ?? '' }}</p>
            </div>
            <div class="report-title">
                <h1>PROTOCOLO DE CIRUGÍA</h1>
                <p>{{ $surgery->surgery_type }}</p>
                <p style="color: #111827;">Estado: <strong>{{ strtoupper($surgery->status) }}</strong></p>
            </div>
        </div>
    </div>

    <!-- Info General -->
    <div class="section">
        <div class="section-header">Información del Paciente y Equipo Médico</div>
        <div class="info-grid">
            <div class="info-item"><label>Paciente</label><p>{{ $surgery->pet?->name }}</p></div>
            <div class="info-item"><label>Especie/Raza</label><p>{{ $surgery->pet?->species }} / {{ $surgery->pet?->breed }}</p></div>
            <div class="info-item"><label>Dueño</label><p>{{ $surgery->pet?->owner?->name }}</p></div>
            <div class="info-item"><label>Cirujano</label><p>{{ $surgery->leadSurgeon?->name }}</p></div>
            
            <div class="info-item"><label>Fecha Cirugía</label><p>{{ $surgery->scheduled_at?->format('d/m/Y') ?? 'N/A' }}</p></div>
            <div class="info-item"><label>Inicio/Fin</label><p>{{ $surgery->start_time?->format('H:i') ?? '--:--' }} - {{ $surgery->end_time?->format('H:i') ?? '--:--' }}</p></div>
            <div class="info-item"><label>Riesgo ASA</label><p><span class="asa-badge">ASA {{ $surgery->asa_classification ?? '-' }}</span></p></div>
            <div class="info-item"><label>Anestesiólogo</label><p>{{ $surgery->anesthesiologist?->name ?? 'N/A' }}</p></div>
        </div>
    </div>

    <!-- Fase 1: Pre-operatorio -->
    <div class="section">
        <div class="section-header">Fase I: Evaluación Pre-Quirúrgica</div>
        <div class="checklist-grid">
            @foreach($surgery->checklist['pre_op'] ?? [] as $item)
                <div class="check-item">
                    <div class="check-box">{{ !empty($item['checked']) ? '✓' : '' }}</div>
                    {{ $item['label'] }}
                </div>
            @endforeach
        </div>
        
        <div style="margin-top: 8px;">
            <label style="font-size: 7px; font-weight: 900; color: #6b7280; text-transform: uppercase;">Fármacos Pre-medicación:</label>
            @if(count($surgery->pre_operative_medications ?? []) > 0)
                <table>
                    <thead><tr><th>Medicamento</th><th>Dosis/Concentración</th><th>Vía</th><th>Lote</th><th>Notas</th></tr></thead>
                    <tbody>
                        @foreach($surgery->pre_operative_medications as $med)
                            <tr><td>@if(!empty($med['is_controlled'])) <span class="controlled-badge">⚠️</span> @endif <strong>{{ $med['name'] }}</strong></td><td>{{ $med['total_dose'] ?? '--' }} ({{ $med['concentration'] ?? '--' }})</td><td>{{ $med['route'] ?? '--' }}</td><td>{{ $med['lot_number'] ?? '--' }}</td><td>{{ $med['notes'] ?? '--' }}</td></tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <p style="font-style: italic; color: #9ca3af; font-size: 8px;">Sin medicamentos registrados.</p>
            @endif
        </div>

        <div class="notes-box"><strong>Observaciones Pre-operatorias:</strong><br>{{ $surgery->pre_op_notes }}</div>
    </div>

    <!-- Fase 2: Intra-operatorio -->
    <div class="section">
        <div class="section-header">Fase II: Registro Intra-Operatorio y Anestésico</div>
        <div class="vitals-grid">
            <div class="vitals-item"><label>Peso</label><p>{{ $surgery->vital_signs['weight'] ?? '--' }} kg</p></div>
            <div class="vitals-item"><label>Temp</label><p>{{ $surgery->vital_signs['temp'] ?? '--' }} °C</p></div>
            <div class="vitals-item"><label>F.C.</label><p>{{ $surgery->vital_signs['hr'] ?? '--' }} bpm</p></div>
            <div class="vitals-item"><label>F.R.</label><p>{{ $surgery->vital_signs['rr'] ?? '--' }} rpm</p></div>
            <div class="vitals-item"><label>TLLC</label><p>{{ $surgery->vital_signs['crt'] ?? '--' }} s</p></div>
            <div class="vitals-item"><label>C.C.</label><p>{{ $surgery->vital_signs['bcs'] ?? '--' }}/5</p></div>
        </div>

        <div class="checklist-grid">
            @foreach($surgery->checklist['intra_op'] ?? [] as $item)
                <div class="check-item">
                    <div class="check-box">{{ !empty($item['checked']) ? '✓' : '' }}</div>
                    {{ $item['label'] }}
                </div>
            @endforeach
        </div>

        <div style="margin-top: 8px;">
            <label style="font-size: 7px; font-weight: 900; color: #6b7280; text-transform: uppercase;">Mantenimiento y Fluidos:</label>
            @if(count($surgery->intra_operative_medications ?? []) > 0)
                <table>
                    <thead><tr><th>Agente/Fluido</th><th>Vol/Dosis</th><th>Vía</th><th>Notas</th></tr></thead>
                    <tbody>
                        @foreach($surgery->intra_operative_medications as $med)
                            <tr><td><strong>{{ $med['name'] }}</strong></td><td>{{ $med['volume_ml'] ?? $med['total_dose'] ?? '--' }}</td><td>{{ $med['route'] ?? '--' }}</td><td>{{ $med['notes'] ?? '--' }}</td></tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <div class="notes-box"><strong>Técnica y Hallazgos Quirúrgicos (Narrativa):</strong><br>{{ $surgery->intra_op_notes }}</div>
    </div>

    <!-- Fase 3: Post-operatorio -->
    <div class="section">
        <div class="section-header">Fase III: Recuperación y Plan de Alta</div>
        <div class="vitals-grid" style="background: #ecfdf5; border-color: #a7f3d0; margin-bottom: 8px;">
            <div class="vitals-item"><label>Temp Post</label><p>{{ $surgery->post_vital_signs['temp'] ?? '--' }} °C</p></div>
            <div class="vitals-item"><label>F.C. Post</label><p>{{ $surgery->post_vital_signs['hr'] ?? '--' }} bpm</p></div>
            <div class="vitals-item"><label>F.R. Post</label><p>{{ $surgery->post_vital_signs['rr'] ?? '--' }} rpm</p></div>
            <div class="vitals-item"><label>TLLC Post</label><p>{{ $surgery->post_vital_signs['crt'] ?? '--' }} s</p></div>
            <div class="vitals-item"><label>Puntos</label><p>Suturado</p></div>
            <div class="vitals-item"><label>Estado</label><p>Estable</p></div>
        </div>

        <div class="checklist-grid">
            @foreach($surgery->checklist['post_op'] ?? [] as $item)
                <div class="check-item">
                    <div class="check-box">{{ !empty($item['checked']) ? '✓' : '' }}</div>
                    {{ $item['label'] }}
                </div>
            @endforeach
        </div>

        <div style="margin-top: 8px;">
            <label style="font-size: 7px; font-weight: 900; color: #6b7280; text-transform: uppercase;">Medicación Post-Op / Receta:</label>
            @if(count($surgery->post_operative_medications ?? []) > 0)
                <table>
                    <thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia/Vía</th><th>Notas</th></tr></thead>
                    <tbody>
                        @foreach($surgery->post_operative_medications as $med)
                            <tr><td><strong>{{ $med['name'] }}</strong></td><td>{{ $med['total_dose'] ?? '--' }}</td><td>{{ $med['route'] ?? '--' }}</td><td>{{ $med['notes'] ?? '--' }}</td></tr>
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>

        <div class="notes-box"><strong>Indicaciones de Recuperación y Alta:</strong><br>{{ $surgery->post_op_notes }}</div>
    </div>

    <div class="signatures">
        <div class="sig-box"><div class="sig-line">Cirujano Principal</div><p>{{ $surgery->leadSurgeon?->name }}</p></div>
        <div class="sig-box"><div class="sig-line">Anestesiólogo</div><p>{{ $surgery->anesthesiologist?->name }}</p></div>
        <div class="sig-box"><div class="sig-line">Responsable / Dueño</div><p>{{ $surgery->pet?->owner?->name }}</p></div>
    </div>

    <div class="footer">
        Este documento constituye el protocolo oficial de cirugía de {{ $surgery->branch?->name ?? $siteName }}. 
        Generado el {{ date('d/m/Y H:i') }}. Copia fiel del expediente electrónico.
    </div>
</body>
</html>
