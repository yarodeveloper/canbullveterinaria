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
    <title>Imprimir {{ $title }}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            color: #111827;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
        }
        h1 {
            font-size: 24px;
            font-weight: 900;
            text-transform: uppercase;
            text-align: center;
            margin-bottom: 10px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #ccc;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .patient-info {
            display: flex;
            justify-content: space-between;
            background: #f3f4f6;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .patient-info div {
            flex: 1;
        }
        .patient-info span {
            font-weight: 700;
            color: #6b7280;
            display: block;
            text-transform: uppercase;
            font-size: 10px;
            margin-bottom: 2px;
        }
        .patient-info p {
            margin: 0;
            font-size: 16px;
            font-weight: 700;
        }
        .content {
            font-size: 14px;
            margin-bottom: 60px;
            line-height: 1.4;
        }
        .content p {
            margin: 0;
            padding: 0;
            margin-bottom: 4px; /* Pequeño espacio entre párrafos */
        }
        .content h1, .content h2, .content h3 {
            margin: 10px 0 5px 0;
        }
        .content ul, .content ol {
            margin: 5px 0;
            padding-left: 25px;
        }
        /* Quill Alignment Styles */
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        .ql-indent-1 { padding-left: 3em; }
        .ql-indent-2 { padding-left: 6em; }
        /* Reset margins for signatures */
        .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 40px;
            text-align: center;
        }
        .signature-line {
            width: 250px;
            border-top: 1px solid #111827;
            padding-top: 10px;
            font-size: 12px;
            font-weight: 700;
        }
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
        }
        .print-btn {
            display: block;
            width: 100%;
            padding: 15px;
            background: {{ $primaryColor }};
            color: white;
            text-align: center;
            text-decoration: none;
            font-weight: 900;
            text-transform: uppercase;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <button onclick="window.print()" class="print-btn no-print">🖨️ IMPRIMIR DOCUMENTO</button>

@php
    $siteName = $settings['site_name'] ?? 'CanBull';
@endphp

<div class="header">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 20px;">
        <div style="flex: 0 0 auto;">
            @if($logoUrl)
                <img src="{{ Str::startsWith($logoUrl, 'http') ? $logoUrl : asset($logoUrl) }}" style="max-height: 70px; width: auto;" alt="Logo">
            @else
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="{{ asset('icons/pet-svgrepo-com.svg') }}" style="max-height: 40px; filter: opacity(0.5);">
                    <div style="font-size: 28px; font-weight: 900; color: {{ $primaryColor }}; letter-spacing: -1px;">{{ $siteName }}</div>
                </div>
            @endif
        </div>
        
        <div style="text-align: right;">
            <h1 style="font-size: 22px; margin: 0; line-height: 1.1; color: #111827;">{{ $title }}</h1>
            <p style="margin: 8px 0 0 0; font-size: 9px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
                @php
                    $branch = $pet->branch ?? null;
                    $address = $branch->address ?? $settings['contact_address'] ?? '';
                    $phone = $branch->phone ?? $settings['contact_phone'] ?? '';
                    $email = $branch->email ?? $settings['contact_email'] ?? '';
                @endphp
                {{ $address }} <br>
                @if($phone) TEL: {{ $phone }} | @endif
                @if($email) {{ $email }} | @endif
                {{ \Carbon\Carbon::now()->translatedFormat('d F, Y') }}
            </p>
        </div>
    </div>
    <div style="height: 3px; background: linear-gradient(to right, {{ $primaryColor }}, {{ $secondaryColor }}); border-radius: 2px; margin-top: 20px;"></div>
</div>


    <div class="content">
        {!! $content !!}
    </div>

    <div class="signatures">
        <div class="signature-line">
            Firma del Propietario / Responsable
        </div>
        <div class="signature-line">
            Firma del Médico Tratante
        </div>
    </div>
</body>
</html>
