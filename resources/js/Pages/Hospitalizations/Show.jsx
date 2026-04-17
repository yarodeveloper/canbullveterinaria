import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import GlasgowScaleModal from '@/Components/GlasgowScaleModal';
import PrintDocumentModal from '@/Components/PrintDocumentModal';

import MedicationsEditor from '@/Components/MedicationsEditor';
import PendingChargesEditor from '@/Components/PendingChargesEditor';
import { getWhatsAppLink } from '@/Utils/formatters';

const VITAL_RANGES = {
    Canino: {
        Cachorro: { hr: [100, 120], rr: [15, 20], temp: [38.5, 39.5], crt: [0.5, 1.5] },
        Adulto: { hr: [80, 100], rr: [10, 30], temp: [38, 39], crt: [1, 2] },
        Seniles: { hr: [70, 90], rr: [14, 18], temp: [37.5, 38.5], crt: [1.5, 2.5] }
    },
    Felino: {
        Cachorro: { hr: [130, 150], rr: [15, 35], temp: [38, 38.5], crt: [0.5, 1] },
        Adulto: { hr: [120, 140], rr: [20, 40], temp: [38, 39], crt: [1, 2] },
        Seniles: { hr: [100, 120], rr: [15, 30], temp: [36.7, 38.9], crt: [1.5, 2] }
    }
};

const getAgeGroup = (dobString) => {
    if (!dobString) return 'Adulto';
    const dob = new Date(dobString);
    const now = new Date();
    let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    if (months < 12) return 'Cachorro';
    if (months > 84) return 'Seniles';
    return 'Adulto';
};

const checkRange = (species, dobString, type, value) => {
    if (!value || isNaN(parseFloat(value)) || value === '') return null;
    const lowerSpecies = species?.toLowerCase();
    const sp = (lowerSpecies === 'canino' || lowerSpecies === 'perro') ? 'Canino' : 'Felino';

    const ageGroup = getAgeGroup(dobString);
    const range = VITAL_RANGES[sp]?.[ageGroup]?.[type];
    if (!range) return null;

    const val = parseFloat(value);
    if (val < range[0]) return 'low';
    if (val > range[1]) return 'high';
    return 'normal';
};

const WarningIcon = ({ status, range }) => {
    if (status === 'low') return <span title={`Anormal (Bajo). Rango normal: ${range[0]} - ${range[1]}`} className="text-[10px] text-blue-500 font-black animate-pulse bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap border border-blue-200 dark:border-blue-800">▼ BAJO ({range[0]}-{range[1]})</span>;
    if (status === 'high') return <span title={`Anormal (Alto). Rango normal: ${range[0]} - ${range[1]}`} className="text-[10px] text-red-500 font-black animate-pulse bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap border border-red-200 dark:border-red-800">▲ ALTO ({range[0]}-{range[1]})</span>;
    return null;
};

const calculateAge = (dobString) => {
    if (!dobString) return "Desconocida";
    const dob = new Date(dobString);
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
        years--;
        months += 12;
    }
    if (years === 0) return `${months} meses`;
    if (months === 0) return `${years} años`;
    return `${years} años ${months} meses`;
};

