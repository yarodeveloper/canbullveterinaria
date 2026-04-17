@php
    $settings = \App\Models\SiteSetting::all()->pluck('value', 'key');
    $logoUrl = $settings['site_logo'] ?? null;
    $primaryColor = $settings['primary_color'] ?? '#84329B';
    $secondaryColor = $settings['secondary_color'] ?? '#581c87';
    $siteName = $settings['site_name'] ?? 'Veterinaria';
    $copies = [
        ['type' => 'clinic', 'label' => 'COPIA CLÍNICA — HOJA TÉCNICA'],
        ['type' => 'owner', 'label' => 'COPIA PROPIETARIO — EXPEDIENTE OFICIAL']
    ];
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte de Eutanasia — {{ $euthanasia->folio }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page {
            size: letter portrait;
            margin: 15mm 15mm 15mm 15mm;
        }

        body {
            font-family: 'Inter', sans-serif;
            color: #111827;
            background: white;
            padding: 24px;
            max-width: 780px;
            margin: 0 auto;
            line-height: 1.45;
            font-size: 11px;
        }

        /* Botón de impresión */
        .print-btn {
            display: block; width: 100%; padding: 12px;
            background: {{ $primaryColor }}; color: white; text-align: center;
            font-weight: 900; text-transform: uppercase; border: none;
            border-radius: 10px; cursor: pointer; margin-bottom: 18px;
            font-family: inherit; font-size: 12px; letter-spacing: 0.05em;
        }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0; max-width: 100%; }
            .section { page-break-inside: avoid; }
            .signatures { page-break-inside: avoid; }
            .page-break { page-break-before: always; }
        }
        .page-container { width: 100%; }

        /* Header del reporte */
        .header-bar {
            background: linear-gradient(135deg, {{ $secondaryColor }}, {{ $primaryColor }});
            color: white;
            padding: 16px 22px;
            border-radius: 10px;
            margin-bottom: 14px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .header-bar h1 { font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
        .header-bar .subtitle { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-top: 3px; }
        .header-bar .folio { font-size: 11px; font-weight: 700; font-family: monospace; opacity: 0.8; text-align: right; }
        .header-bar .folio span { font-size: 15px; font-weight: 900; display: block; opacity: 1; }

        /* Secciones */
        .section {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 10px;
        }
        .section-title {
            font-size: 8px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            color: #6b7280;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .section-title::before {
            content: '';
            display: inline-block;
            width: 5px; height: 5px;
            border-radius: 50%;
            background: {{ $primaryColor }};
        }

        /* Grid de info */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px 16px;
        }
        .info-grid.col2 { grid-template-columns: repeat(2, 1fr); }
        .info-grid.col4 { grid-template-columns: repeat(4, 1fr); }
        .info-item label {
            font-size: 8px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.08em; color: #9ca3af; display: block; margin-bottom: 1px;
        }
        .info-item p {
            font-size: 11px; font-weight: 700; color: #111827;
        }

        /* Tabla de medicamentos */
        table { width: 100%; border-collapse: collapse; font-size: 9px; }
        th {
            background: #f3f4f6;
            text-align: left;
            font-size: 7px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.08em; color: #6b7280;
            padding: 5px 7px;
            border-bottom: 2px solid #e5e7eb;
        }
        td {
            padding: 5px 7px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
        }
        tr:last-child td { border-bottom: none; }
        .controlled-badge {
            background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
            font-size: 7px; font-weight: 900; text-transform: uppercase;
            padding: 1px 4px; border-radius: 3px; margin-right: 3px;
        }
        .desc-box {
            background: white; border: 1px solid #e5e7eb;
            border-radius: 6px; padding: 8px 12px;
            font-size: 10px; color: #374151; line-height: 1.6;
            font-style: italic;
        }

        /* Checksmarks */
        .check-row { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; }
        .check-icon { font-size: 12px; }

        /* Firmas */
        .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 28px;
            text-align: center;
        }
        .signature-box {
            width: 200px;
        }
        .signature-line {
            border-top: 1.5px solid #374151;
            padding-top: 6px;
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            letter-spacing: 0.06em; color: #374151;
        }
        .signature-hint {
            font-size: 9px; color: #9ca3af; margin-bottom: 32px;
        }

        /* Footer */
        .footer {
            margin-top: 18px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="print-btn no-print">🖨️ Imprimir / Guardar PDF</button>

    @foreach($copies as $index => $copy)
    <div class="page-container {{ $index > 0 ? 'page-break' : '' }}">
        <!-- Header -->
        <div class="header-section" style="margin-bottom: 25px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    @php
                        $branch = $euthanasia->branch ?? $euthanasia->pet?->branch ?? null;
                        $branchName = $branch->name ?? $siteName;
                    @endphp
                    <div style="font-size: 28px; font-weight: 900; color: {{ $primaryColor }}; letter-spacing: -1px; text-transform: uppercase;">{{ $branchName }}</div>
                    <p style="font-size: 8px; color: #6b7280; font-weight: 700;">{{ $branch->address ?? '' }} | TEL: {{ $branch->phone ?? '' }}</p>
                </div>
                
                <div style="text-align: right;">
                    <p style="margin: 0; font-size: 8px; font-weight: 900; color: {{ $primaryColor }}; text-transform: uppercase; letter-spacing: 0.15em;">{{ $copy['label'] }}</p>
                    <h1 style="font-size: 20px; margin: 2px 0; line-height: 1.1; color: #111827;">REPORTE DE EUTANASIA</h1>
                    <p style="margin: 6px 0 0 0; font-size: 9px; color: #6b7280; font-weight: 700; text-transform: uppercase;">
                        {{ $euthanasia->branch?->name }} | Folio: <span style="color: {{ $primaryColor }};">{{ $euthanasia->folio }}</span>
                    </p>
                </div>
            </div>
            <div style="height: 3px; background: linear-gradient(to right, {{ $primaryColor }}, {{ $secondaryColor }}); border-radius: 2px; margin-top: 15px;"></div>
        </div>

        <!-- Paciente y procedimiento -->
        <div class="section">
            <p class="section-title">Información del Paciente y Procedimiento</p>
            <div class="info-grid">
                <div class="info-item"><label>Paciente</label><p>{{ $euthanasia->pet?->name }}</p></div>
                <div class="info-item"><label>Especie / Raza</label><p>{{ $euthanasia->pet?->species }} — {{ $euthanasia->pet?->breed }}</p></div>
                <div class="info-item"><label>Propietario / Responsable</label><p>{{ $euthanasia->owner_name_override ?: ($euthanasia->pet?->owner?->name ?? '—') }}</p></div>
                
                <div class="info-item"><label>Fecha y Hora</label><p>{{ $euthanasia->performed_at ? \Carbon\Carbon::parse($euthanasia->performed_at)->format('d/m/Y H:i') : '—' }}</p></div>
                <div class="info-item"><label>Peso</label><p>{{ $euthanasia->weight ? $euthanasia->weight . ' kg' : '—' }}</p></div>
                <div class="info-item"><label>Médico Responsable</label><p>{{ $euthanasia->veterinarian?->name }}</p></div>
                
                <div class="info-item" style="grid-column: span 2;">
                    <label>Destino del Cuerpo</label>
                    <p>{{ match($euthanasia->disposition) {
                        'cremacion_individual' => 'Cremación Individual',
                        'cremacion_colectiva'  => 'Cremación Colectiva',
                        'entierro'             => 'Entierro',
                        'propietario'          => 'El propietario lo lleva',
                        'clinica'              => 'Disposición clínica',
                        default                => '—'
                    } }}{{ $euthanasia->cremation_provider ? ' — ' . $euthanasia->cremation_provider : '' }}</p>
                </div>
            </div>
        </div>

        <!-- Motivo clínico -->
        <div class="section">
            <p class="section-title">Motivo Clínico / Justificación</p>
            <p style="font-weight:700;margin-bottom:8px;color:#374151;">{{ $euthanasia->reason }}</p>
            @if($euthanasia->reason_detail)
            <div class="desc-box">{{ $euthanasia->reason_detail }}</div>
            @endif
        </div>

        <!-- Medicamentos (Solo en copia clínica) -->
        @if($copy['type'] === 'clinic')
        <div class="section">
            <p class="section-title">Medicamentos y Fármacos Empleados (Archivo Técnico)</p>
            @if(count($euthanasia->medications ?? []) > 0)
            <table>
                <thead>
                    <tr>
                        <th style="width: 25%;">Fármaco</th>
                        <th>Dosis Total</th>
                        <th>Vía</th>
                        <th>Lote</th>
                        <th>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($euthanasia->medications as $med)
                    <tr>
                        <td><strong>{{ $med['name'] }}</strong></td>
                        <td>{{ $med['total_dose'] ?? '—' }}</td>
                        <td>{{ $med['route'] ?? '—' }}</td>
                        <td style="font-family:monospace;">{{ $med['lot_number'] ?? '—' }}</td>
                        <td style="font-style:italic;color:#6b7280;">{{ $med['notes'] ?? '—' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @else
            <p style="color:#9ca3af;font-style:italic;">Sin medicamentos registrados.</p>
            @endif
        </div>
        @endif

        <!-- Autorización -->
        <div class="section">
            <p class="section-title">Autorización y Consentimiento</p>
            @if($euthanasia->owner_authorization)
            <div class="desc-box">
                <strong style="font-size:8px;font-weight:900;text-transform:uppercase;color:#6b7280;display:block;margin-bottom:4px;">Declaración de Autorización:</strong>
                {{ $euthanasia->owner_authorization }}
            </div>
            @endif
            <div style="display:flex;gap:24px;margin-top:10px;">
                <div class="check-row">
                    <span class="check-icon">{{ $euthanasia->owner_present ? '✅' : '☐' }}</span>
                    Propietario estuvo presente
                </div>
                <div class="check-row">
                    <span class="check-icon">{{ $euthanasia->consent_signed ? '✅' : '☐' }}</span>
                    Consentimiento firmado registrado
                </div>
            </div>
        </div>

        <!-- Notas Finales -->
        @if($euthanasia->notes)
        <div class="section">
            <p class="section-title">Observaciones / Notas del Procedimiento</p>
            <div class="desc-box" style="font-style: normal; border-left: 3px solid #7e22ce;">
                {{ $euthanasia->notes }}
            </div>
        </div>
        @endif

        <!-- Firmas -->
        <div class="signatures" style="margin-top: 50px;">
            <div class="signature-box" style="width: 250px;">
                <p class="signature-hint" style="margin-bottom: 5px;">{{ $euthanasia->owner_name_override ?: ($euthanasia->pet?->owner?->name ?? 'Firma / Identificación') }}</p>
                <div class="signature-line" style="border-top: 1px solid #000; padding-top: 5px;">Firma del Propietario / Responsable</div>
                <p style="font-size: 8px; margin-top: 4px; color: #6b7280;">
                    (Huella / Identificación / INE)
                </p>
                @if($copy['type'] === 'owner')
                <p style="font-size: 9px; font-weight: 700; margin-top: 10px; font-style: italic;">
                    "He comprendido lo explicado y contestado."
                </p>
                @endif
            </div>
            <div class="signature-box" style="width: 250px;">
                @if($copy['type'] === 'owner')
                <p style="font-size: 8px; text-align: left; color: #4b5563; line-height: 1.2; margin-bottom: 15px; font-style: italic;">
                    "Certifico que he explicado la naturaleza y el propósito del procedimiento eutanásico propuesto y me he ofrecido a contestar cualquier pregunta."
                </p>
                @endif
                <p class="signature-hint" style="margin-bottom: 5px; margin-top: 20px;">{{ $euthanasia->veterinarian?->name }}</p>
                <div class="signature-line" style="border-top: 1px solid #000; padding-top: 5px;">Médico Veterinario Responsable</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <span>Folio: {{ $euthanasia->folio }} — Generado el: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</span>
            <span>{{ $copy['type'] === 'clinic' ? 'Archivo Técnico Confidencial' : 'Copia Oficial del Propietario' }}</span>
        </div>
    </div>
    @endforeach
</body>
</html>
