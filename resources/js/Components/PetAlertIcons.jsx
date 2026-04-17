import React from 'react';

export default function PetAlertIcons({ pet, size = "md", className = "" }) {
    if (!pet) return null;

    const icons = [];

    if (pet.is_aggressive) {
        icons.push({ icon: "⚠️", color: "text-red-500", label: "Agresivo", bgColor: "bg-red-500/10" });
    }

    if (pet.is_sterilized) {
        icons.push({ icon: "✂️", color: "text-teal-500", label: "Esterilizado", bgColor: "bg-teal-500/10" });
    }

    if (pet.allergies) {
        icons.push({
            icon: `🧪 ${pet.allergies}`,
            color: "text-amber-500",
            label: `Alergia: ${pet.allergies}`,
            bgColor: "bg-amber-500/10"
        });
    }

    if (pet.chronic_conditions) {
        icons.push({
            icon: `🩺 ${pet.chronic_conditions}`,
            color: "text-blue-500",
            label: `Crónico: ${pet.chronic_conditions}`,
            bgColor: "bg-blue-500/10"
        });
    }

    if (icons.length === 0) return null;

    const sizeClasses = {
        sm: "text-[9px] gap-1 px-1",
        md: "text-[10px] gap-1.5 px-1.5",
        lg: "text-xs gap-2 px-2"
    };

    return (
        <div className={`flex flex-wrap items-center ${sizeClasses[size] || sizeClasses.md} ${className}`}>
            {icons.map((item, idx) => (
                <span
                    key={idx}
                    title={item.label}
                    className={`cursor-help hover:scale-105 transition-transform flex items-center justify-center rounded-md ${item.bgColor} px-1.5 py-0.5 font-bold uppercase tracking-tight ${item.color} whitespace-nowrap border border-current/10 shadow-sm`}
                >
                    {item.icon}
                </span>
            ))}
        </div>
    );
}