export default function Show({ auth, hospitalization, templates, products = [] }) {
    const permissions = auth.permissions || [];
    const can = (permission) => permissions.includes(permission) || auth.user.role === 'admin';
    const canManage = can('manage hospitalizations');

    const [showMonitoringForm, setShowMonitoringForm] = useState(false);
    const [showGlasgowModal, setShowGlasgowModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [monitoringToEdit, setMonitoringToEdit] = useState(null);
    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        temperature: '',
        heart_rate: '',
        respiratory_rate: '',
        mucosa_color: '',
        bcs: '',
        lymph_nodes: '',
        abdominal_palpation: '',
        capillary_refill_time: '',
        blood_pressure: '',
        hydration_status: '',
        pain_score: 0,
        mental_state: '',
        medication_administered: '',
        food_intake: '',
        urination: '',
        defecation: '',
        notes: '',
        pending_charges: [],
    });

    const addMedTag = (tag) => {
        const currentArray = data.medication_administered ? [data.medication_administered] : [];
        setData('medication_administered', currentArray.concat(tag).join(', '));
    };

    const submitMonitoring = (e) => {
        e.preventDefault();
        if (monitoringToEdit) {
            put(route('hospitalizations.monitoring.update', monitoringToEdit.id), {
                onSuccess: () => {
                    reset();
                    setMonitoringToEdit(null);
                    setShowMonitoringForm(false);
                },
            });
        } else {
            post(route('hospitalizations.monitoring.store', hospitalization.id), {
                onSuccess: () => {
                    reset();
                    setShowMonitoringForm(false);
                },
            });
        }
    };

    const handleEditMonitoring = (m) => {
        setMonitoringToEdit(m);
        setData({
            temperature: m.temperature || '',
            heart_rate: m.heart_rate || '',
            respiratory_rate: m.respiratory_rate || '',
            mucosa_color: m.mucosa_color || '',
            bcs: m.bcs || '',
            lymph_nodes: m.lymph_nodes || '',
            abdominal_palpation: m.abdominal_palpation || '',
            capillary_refill_time: m.capillary_refill_time || '',
            blood_pressure: m.blood_pressure || '',
            hydration_status: m.hydration_status || '',
            pain_score: m.pain_score || 0,
            mental_state: m.mental_state || '',
            medication_administered: m.medication_administered || '',
            food_intake: m.food_intake || '',
            urination: m.urination || '',
            defecation: m.defecation || '',
            notes: m.notes || '',
        });
        setShowMonitoringForm(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMonitoring = (id) => {
        if (confirm('¿Estás seguro de eliminar este registro de monitoreo?')) {
            destroy(route('hospitalizations.monitoring.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            discharged: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            euthanized: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        };
        const labels = {
            active: 'HOSPITALIZADO',
            discharged: 'ALTA MÉDICA',
            expired: 'DEFUNCIÓN',
            euthanized: 'EUTHANASIA',
        };
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${colors[status]}`}>{labels[status]}</span>;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Expediente de Hospitalización: {hospitalization.pet.name}</h2>}
        >
            <Head title={`Hospitalización - ${hospitalization.pet.name}`} />

            <GlasgowScaleModal
                isOpen={showGlasgowModal}
                onClose={() => setShowGlasgowModal(false)}
                species={hospitalization.pet.species}
                petName={hospitalization.pet.name}
                initialScore={parseInt(data.pain_score) || 0}
                onSave={(score) => {
                    setData('pain_score', score);
                }}
            />

            <div className="min-h-screen bg-slate-50 dark:bg-[#111822] text-slate-800 dark:text-slate-300 py-8 font-sans transition-colors duration-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Info */}
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2rem] shadow-lg overflow-hidden mb-6 border border-slate-200 dark:border-slate-700/50">
                        <div className="p-5 lg:p-6 flex flex-col lg:flex-row gap-6 items-center lg:items-center text-center lg:text-left">
                            <div className="w-20 h-20 shrink-0 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-4xl shadow-inner">
                                {hospitalization.pet.species === 'Canino' ? '🐕' : '🐈'}
                            </div>
                            <div className="flex-1 w-full">
                                <div className="flex flex-wrap items-center gap-3 mb-2 justify-center lg:justify-start">
                                    <Link href={route('pets.show', hospitalization.pet.id)} className="hover:text-brand-primary transition-colors cursor-pointer"><h1 className="text-3xl font-black text-slate-900 dark:text-white hover:text-brand-primary transition-colors">{hospitalization.pet.name}</h1></Link>
                                    {getStatusBadge(hospitalization.status)}
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm mt-3 lg:mt-0">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Especie y Raza</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{hospitalization.pet.species} - {hospitalization.pet.breed || 'Mestizo'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Edad</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{calculateAge(hospitalization.pet.dob)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Motivo</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">{hospitalization.reason}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Ingreso</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300">
                                            {format(new Date(hospitalization.admission_date), "d MMM, HH:mm", { locale: es })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Vol / Peso</p>
                                        <p className="font-bold text-brand-primary">{hospitalization.initial_weight} kg</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Monitoring List */}
                        <div className="lg:col-span-2 space-y-6">
                            <MedicationsEditor 
                                medications={hospitalization.medications || []}
                                onSave={(meds) => {
                                    router.patch(route('hospitalizations.update', hospitalization.id), { medications: meds }, { 
                                        preserveScroll: true 
                                    });
                                }}
                                products={products.filter(p => !p.is_service)}
                                canManage={canManage && hospitalization.status === 'active'}
                                title="Tratamiento Base O Fármacos Programados"
                                iconColor="bg-amber-500"
                            />

                            <div className="flex justify-between items-center bg-slate-50 dark:bg-[#111822]/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Kardex de Monitoreo</h3>
                                        <div className="flex items-center gap-2">
                                            {canManage && (
                                                <>
                                                    <button
                                                        onClick={() => setShowPrintModal(true)}
                                                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 text-brand-primary rounded-xl text-xs font-black uppercase hover:bg-brand-primary hover:text-white transition shadow-sm"
                                                    >
                                                        🖨️ Imprimir
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (showMonitoringForm && monitoringToEdit) {
                                                                setMonitoringToEdit(null);
                                                                reset();
                                                            } else {
                                                                setShowMonitoringForm(!showMonitoringForm);
                                                            }
                                                        }}
                                                        className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-black uppercase hover:opacity-90 transition shadow-lg shadow-primary-100"
                                                    >
                                                        {showMonitoringForm ? 'Cancelar' : '+ Registrar Signos'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                            {showMonitoringForm && (
                                <form onSubmit={submitMonitoring} className="bg-white dark:bg-[#1B2132] p-8 rounded-3xl shadow-xl border-2 border-brand-primary/20 animate-in fade-in slide-in-from-top-4">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6">Registro de constantes vitales</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Temp (°C)</label>
                                                <WarningIcon status={checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'temp', data.temperature)} range={VITAL_RANGES[(hospitalization.pet.species?.toLowerCase() === 'canino' || hospitalization.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(hospitalization.pet.dob)]['temp']} />
                                            </div>
                                            <input type="number" step="0.1" value={data.temperature} onChange={e => setData('temperature', e.target.value)} className={`w-full rounded-xl focus:ring-2 focus:ring-brand-primary placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors border ${checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'temp', data.temperature) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10' : checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'temp', data.temperature) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'bg-slate-50 dark:bg-[#111822] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'}`} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Frec. Cardio</label>
                                                <WarningIcon status={checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'hr', data.heart_rate)} range={VITAL_RANGES[(hospitalization.pet.species?.toLowerCase() === 'canino' || hospitalization.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(hospitalization.pet.dob)]['hr']} />
                                            </div>
                                            <input type="number" value={data.heart_rate} onChange={e => setData('heart_rate', e.target.value)} className={`w-full rounded-xl focus:ring-2 focus:ring-brand-primary placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors border ${checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'hr', data.heart_rate) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10' : checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'hr', data.heart_rate) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'bg-slate-50 dark:bg-[#111822] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'}`} />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Frec. Resp</label>
                                                <WarningIcon status={checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'rr', data.respiratory_rate)} range={VITAL_RANGES[(hospitalization.pet.species?.toLowerCase() === 'canino' || hospitalization.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(hospitalization.pet.dob)]['rr']} />
                                            </div>
                                            <input type="number" value={data.respiratory_rate} onChange={e => setData('respiratory_rate', e.target.value)} className={`w-full rounded-xl focus:ring-2 focus:ring-brand-primary placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors border ${checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'rr', data.respiratory_rate) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10' : checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'rr', data.respiratory_rate) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'bg-slate-50 dark:bg-[#111822] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Color Mucosas</label>
                                            <select value={data.mucosa_color} onChange={e => setData('mucosa_color', e.target.value)} className="w-full bg-slate-50 dark:bg-[#111822] border-0 rounded-xl text-xs py-3 focus:ring-2 focus:ring-brand-primary">
                                                <option value="">Seleccionar...</option>
                                                <option value="Rosa normal">Rosa normal</option>
                                                <option value="Pálido/blanco">Pálido/blanco</option>
                                                <option value="Rojo intenso">Rojo intenso</option>
                                                <option value="Azulada/morada">Azulada/morada</option>
                                                <option value="Amarillenta">Amarillenta</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">CC (Condición)</label>
                                            <input type="text" value={data.bcs} onChange={e => setData('bcs', e.target.value)} className="w-full bg-slate-50 dark:bg-[#111822] border-0 rounded-xl focus:ring-2 focus:ring-brand-primary" placeholder="Ej: 5/9" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Ganglios</label>
                                            <select value={data.lymph_nodes} onChange={e => setData('lymph_nodes', e.target.value)} className="w-full bg-slate-50 dark:bg-[#111822] border-0 rounded-xl text-xs py-3 focus:ring-2 focus:ring-brand-primary">
                                                <option value="">Seleccionar...</option>
                                                <option value="Normal">Normales</option>
                                                <option value="Aumentados">Aumentados</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Palp. Abdominal</label>
                                            <select value={data.abdominal_palpation} onChange={e => setData('abdominal_palpation', e.target.value)} className="w-full bg-slate-50 dark:bg-[#111822] border-0 rounded-xl text-xs py-3 focus:ring-2 focus:ring-brand-primary">
                                                <option value="">Seleccionar...</option>
                                                <option value="Normal">Normal</option>
                                                <option value="Dolor Leve">Dolor Leve</option>
                                                <option value="Dolor Moderado">Dolor Moderado</option>
                                                <option value="Dolor Severo">Dolor Severo</option>
                                                <option value="Masa palpable">Masa palpable</option>
                                            </select>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">TLLC (seg)</label>
                                                <WarningIcon status={checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'crt', data.capillary_refill_time)} range={VITAL_RANGES[(hospitalization.pet.species?.toLowerCase() === 'canino' || hospitalization.pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(hospitalization.pet.dob)]['crt']} />
                                            </div>
                                            <input type="text" value={data.capillary_refill_time} onChange={e => setData('capillary_refill_time', e.target.value)} className={`w-full rounded-xl focus:ring-2 focus:ring-brand-primary placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-colors border ${checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'crt', data.capillary_refill_time) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10' : checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'crt', data.capillary_refill_time) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'bg-slate-50 dark:bg-[#111822] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'}`} placeholder="Ej: 2" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2 mt-1">
                                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Escala Dolor (Glasgow)</label>
                                                <button type="button" onClick={() => setShowGlasgowModal(true)} className="text-[9px] font-black uppercase bg-brand-primary/10 dark:bg-brand-primary/30 text-brand-primary dark:text-brand-primary px-2 py-1 flex items-center gap-1 rounded hover:opacity-80 transition cursor-pointer z-10">
                                                    Calcular
                                                </button>
                                            </div>
                                            <input type="range" min="0" max={hospitalization.pet.species === 'Canino' ? 24 : 20} value={data.pain_score} onChange={e => setData('pain_score', e.target.value)} className="w-full accent-brand-primary" />
                                            <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                                                <span>{data.pain_score} / {hospitalization.pet.species === 'Canino' ? 24 : 20}</span>
                                                <span className={data.pain_score > (hospitalization.pet.species === 'Canino' ? 6 : 5) ? 'text-red-500 uppercase font-black' : 'text-emerald-500 uppercase font-black'}>
                                                    {data.pain_score > (hospitalization.pet.species === 'Canino' ? 6 : 5) ? 'Revisar Analgesia' : 'Estable'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Medicamentos Administrados</label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {['Analgésicos', 'Antiinflamatorios', 'Antibióticos', 'Cardiovasculares', 'Psicofármacos', 'Gastrointestinales', 'Antialérgicos', 'Otros'].map(tag => (
                                                    <button key={tag} type="button" onClick={() => addMedTag(tag)} className="px-2 py-1 bg-slate-100 dark:bg-[#1B2132] hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary text-[10px] font-bold rounded transition-colors text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                                                        + {tag}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea rows="2" value={data.medication_administered} onChange={e => setData('medication_administered', e.target.value)} className="w-full bg-slate-50 dark:bg-[#111822] border-0 rounded-xl focus:ring-2 focus:ring-brand-primary text-sm"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Notas y Observaciones</label>
                                            <textarea rows="2" value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full bg-slate-50 dark:bg-[#111822] border-0 rounded-xl focus:ring-2 focus:ring-brand-primary text-sm"></textarea>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button type="submit" disabled={processing} className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition disabled:opacity-50">
                                                {monitoringToEdit ? 'Actualizar Registro' : 'Guardar Registro en Kardex'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {hospitalization.monitorings.map((m) => (
                                <div key={m.id} className="bg-white dark:bg-[#1B2132] p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-200 dark:border-slate-700/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-10 bg-brand-primary rounded-full"></div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900 dark:text-white">{format(new Date(m.created_at), "HH:mm 'Hrs'", { locale: es })}</p>
                                                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{format(new Date(m.created_at), "d 'de' MMMM", { locale: es })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Registrado por</p>
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    {m.recorder?.name} <span className="text-[10px] text-brand-primary opacity-70">({m.recorder?.role === 'admin' ? 'Administrador' : m.recorder?.role === 'vet' ? 'Médico Veterinario' : m.recorder?.role === 'groomer' ? 'Estilista' : m.recorder?.role === 'receptionist' ? 'Recepción' : m.recorder?.role || 'Personal'})</span>
                                                </p>
                                            </div>
                                            {canManage && hospitalization.status === 'active' && (
                                                <div className="flex gap-2 shrink-0">
                                                    <button onClick={() => handleEditMonitoring(m)} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition" title="Editar">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteMonitoring(m.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition" title="Eliminar">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                        <div className="bg-slate-50 dark:bg-[#111822]/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Temperatura</p>
                                            <p className="text-lg font-black text-brand-primary flex items-center">{m.temperature}°C {checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'temp', m.temperature) === 'high' && <span className="text-xs text-red-500 ml-1">▲</span>}{checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'temp', m.temperature) === 'low' && <span className="text-xs text-blue-500 ml-1">▼</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-[#111822]/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">FC / FR</p>
                                            <p className="text-lg font-black text-gray-700 dark:text-gray-200 flex items-center flex-wrap">
                                                {m.heart_rate} {checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'hr', m.heart_rate) === 'high' && <span className="text-xs text-red-500 ml-1">▲</span>}{checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'hr', m.heart_rate) === 'low' && <span className="text-xs text-blue-500 ml-1">▼</span>}
                                                <span className="mx-2">/</span>
                                                {m.respiratory_rate} {checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'rr', m.respiratory_rate) === 'high' && <span className="text-xs text-red-500 ml-1">▲</span>}{checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'rr', m.respiratory_rate) === 'low' && <span className="text-xs text-blue-500 ml-1">▼</span>}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-[#111822]/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Mucosas / LLC</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center">{m.mucosa_color} • {m.capillary_refill_time}s {checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'crt', m.capillary_refill_time) === 'high' && <span className="text-xs text-red-500 ml-1">▲</span>}{checkRange(hospitalization.pet.species, hospitalization.pet.dob, 'crt', m.capillary_refill_time) === 'low' && <span className="text-xs text-blue-500 ml-1">▼</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-[#111822]/30 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Escala Dolor</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500" style={{ width: `${m.pain_score * 10}%` }}></div>
                                                </div>
                                                <span className="text-sm font-black text-slate-600 dark:text-slate-400">{m.pain_score}/10</span>
                                            </div>
                                        </div>
                                    </div>

                                    {(m.medication_administered || m.notes) && (
                                        <div className="space-y-4">
                                            {m.medication_administered && (
                                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-sm">
                                                    <span className="font-black text-blue-800 dark:text-blue-300 mr-2">💊 TRATAMIENTO:</span>
                                                    <span className="text-blue-700 dark:text-blue-400">{m.medication_administered}</span>
                                                </div>
                                            )}
                                            {m.notes && (
                                                <div className="text-sm text-slate-600 dark:text-slate-400 italic">
                                                    " {m.notes} "
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {hospitalization.monitorings.length === 0 && !showMonitoringForm && (
                                <div className="p-12 text-center bg-slate-50 dark:bg-[#1B2132] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2.5rem]">
                                    <p className="text-slate-500 dark:text-slate-400 italic">No hay registros de monitoreo aún. Inicie el primer registro de signos vitales.</p>
                                </div>
                            )}

                            {/* Enviar a Caja (Cobros Pendientes) */}
                            {canManage && hospitalization.status === 'active' && (
                                <div className="mt-8 bg-white dark:bg-[#1B2132] p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700/50">
                                    <PendingChargesEditor 
                                        charges={data.pending_charges}
                                        products={products}
                                        onAddCharge={(p) => setData('pending_charges', [...data.pending_charges, p])}
                                        onRemoveCharge={(idx) => setData('pending_charges', data.pending_charges.filter((_, i) => i !== idx))}
                                        onUpdateCharge={(idx, field, value) => {
                                            const newCharges = [...data.pending_charges];
                                            newCharges[idx][field] = value;
                                            setData('pending_charges', newCharges);
                                        }}
                                        onSave={() => {
                                            router.patch(route('hospitalizations.update', hospitalization.id), { 
                                                pending_charges: data.pending_charges 
                                            }, {
                                                onSuccess: () => setData('pending_charges', []),
                                                preserveScroll: true
                                            });
                                        }}
                                        allowSave={true}
                                        saveLabel="Cargar a PDV"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Discharge/Actions */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-[#1B2132] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700/50">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Acciones de Alta</h3>

                                {hospitalization.status === 'active' ? (
                                    canManage ? (
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => {
                                                    if (confirm('¿Confirmar Alta Médica del paciente?')) {
                                                        router.patch(route('hospitalizations.update', hospitalization.id), {
                                                            status: 'discharged',
                                                            discharge_notes: 'Alta médica por mejoría.'
                                                        });
                                                    }
                                                }}
                                                className="w-full py-4 bg-green-100 text-green-700 rounded-2xl text-xs font-black uppercase hover:bg-green-700 hover:text-white transition"
                                            >
                                                ✅ Alta Médica
                                            </button>
                                            {can('manage euthanasias') && (
                                                <Link
                                                    href={route('consents.create', [hospitalization.pet.id, { type: 'euthanasia' }])}
                                                    className="block w-full text-center py-4 bg-purple-100 text-purple-700 rounded-2xl text-xs font-black uppercase hover:bg-purple-700 hover:text-white transition"
                                                >
                                                    ⚖️ Protocolo Eutanasia
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Por favor, indica la causa o razón de la defunción:');
                                                    if (reason !== null) {
                                                        router.patch(route('hospitalizations.update', hospitalization.id), {
                                                            status: 'expired',
                                                            discharge_notes: reason || 'Defunción registrada en internamiento.'
                                                        });
                                                    }
                                                }}
                                                className="w-full py-4 bg-red-100 text-red-700 rounded-2xl text-xs font-black uppercase hover:bg-red-700 hover:text-white transition"
                                            >
                                                ⚠️ Reportar Defunción
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 dark:bg-[#111822] text-center p-6 rounded-2xl">
                                            <p className="text-xs font-medium text-gray-500 italic pb-2">Modo lectura</p>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm pb-2">
                                                Visualización de Expediente
                                            </p>
                                            <div className="text-[10px] font-bold text-brand-primary uppercase bg-white dark:bg-[#1B2132] p-2 rounded-lg border border-brand-primary/20">
                                                No tienes permisos de administrador
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="bg-slate-50 dark:bg-[#111822] text-center p-6 rounded-2xl">
                                        <p className="text-xs font-medium text-gray-500 italic pb-2">Paciente dado de alta el:</p>
                                        <p className="font-black text-slate-900 dark:text-white pb-2">
                                            {format(new Date(hospitalization.discharge_date || hospitalization.updated_at), "d 'de' MMMM", { locale: es })}
                                        </p>
                                        <div className="text-[10px] font-bold text-brand-primary uppercase bg-white dark:bg-[#1B2132] p-2 rounded-lg border border-brand-primary/20">
                                            {hospitalization.discharge_notes || 'Sin notas adicionales'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-[#1B2132] p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700/50">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Documentos Legales</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-6">Genera responsivas, contratos o actas para este ingreso.</p>
                                {canManage && (
                                    <button
                                        onClick={() => setShowPrintModal(true)}
                                        className="w-full py-4 bg-brand-primary text-white rounded-2xl text-xs font-black uppercase hover:opacity-90 transition shadow-lg shadow-brand-primary/20"
                                    >
                                        📄 Centro de Impresión
                                    </button>
                                )}
                            </div>

                            <div className="bg-brand-primary p-8 rounded-3xl text-white shadow-xl shadow-primary-100">
                                <h4 className="font-black text-lg mb-4">Información Dueño</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Nombre</p>
                                        <p className="font-bold">{hospitalization.pet.owner?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Teléfono</p>
                                        <p className="font-bold text-lg">{hospitalization.pet.owner?.phone}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <a
                                            href={`tel:${hospitalization.pet.owner?.phone}`}
                                            className="flex items-center justify-center gap-2 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black uppercase tracking-wide transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Llamar
                                        </a>
                                        <a
                                            href={getWhatsAppLink(hospitalization.pet.owner?.phone)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 py-3 bg-[#25D366]/80 hover:bg-[#25D366] rounded-xl text-xs font-black uppercase tracking-wide transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PrintDocumentModal 
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                pet={hospitalization.pet}
                documentTemplates={templates}
                customPrintRoute={(template) => route('hospitalizations.consent.print', { hospitalization: hospitalization.id, template: template.id })}
            >
                <div className="mb-6 pb-6 border-b dark:border-gray-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reportes Especiales</p>
                    <a
                        href={route('hospitalizations.report', hospitalization.id)}
                        target="_blank"
                        className="flex items-center gap-3 p-4 bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 dark:border-brand-primary/30 rounded-2xl hover:bg-brand-primary/10 transition-all group"
                    >
                        <span className="text-xl">📋</span>
                        <div className="flex-1 overflow-hidden">
                            <p className="font-bold text-sm text-brand-primary truncate">Resumen de Hospitalización</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Reporte técnico con Kardex y Tratamiento</p>
                        </div>
                    </a>
                </div>
            </PrintDocumentModal>
        </AuthenticatedLayout>
    );
}
