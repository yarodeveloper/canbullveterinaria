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
            white-space: pre-wrap;
            margin-bottom: 60px;
        }
        .signatures {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
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
            background: #4F46E5;
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

    <div class="header">
        <h1>{{ $title }}</h1>
        <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;">Documento Legal y Consentimiento Informado</p>
    </div>

    <div class="patient-info">
        <div>
            <span>Paciente</span>
            <p>{{ $pet->name }}</p>
        </div>
        <div>
            <span>Propietario</span>
            <p>{{ $pet->owner->name ?? '_________________' }}</p>
        </div>
        <div>
            <span>Fecha</span>
            <p>{{ \Carbon\Carbon::now()->format('d/m/Y') }}</p>
        </div>
    </div>

    <div class="content">
{{ $content }}
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
