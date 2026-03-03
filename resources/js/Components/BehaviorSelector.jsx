import React from 'react';

const behaviors = [
    { id: 'normal', label: 'Neutro', icon: '', color: 'bg-gray-50 text-gray-400 border-gray-200', activeColor: 'bg-gray-400 text-white border-gray-500', description: 'Cliente sin atenciones especiales.' },
    { id: 'angry', label: 'Enojón / Impaciente', icon: '😡', color: 'bg-red-100 text-red-700 border-red-200', activeColor: 'bg-red-500 text-white border-red-600', description: 'Se frustra rápido o es rudo.' },
    { id: 'hurry', label: 'Con Prisa', icon: '⚡', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', activeColor: 'bg-yellow-500 text-white border-yellow-600', description: 'Siempre está contra reloj.' },
    { id: 'delicate', label: 'Muy Delicado', icon: '🥺', color: 'bg-blue-100 text-blue-700 border-blue-200', activeColor: 'bg-blue-500 text-white border-blue-600', description: 'Ansioso o sobreprotector.' },
    { id: 'vip', label: 'Cliente VIP', icon: '⭐', color: 'bg-amber-100 text-amber-700 border-amber-200', activeColor: 'bg-amber-500 text-white border-amber-600', description: 'Leal y recurrente.' },
    { id: 'debtor', label: 'Deudor', icon: '⚠️', color: 'bg-gray-100 text-gray-700 border-gray-200', activeColor: 'bg-gray-700 text-white border-gray-800', description: 'Pendientes administrativos.' },
];

export default function BehaviorSelector({ value, onChange, label = "Perfil de Atención" }) {
    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{label}</label>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {behaviors.map((behavior) => {
                    const isActive = value === behavior.id;
                    return (
                        <button
                            key={behavior.id}
                            type="button"
                            onClick={() => onChange(isActive ? null : behavior.id)}
                            className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all group relative ${isActive
                                ? behavior.activeColor
                                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-indigo-300'
                                }`}
                            title={behavior.description}
                        >
                            <span className={`text-2xl mb-1 ${!isActive && 'grayscale group-hover:grayscale-0'}`}>
                                {behavior.icon}
                            </span>
                            <span className={`text-[10px] font-black uppercase text-center leading-tight ${!isActive && 'text-gray-400 group-hover:text-gray-600'}`}>
                                {behavior.label.split(' / ')[0]}
                            </span>

                            {/* Tooltip for desktop */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 p-2 bg-gray-900 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 text-center shadow-xl">
                                {behavior.description}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export const BehaviorBadge = ({ behaviorId, showLabel = true, className = "" }) => {
    const behavior = behaviors.find(b => b.id === behaviorId);
    if (!behavior) return null;

    return (
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${behavior.color} ${className}`} title={behavior.description}>
            <span className="mr-1">{behavior.icon}</span>
            {showLabel && <span>{behavior.label}</span>}
        </div>
    );
};
