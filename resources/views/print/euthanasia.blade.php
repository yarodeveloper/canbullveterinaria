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
            background: #7e22ce; color: white; text-align: center;
            font-weight: 900; text-transform: uppercase; border: none;
            border-radius: 10px; cursor: pointer; margin-bottom: 18px;
            font-family: inherit; font-size: 12px; letter-spacing: 0.05em;
        }
        @media print {
            .no-print { display: none !important; }
            body { padding: 0; max-width: 100%; }
            .section { page-break-inside: avoid; }
            .signatures { page-break-inside: avoid; }
        }

        /* Header del reporte */
        .header-bar {
            background: linear-gradient(135deg, #581c87, #7e22ce);
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
            background: #7e22ce;
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

@php
    $settings = \App\Models\SiteSetting::all()->pluck('value', 'key');
    $logoUrl = $settings['site_logo'] ?? null;
@endphp

<!-- Header -->
<div class="header-section" style="margin-bottom: 25px;">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
        <div style="flex: 0 0 auto;">
            @if($logoUrl)
                <img src="{{ Str::startsWith($logoUrl, 'http') ? $logoUrl : asset($logoUrl) }}" style="max-height: 70px; width: auto;" alt="Logo">
            @else
                <div style="font-size: 28px; font-weight: 900; color: #7e22ce; letter-spacing: -1px;">CanBull</div>
            @endif
        </div>
        
        <div style="text-align: right;">
            <p style="margin: 0; font-size: 8px; font-weight: 900; color: #7e22ce; text-transform: uppercase; letter-spacing: 0.15em;">Protocolo Oficial Interno</p>
            <h1 style="font-size: 20px; margin: 2px 0; line-height: 1.1; color: #111827;">REPORTE DE EUTANASIA</h1>
            <p style="margin: 6px 0 0 0; font-size: 9px; color: #6b7280; font-weight: 700; text-transform: uppercase;">
                {{ $euthanasia->branch?->name }} | Folio: <span style="color: #7e22ce;">{{ $euthanasia->folio }}</span>
            </p>
        </div>
    </div>
    <div style="height: 3px; background: linear-gradient(to right, #7e22ce, #a855f7); border-radius: 2px; margin-top: 15px;"></div>
</div>

    <!-- Paciente y procedimiento -->
    <div class="section">
        <p class="section-title">Información del Paciente y Procedimiento</p>
        <div class="info-grid">
            <div class="info-item">
                <label>Paciente</label>
                <p>{{ $euthanasia->pet?->name }}</p>
            </div>
            <div class="info-item">
                <label>Especie / Raza</label>
                <p>{{ $euthanasia->pet?->species }} — {{ $euthanasia->pet?->breed }}</p>
            </div>
            <div class="info-item">
                <label>Propietario</label>
                <p>{{ $euthanasia->pet?->owner?->name ?? '—' }}</p>
            </div>
            <div class="info-item">
                <label>Teléfono Propietario</label>
                <p>{{ $euthanasia->pet?->owner?->phone ?? '—' }}</p>
            </div>
            <div class="info-item">
                <label>Fecha y Hora</label>
                <p>{{ $euthanasia->performed_at ? \Carbon\Carbon::parse($euthanasia->performed_at)->format('d/m/Y H:i') : '—' }}</p>
            </div>
            <div class="info-item">
                <label>Peso del Paciente</label>
                <p>{{ $euthanasia->weight ? $euthanasia->weight . ' kg' : '—' }}</p>
            </div>
            <div class="info-item">
                <label>Médico Responsable</label>
                <p>{{ $euthanasia->veterinarian?->name }}</p>
            </div>
            <div class="info-item">
                <label>Sucursal</label>
                <p>{{ $euthanasia->branch?->name }}</p>
            </div>
            <div class="info-item">
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

    <!-- Medicamentos -->
    <div class="section">
        <p class="section-title">Medicamentos y Fármacos Empleados</p>
        @if(count($euthanasia->medications ?? []) > 0)
        <table>
            <thead>
                <tr>
                    <th>Medicamento / Principio Activo</th>
                    <th>Concentración</th>
                    <th>Dosis mg/kg</th>
                    <th>Dosis Total</th>
                    <th>Vol. (mL)</th>
                    <th>Vía</th>
                    <th>N° Lote</th>
                    <th>Notas</th>
                </tr>
            </thead>
            <tbody>
                @foreach($euthanasia->medications as $med)
                <tr>
                    <td>
                        @if(!empty($med['is_controlled']))
                            <span class="controlled-badge">⚠️ Controlado</span>
                        @endif
                        <strong>{{ $med['name'] }}</strong>
                    </td>
                    <td>{{ $med['concentration'] ?? '—' }}</td>
                    <td>{{ $med['dose_mg_kg'] ?? '—' }}</td>
                    <td>{{ $med['total_dose'] ?? '—' }}</td>
                    <td>{{ $med['volume_ml'] ?? '—' }}</td>
                    <td><strong>{{ $med['route'] ?? '—' }}</strong></td>
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

    <!-- Contexto y consentimiento -->
    <div class="section">
        <p class="section-title">Autorización y Consentimiento</p>
        <div style="display:flex;gap:24px;margin-bottom:12px;">
            <div class="check-row">
                <span class="check-icon">{{ $euthanasia->owner_present ? '✅' : '☐' }}</span>
                Propietario estuvo presente durante el procedimiento
            </div>
            <div class="check-row">
                <span class="check-icon">{{ $euthanasia->consent_signed ? '✅' : '☐' }}</span>
                Consentimiento informado firmado
            </div>
        </div>
        @if($euthanasia->owner_authorization)
        <div class="desc-box" style="margin-top:8px;">
            <strong style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;display:block;margin-bottom:6px;">Declaración del Propietario:</strong>
            {{ $euthanasia->owner_authorization }}
        </div>
        @endif
    </div>

    @if($euthanasia->notes)
    <div class="section">
        <p class="section-title">Notas Adicionales del Procedimiento</p>
        <p style="font-style:italic;color:#374151;">{{ $euthanasia->notes }}</p>
    </div>
    @endif

    <!-- Firmas -->
    <div class="signatures">
        <div class="signature-box">
            <p class="signature-hint">Nombre del propietario</p>
            <div class="signature-line">Firma del Propietario / Responsable</div>
        </div>
        <div class="signature-box">
            <p class="signature-hint">{{ $euthanasia->veterinarian?->name }}</p>
            <div class="signature-line">Médico Veterinario Responsable</div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <span>Folio: {{ $euthanasia->folio }} — Generado el: {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</span>
        <span>Documento de uso interno. Confidencial.</span>
    </div>
</body>
</html>
