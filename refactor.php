<?php
$file = 'resources/js/Pages/Pets/Show.jsx';
$content = file_get_contents($file);

preg_match('/(                    \{\/\* Alertas Clinicas \*\/}.*?)(                    \{\/\* Tarjeta de Resumen \*\/})/s', $content, $matches);
$alertsCode = $matches[1];

$content = str_replace($alertsCode, '', $content);

$origContainer = '<div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">';
$newContainer = '<div className="py-6">
                <div className="max-w-[98%] mx-auto sm:px-4 lg:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">';
$content = str_replace($origContainer, $newContainer, $content);

$origLeft = '                    {/* Tarjeta de Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-6">';
$newLeft = '                    {/* PANEL IZQUIERDO: Perfil y Entorno (25%) */}
                    <div className="lg:col-span-3 space-y-6">';
$content = str_replace($origLeft, $newLeft, $content);

$origCenter = '                        {/* Historial Clinico y Citas */}
                        <div className="md:col-span-2 space-y-6">';
$newCenter = '                        {/* PANEL CENTRAL: Línea de Vida Clínica (50%) */}
                        <div className="lg:col-span-5 xl:col-span-6 space-y-6">';
$content = str_replace($origCenter, $newCenter, $content);

$origRight = '                            <PreventiveControl pet={pet} auth={auth} protocols={protocols} />';
$newRight = '                        </div>
                        {/* PANEL DERECHO: Prevención, Alertas y Futuro (25%) */}
                        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
' . $alertsCode . '                            <PreventiveControl pet={pet} auth={auth} protocols={protocols} />';
$content = str_replace($origRight, $newRight, $content);

file_put_contents($file, $content);
echo "Done";
?>
