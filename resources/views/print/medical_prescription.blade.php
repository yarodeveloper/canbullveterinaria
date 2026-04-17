@php
    $settings = \App\Models\SiteSetting::all()->pluck('value', 'key');
    $logoUrl = $settings['site_logo'] ?? null;
    $primaryColor = $settings['primary_color'] ?? '#84329B';
    $secondaryColor = $settings['secondary_color'] ?? '#C4D600';
    $siteName = $settings['site_name'] ?? 'Veterinaria';
    $vitalSigns = $record->vital_signs ?? [];
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Receta Médica — {{ $record->id }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page {
            size: 140mm 216mm portrait;
            margin: 5mm;
        }

        body {
            font-family: 'Inter', sans-serif;
            color: #1f2937;
            background: white;
            padding: 10px;
            line-height: 1.4;
            font-size: 11px;
        }

        .no-print {
            display: block; width: 100%; padding: 10px;
            background: {{ $primaryColor }}; color: white; text-align: center;
            font-weight: 900; text-transform: uppercase; border: none;
            border-radius: 12px; cursor: pointer; margin-bottom: 20px;
            font-family: inherit; font-size: 11px;
        }

        @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
        }

        .prescription-card {
            border: 2px solid #e5e7eb;
            border-radius: 15px;
            padding: 20px;
            min-height: 200mm;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .clinic-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 3px solid {{ $primaryColor }};
            padding-bottom: 15px;
        }

        .clinic-info h2 {
            font-size: 20px;
            font-weight: 900;
            color: {{ $primaryColor }};
            letter-spacing: -1px;
        }

        .clinic-info p {
            font-size: 10px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
        }

        .document-title {
            text-align: right;
        }

        .document-title h1 {
            font-size: 22px;
            font-weight: 900;
            color: #111827;
            line-height: 1;
        }

        .document-title p {
            font-size: 10px;
            font-weight: 900;
            color: {{ $primaryColor }};
            text-transform: uppercase;
            margin-top: 5px;
        }

        .patient-bar {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px 20px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .data-item label {
            display: block;
            font-size: 9px;
            font-weight: 900;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 2px;
        }

        .data-item span {
            font-size: 12px;
            font-weight: 700;
            color: #1e293b;
        }

        .prescription-content {
            flex: 1;
            padding: 10px 0;
        }

        .rx-icon {
            font-size: 30px;
            font-weight: 900;
            color: {{ $primaryColor }};
            opacity: 0.2;
            margin-bottom: 5px;
        }

        .plan-text {
            font-size: 14px;
            white-space: pre-wrap;
            color: #334155;
            line-height: 1.8;
            padding-left: 20px;
        }

        .vitals-mini {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            gap: 30px;
            font-size: 10px;
            color: #64748b;
        }

        .footer-signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .signature-box {
            text-align: center;
            width: 250px;
        }

        .line {
            border-top: 2px solid #1e293b;
            margin-bottom: 8px;
        }

        .signature-box p {
            font-size: 10px;
            font-weight: 900;
            text-transform: uppercase;
        }

        .clinic-contact {
            text-align: right;
            font-size: 9px;
            color: #94a3b8;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="no-print">🖨️ Imprimir Receta</button>

    <div class="prescription-card">
        <header class="clinic-header">
            <div class="clinic-info">
                @if($logoUrl)
                    <img src="{{ Str::startsWith($logoUrl, 'http') ? $logoUrl : asset($logoUrl) }}" style="max-height: 50px; margin-bottom: 10px;">
                @else
                    <img src="{{ asset('icons/pet-svgrepo-com.svg') }}" style="max-height: 40px; margin-bottom: 10px; filter: opacity(0.5);">
                    <h2 style="color: {{ $primaryColor }};">{{ $siteName }}</h2>
                @endif
                <p>{{ $record->branch?->name }}</p>
            </div>
            <div class="document-title">
                <h1>RECETA MÉDICA</h1>
                <p>Folio: MR-{{ str_pad($record->id, 6, '0', STR_PAD_LEFT) }}</p>
                <p style="color: #64748b; font-size: 9px;">Fecha: {{ $record->created_at->format('d/m/Y') }}</p>
            </div>
        </header>

        <section class="patient-bar">
            <div class="data-item">
                <label>Paciente</label>
                <span>{{ $record->pet->name }}</span>
            </div>
            <div class="data-item">
                <label>Especie / Raza</label>
                <span>{{ $record->pet->species }} / {{ $record->pet->breed->name ?? $record->pet->breed ?? 'Mestizo' }}</span>
            </div>
            <div class="data-item">
                <label>Propietario</label>
                <span>{{ $record->pet->owner?->name ?? '—' }}</span>
            </div>
            <div class="data-item">
                <label>Peso</label>
                <span>{{ $vitalSigns['weight'] ?? '--' }} kg</span>
            </div>
        </section>

        <main class="prescription-content">
            <div class="rx-icon">Rx</div>
            
            @if(!empty($record->medications))
                <div class="medications-list" style="margin-bottom: 25px;">
                    @foreach($record->medications as $med)
                        <div class="medication-item" style="margin-bottom: 20px; border-bottom: 1.5px solid #f1f5f9; padding-bottom: 12px;">
                            <div style="margin-bottom: 4px;">
                                <p style="font-size: 13px; font-weight: 500; color: #1e293b;">
                                    <strong style="font-weight: 900; text-transform: uppercase; color: #000;">{{ $med['name'] }}:</strong> 
                                    <span style="color: {{ $primaryColor }}; font-weight: 700; background: #faf5ff; padding: 2px 6px; border-radius: 4px;">
                                        {{ $med['dosage'] }} — {{ $med['frequency'] }} — {{ $med['duration'] }}
                                    </span>
                                </p>
                            </div>
                            @if(!empty($med['notes']))
                                <p style="font-size: 11px; color: #64748b; font-weight: 500; padding-left: 5px; border-left: 2px solid #e2e8f0; margin-top: 5px;">{{ $med['notes'] }}</p>
                            @endif
                        </div>
                    @endforeach
                </div>
                
                @if(!empty($record->plan))
                    <div style="background: #f8fafc; border-radius: 12px; padding: 15px; border: 1px solid #e2e8f0;">
                        <p style="font-size: 9px; font-weight: 900; color: {{ $primaryColor }}; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">Plan / Recomendaciones Generales</p>
                        <div class="plan-text" style="font-size: 11px; padding-left: 0; line-height: 1.6;">{{ $record->plan }}</div>
                    </div>
                @endif
            @else
                <div class="plan-text">{{ $record->plan ?? 'Sin indicaciones registradas.' }}</div>
            @endif
        </main>

        <div class="vitals-mini">
            <span>TDA: {{ $vitalSigns['temp'] ?? '--' }}°C</span>
            <span>FC: {{ $vitalSigns['hr'] ?? '--' }}bpm</span>
            <span>FR: {{ $vitalSigns['rr'] ?? '--' }}rpm</span>
            <span>Fecha Proc: {{ $record->created_at->format('d/m/Y H:i') }}</span>
        </div>

        <footer class="footer-signatures">
            <div class="signature-box">
                <div class="line"></div>
                <p>Dr. {{ $record->veterinarian?->name }}</p>
                <p style="font-weight: 400; color: #64748b; font-size: 8px;">Cédula Prof: {{ $record->veterinarian?->professional_id ?? 'En trámite' }}</p>
            </div>
            <div class="clinic-contact">
                <p>{{ $record->branch?->address ?? $settings['site_address'] ?? '' }}</p>
                <p>{{ $record->branch?->phone ?? $settings['site_phone'] ?? '' }}</p>
                <p>{{ $record->branch?->email ?? $settings['site_email'] ?? '' }}</p>
            </div>
        </footer>
    </div>
</body>
</html>
