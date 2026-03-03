$content = Get-Content 'resources/js/Pages/Pets/Show.jsx' -Raw -Encoding UTF8

$imports = ""
$importsMatch = [regex]::Match($content, '(?s)(import React, { useState } from ''react'';.*?)(export default function Show)')
if ($importsMatch.Success) {
    $imports = $importsMatch.Groups[1].Value
}

$timelineHeader = 'const TimelineItem = ({ event }) => {
    let icon = "🩺";
    let bgIcon = "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50";
    let title = "General Health Checkup (SOAP)";
    let badgeType = event.type || "CONSULTATION";
    let badgeColor = "bg-indigo-50 text-indigo-600 border-indigo-100";
    let doctor = event.veterinarian?.name || event.lead_surgeon?.name || "Unknown";
    let date = new Date(event.timeline_date);
    let url = "#";
    let urlText = "VER DETALLES";

    if (event.timeline_type === "vaccine") {
        icon = "💉";
        bgIcon = "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50";
        title = event.name || "Vaccine";
        badgeType = event.type || "VACCINATION";
        badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
    } else if (event.timeline_type === "surgery") {
        icon = "✂️";
        bgIcon = "bg-purple-100 text-purple-600 dark:bg-purple-900/50";
        title = event.surgery_type || "Surgery";
        badgeType = "SURGERY";
        badgeColor = "bg-purple-50 text-purple-600 border-purple-100";
    } else if (event.timeline_type === "hospitalization") {
        icon = "🏥";
        bgIcon = "bg-teal-100 text-teal-600 dark:bg-teal-900/50";
        title = "Hospitalización";
        badgeType = "HOSPITALIZATION";
        badgeColor = "bg-teal-50 text-teal-600 border-teal-100";
    }

    return (
        <div className="relative pl-16 group">
            {/* Dot */}
            <div className="absolute left-4 top-1 w-8 h-8 rounded-full border-4 border-white dark:border-gray-800 z-10 group-hover:scale-110 transition-transform flex items-center justify-center text-sm shadow-sm " + bgIcon}>
                {icon}
            </div>

            <div className="bg-white dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                {date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} • {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit"})}
                            </span>
                            <span className={"text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border " + badgeColor}>
                                {badgeType}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
                    
                    {event.timeline_type === "consultation" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Subjective</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{event.subjective || "-"}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Objective</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{event.objective || "-"}</p>
                            </div>
                        </div>
                    )}

                    {event.timeline_type === "surgery" && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{event.post_op_notes || event.status}</p>
                    )}

                    {event.timeline_type === "hospitalization" && (
                         <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">Motivo: {event.reason}</p>
                    )}

                    {event.timeline_type === "vaccine" && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">Lote: {event.lot_number || "-"} | Marca: {event.brand || "-"}</p>
                    )}
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {doctor.substring(0,2).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">Dr. {doctor}</span>
                    </div>
                    {event.timeline_type === "consultation" && (
                        <Link href={route("medical-records.show", event.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 transition">
                            VIEW FULL SOAP <IconEye className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

'

$content = $content.Replace($importsMatch.Groups[1].Value, $importsMatch.Groups[1].Value + $timelineHeader)

Set-Content 'resources/js/Pages/Pets/Show.jsx' -Value $content -Encoding UTF8
