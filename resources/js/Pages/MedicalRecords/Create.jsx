import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import MedicationsEditor from '@/Components/MedicationsEditor';
import PendingChargesEditor from '@/Components/PendingChargesEditor';
import PetAlertIcons from '@/Components/PetAlertIcons';

const formatDate = (dateString) => {
    if (!dateString) return "Desconocida";
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

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
    if (status === 'low') return <span title={`Anormal (Bajo). Rango normal: ${range[0]} - ${range[1]}`} className="text-[9px] text-blue-500 font-black animate-pulse bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap border border-blue-200 dark:border-blue-800">▼ BAJO ({range[0]}-{range[1]})</span>;
    if (status === 'high') return <span title={`Anormal (Alto). Rango normal: ${range[0]} - ${range[1]}`} className="text-[9px] text-red-500 font-black animate-pulse bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded ml-1 whitespace-nowrap border border-red-200 dark:border-red-800">▲ ALTO ({range[0]}-{range[1]})</span>;
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

const sexMap = {
    "Male": "Macho",
    "Female": "Hembra",
    "Spayed": "Hembra Esterilizada",
    "Neutered": "Macho Castrado",
    "Unknown": "Desconocido"
};

const PillSelector = ({ options, value, onChange, colorClass = "bg-brand-primary" }) => (
    <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
            <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${value === opt
                    ? `${colorClass} text-white shadow-lg shadow-${colorClass.split('-')[1]}-500/30 ring-2 ring-${colorClass.split('-')[1]}-400 ring-offset-1 ring-offset-slate-900 border border-transparent scale-105`
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:bg-slate-700 hover:text-slate-800 dark:text-slate-200'
                    }`}
            >
                {opt}
            </button>
        ))}
    </div>
);

export default function Create({ auth, pet, products, prefill, record, isEditing = false }) {
    const [previews, setPreviews] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { data, setData, post, put, processing, errors } = useForm({
        appointment_id: prefill?.appointment_id || '',
        type: record?.type || prefill?.type || 'consultation',
        user_id: record?.user_id || prefill?.vet_id || auth.user.id,
        created_at: record?.created_at ? format(new Date(record.created_at), "yyyy-MM-dd'T'HH:mm") : (prefill?.date || format(new Date(), "yyyy-MM-dd'T'HH:mm")),
        subjective: record?.subjective || '',
        objective: record?.objective || '',
        assessment: record?.assessment || '',
        plan: record?.plan || '',
        vital_signs: record?.vital_signs || {
            weight: pet.weight || '',
            temp: '',
            hr: '',
            rr: '',
            mucous: '',
            bcs: '',
            tllc: '',
            lymph_nodes: '',
            abdominal_palpation: ''
        },
        anamnesis: record?.anamnesis || {
            reason: '',
            mood: 'Alerta',
            appetite: 'Normal',
            vomiting: 'Ausente',
            stool: 'Normal',
            diarrhea: 'Ausente',
            urination: 'Normal',
            urine_color: 'Amarillo',
            cough_reflex: 'Ausente',
            swallowing_reflex: 'Presente',
            nasal_discharge: 'Ausente',
            nasal_discharge_notes: '',
            auricular_discharge: 'Ausente',
            auricular_discharge_notes: '',
            vulvar_discharge: 'Ausente',
            vulvar_discharge_notes: '',
            vaccine_history: '',
            vaccine_date: '',
            deworming_history: '',
            deworming_date: '',
            diet: ''
        },
        physical_state: record?.physical_state || 'Ideal',
        attachments: [],
        pending_charges: [],
        medications: record?.medications || [],
        applied_medications: record?.applied_medications || [],
    });

    const [medSearchQuery, setMedSearchQuery] = useState('');
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('medical-records.update', record.id), {
                onSuccess: () => setData('pending_charges', []),
                preserveScroll: true,
            });
        } else {
            post(route('medical-records.store', pet.id), {
                onSuccess: () => setData('pending_charges', []),
            });
        }
    };

    const updateVitalSign = (field, value) => {
        setData('vital_signs', { ...data.vital_signs, [field]: value });
    };

    const updateAnamnesis = (field, value) => {
        setData('anamnesis', { ...data.anamnesis, [field]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setData('attachments', files);
        const newPreviews = files.map(file => {
            if (file.type.startsWith('image/')) {
                return URL.createObjectURL(file);
            }
            return null;
        });
        setPreviews(newPreviews);
    };

    const addCharge = (product) => {
        setData('pending_charges', [...data.pending_charges, { 
            product_id: product.id, 
            name: product.name,
            price: product.price,
            quantity: 1, 
            notes: '' 
        }]);
        setSearchQuery('');
    };

    const removeCharge = (idx) => {
        setData('pending_charges', data.pending_charges.filter((_, i) => i !== idx));
    };

    const updateCharge = (idx, field, value) => {
        const newCharges = [...data.pending_charges];
        newCharges[idx][field] = value;
        setData('pending_charges', newCharges);
    };

    const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const safeProducts = Array.isArray(products) ? products : Object.values(products || {});
    const safeQuery = normalize(searchQuery);
    const filteredProducts = safeQuery
        ? safeProducts.filter(p => normalize(p?.name).includes(safeQuery)).slice(0, 10)
        : [];

    const addMedication = (product) => {
        setData('medications', [...data.medications, {
            id: product.id,
            name: product.name,
            dosage: '',
            frequency: '',
            duration: '',
            notes: ''
        }]);
        setMedSearchQuery('');
    };

    const removeMedication = (idx) => {
        setData('medications', data.medications.filter((_, i) => i !== idx));
    };

    const updateMedication = (idx, field, value) => {
        const newMeds = [...data.medications];
        newMeds[idx][field] = value;
        setData('medications', newMeds);
    };

    const filteredMeds = medSearchQuery
        ? safeProducts.filter(p => normalize(p.name).includes(normalize(medSearchQuery))).slice(0, 5)
        : [];

    // Common styling abstractions based on mockup
    const cardBase = "bg-white dark:bg-[#1B2132] border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-xl p-6";
    const headerTitle = "text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4";

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={false}
        >
            <Head title={`Consulta - ${pet.name}`} />

            <div className="min-h-screen bg-slate-50 dark:bg-[#111822] text-slate-700 dark:text-slate-300 py-8 font-sans transition-colors duration-200">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Mejorado con Acciones Superiores */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link href={route('pets.show', pet.id)} className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200 dark:border-slate-700">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                    {isEditing ? `Modificar Consulta #${record.id}` : 'Nueva Consulta Clínica'}
                                </h1>
                                <p className="text-[10px] text-brand-primary font-bold uppercase tracking-[0.2em] mt-2">Expediente Médico de {pet.name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isEditing && (
                                <>
                                    <a href={route('medical-records.prescription.print', record.id)} target="_blank" className="px-5 py-2.5 bg-brand-primary hover:opacity-90 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg transition-all flex items-center gap-2">
                                        🖨️ Receta
                                    </a>
                                    <a href={route('medical-records.report.print', record.id)} target="_blank" className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg transition-all flex items-center gap-2">
                                        📄 Reporte
                                    </a>
                                </>
                            )}
                            <Link href={route('pets.show', pet.id)} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg transition-all flex items-center gap-2">
                                Cerrar
                            </Link>
                        </div>
                    </div>


                    <form id="medical-record-form" onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start overflow-visible">

                        {/* Columna Izquierda (3-4 cols) */}
                        <div className="xl:col-span-3 space-y-6">

                            {/* Resumen del Paciente */}
                            <div className={cardBase}>
                                <h3 className={`${headerTitle} text-slate-500 dark:text-slate-400`}>
                                    <span className="text-brand-primary">🐾</span> Resumen del Paciente
                                </h3>
                                <div className="flex items-center gap-4 mt-4 mb-6">
                                    <div className="w-14 h-14 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary border-2 border-brand-primary/30 shadow-lg shadow-brand-primary/20 flex-shrink-0 overflow-hidden relative">
                                        {pet.photo_path ? (
                                            <img src={`/storage/${pet.photo_path}`} alt={pet.name} className="w-full h-full object-cover" />
                                        ) : pet.species?.toLowerCase() === 'felino' || pet.species?.toLowerCase() === 'gato' ? (
                                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4L16 6.5L13 4L12 8L11 4L8 6.5L5 4V13C5 17.4183 8.58172 21 13 21C17.4183 21 21 17.4183 21 13V4H19Z" /></svg>
                                        ) : (
                                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{pet.name}</h4>
                                            <PetAlertIcons pet={pet} size="sm" />
                                        </div>
                                        <p className="text-[11px] text-brand-primary/70 font-semibold">{pet.species} • {pet.breed?.name || pet.breed || 'Mestizo'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-700/50 pt-4">
                                    <div className="col-span-2">
                                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Fecha de Nacimiento</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {formatDate(pet.dob)}
                                        </p>
                                        {pet.dob && <p className="text-[10px] text-brand-primary/80 font-bold mt-0.5">{calculateAge(pet.dob)}</p>}
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1">Sexo</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{sexMap[pet.gender] || pet.gender}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Historial Médico */}
                            <div className={`${cardBase} border-brand-primary/30 overflow-hidden relative`}>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-bl-full blur-xl"></div>
                                <h3 className={`${headerTitle} text-brand-primary mb-6 relative z-10`}>
                                    <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Historia Médico Anamnesico
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-300 dark:border-slate-800 focus-within:border-brand-primary/50 transition-colors">
                                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-2">Vacunas y Fecha de Aplicación</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input type="text" placeholder="Vacuna..." value={data.anamnesis.vaccine_history} onChange={e => updateAnamnesis('vaccine_history', e.target.value)} className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2" />
                                            <input type="date" value={data.anamnesis.vaccine_date} onChange={e => updateAnamnesis('vaccine_date', e.target.value)} className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2 [color-scheme:dark]" />
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-300 dark:border-slate-800 focus-within:border-brand-primary/50 transition-colors">
                                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-2">Desparasitación y Fecha</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input type="text" placeholder="Desparasitante..." value={data.anamnesis.deworming_history} onChange={e => updateAnamnesis('deworming_history', e.target.value)} className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2" />
                                            <input type="date" value={data.anamnesis.deworming_date} onChange={e => updateAnamnesis('deworming_date', e.target.value)} className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2 [color-scheme:dark]" />
                                        </div>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-300 dark:border-slate-800 focus-within:border-brand-primary/50 transition-colors">
                                        <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-2">Dieta Actual</p>
                                        <input type="text" placeholder="Tipo de dieta / Croquetas..." value={data.anamnesis.diet} onChange={e => updateAnamnesis('diet', e.target.value)} className="w-full bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2 uppercase font-semibold" />
                                    </div>
                                </div>
                            </div>

                            {/* Constantes Vitales */}
                            <div className={cardBase}>
                                <h3 className={`${headerTitle} text-red-400`}>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                                    Constantes Vitales
                                </h3>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Peso (kg)</label>
                                        <input type="number" step="0.01" value={data.vital_signs.weight} onChange={e => updateVitalSign('weight', e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary transition-all font-semibold" placeholder="0.00" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center w-full">
                                            <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Temp (°C)</label>
                                            <WarningIcon status={checkRange(pet.species, pet.dob, 'temp', data.vital_signs.temp)} range={VITAL_RANGES[(pet.species?.toLowerCase() === 'canino' || pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(pet.dob)]?.['temp']} />
                                        </div>
                                        <input type="number" step="0.1" value={data.vital_signs.temp} onChange={e => updateVitalSign('temp', e.target.value)}
                                            className={`w-full bg-slate-100 dark:bg-slate-900/50 border text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary transition-all font-semibold ${checkRange(pet.species, pet.dob, 'temp', data.vital_signs.temp) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20' : checkRange(pet.species, pet.dob, 'temp', data.vital_signs.temp) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700'}`} placeholder="38.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center w-full">
                                            <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">F.C. (BPM)</label>
                                            <WarningIcon status={checkRange(pet.species, pet.dob, 'hr', data.vital_signs.hr)} range={VITAL_RANGES[(pet.species?.toLowerCase() === 'canino' || pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(pet.dob)]?.['hr']} />
                                        </div>
                                        <input type="number" value={data.vital_signs.hr} onChange={e => updateVitalSign('hr', e.target.value)}
                                            className={`w-full bg-slate-100 dark:bg-slate-900/50 border text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary transition-all font-semibold ${checkRange(pet.species, pet.dob, 'hr', data.vital_signs.hr) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20' : checkRange(pet.species, pet.dob, 'hr', data.vital_signs.hr) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700'}`} placeholder="80" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center w-full">
                                            <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">F.R. (RPM)</label>
                                            <WarningIcon status={checkRange(pet.species, pet.dob, 'rr', data.vital_signs.rr)} range={VITAL_RANGES[(pet.species?.toLowerCase() === 'canino' || pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(pet.dob)]?.['rr']} />
                                        </div>
                                        <input type="number" value={data.vital_signs.rr} onChange={e => updateVitalSign('rr', e.target.value)}
                                            className={`w-full bg-slate-100 dark:bg-slate-900/50 border text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary transition-all font-semibold ${checkRange(pet.species, pet.dob, 'rr', data.vital_signs.rr) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20' : checkRange(pet.species, pet.dob, 'rr', data.vital_signs.rr) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700'}`} placeholder="24" />
                                    </div>

                                    <div className="col-span-2 space-y-1 mt-2">
                                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mucosas</label>
                                        <select value={data.vital_signs.mucous} onChange={e => updateVitalSign('mucous', e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary transition-all appearance-none cursor-pointer">
                                            <option value="">Seleccionar...</option>
                                            <option value="Rosa Normal">Rosadas (Normal)</option>
                                            <option value="Pálidas/Blanco">Pálidas/blancas</option>
                                            <option value="Rojo Intenso">Rojo Intenso</option>
                                            <option value="Azulada">Azulada/morada</option>
                                            <option value="Amarillenta">Amarillenta</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">CC (1-9)</label>
                                        <input type="text" value={data.vital_signs.bcs} onChange={e => updateVitalSign('bcs', e.target.value)}
                                            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary transition-all font-semibold" placeholder="5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center w-full">
                                            <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">TLLC (seg)</label>
                                            <WarningIcon status={checkRange(pet.species, pet.dob, 'crt', data.vital_signs.tllc)} range={VITAL_RANGES[(pet.species?.toLowerCase() === 'canino' || pet.species?.toLowerCase() === 'perro') ? 'Canino' : 'Felino'][getAgeGroup(pet.dob)]?.['crt']} />
                                        </div>
                                        <input type="number" value={data.vital_signs.tllc} onChange={e => updateVitalSign('tllc', e.target.value)}
                                            className={`w-full bg-slate-100 dark:bg-slate-900/50 border text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-brand-primary focus:border-brand-primary transition-all font-semibold ${checkRange(pet.species, pet.dob, 'crt', data.vital_signs.tllc) === 'high' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20' : checkRange(pet.species, pet.dob, 'crt', data.vital_signs.tllc) === 'low' ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700'}`} placeholder="2" />
                                    </div>

                                    <div className="col-span-2 space-y-2 mt-2">
                                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ganglios</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => updateVitalSign('lymph_nodes', 'Normal')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${data.vital_signs.lymph_nodes === 'Normal' ? 'bg-brand-primary border border-transparent text-white shadow-lg shadow-brand-primary/30 ring-2 ring-brand-primary/40 ring-offset-1 ring-offset-slate-900 scale-105' : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Normal</button>
                                            <button type="button" onClick={() => updateVitalSign('lymph_nodes', 'Alterado')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${data.vital_signs.lymph_nodes === 'Alterado' ? 'bg-brand-primary border border-transparent text-white shadow-lg shadow-brand-primary/30 ring-2 ring-brand-primary/40 ring-offset-1 ring-offset-slate-900 scale-105' : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Alterado</button>
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Palpación Abdominal</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => updateVitalSign('abdominal_palpation', 'Normal')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${data.vital_signs.abdominal_palpation === 'Normal' ? 'bg-brand-primary border border-transparent text-white shadow-lg shadow-brand-primary/30 ring-2 ring-brand-primary/40 ring-offset-1 ring-offset-slate-900 scale-105' : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Normal</button>
                                            <button type="button" onClick={() => updateVitalSign('abdominal_palpation', 'Alterado')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${data.vital_signs.abdominal_palpation === 'Alterado' ? 'bg-brand-primary border border-transparent text-white shadow-lg shadow-brand-primary/30 ring-2 ring-brand-primary/40 ring-offset-1 ring-offset-slate-900 scale-105' : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-700 hover:text-white'}`}>Alterado</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Estado Físico */}
                            <div className={cardBase}>
                                <h3 className={`${headerTitle} text-emerald-400`}>
                                    ⚖ Estado Físico (BCS)
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-4">
                                    {['Caquéxico', 'Abajo Ideal', 'Ideal', 'Arriba Ideal', 'Obesidad'].map((bcs, idx) => (
                                        <button
                                            key={bcs} type="button" onClick={() => setData('physical_state', bcs)}
                                            className={`py-3 sm:aspect-auto sm:py-2 flex flex-col items-center justify-center rounded-xl border transition-all ${idx === 4 ? 'col-span-2 sm:col-span-1' : ''} ${data.physical_state === bcs
                                                ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/30 ring-2 ring-brand-primary/40 ring-offset-1 ring-offset-slate-900 scale-[1.03]'
                                                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            <span className="text-[8px] font-bold uppercase leading-tight text-center px-1 break-words">{bcs}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Columna Derecha */}
                        <div className="xl:col-span-9 space-y-6 overflow-visible">

                            {/* Motivo de la Consulta Principal */}
                            <div className={cardBase}>
                                <label className="block text-xs font-black text-brand-primary uppercase tracking-widest mb-3">
                                    Motivo de la Consulta
                                </label>
                                <textarea
                                    value={data.anamnesis.reason}
                                    onChange={e => updateAnamnesis('reason', e.target.value)}
                                    rows="1"
                                    className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-300 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl text-lg px-4 py-3 placeholder-slate-600 focus:ring-brand-primary focus:border-brand-primary shadow-inner resize-y transition-all min-h-[50px] font-medium"
                                    placeholder="Ej: Inapetencia desde hace 5 días y decaimiento..."
                                    required
                                ></textarea>
                            </div>

                            {/* Anamnesis Rápida */}
                            <div className={cardBase}>
                                <h3 className={`${headerTitle} text-amber-400 text-sm mb-6`}>
                                    📝 Anamnesis Rápida
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 bg-slate-100 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-300 dark:border-slate-800/50">
                                    {/* 1 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">1. Estado de Ánimo</p>
                                        <PillSelector options={['Alerta', 'Relajado/decaído', 'Nervioso', 'Agresivo']} value={data.anamnesis.mood} onChange={v => updateAnamnesis('mood', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 2 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">2. Apetito</p>
                                        <PillSelector options={['Normal', 'Disminuido', 'Aumentado']} value={data.anamnesis.appetite} onChange={v => updateAnamnesis('appetite', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 3 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">3. Vómito</p>
                                        <PillSelector options={['Ausente', '< 2x/día', '> 3x/día', 'Intermitente']} value={data.anamnesis.vomiting} onChange={v => updateAnamnesis('vomiting', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 4 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">4. Heces</p>
                                        <PillSelector options={['Normal', 'Disminuido', 'Aumentado']} value={data.anamnesis.stool} onChange={v => updateAnamnesis('stool', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 5 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">5. Diarrea</p>
                                        <PillSelector options={['Ausente', '< 2x/día', '> 3x/día', 'Intermitente']} value={data.anamnesis.diarrhea} onChange={v => updateAnamnesis('diarrhea', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 6 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">6. Micción</p>
                                        <PillSelector options={['Normal', 'Disminuido', 'Aumentado']} value={data.anamnesis.urination} onChange={v => updateAnamnesis('urination', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 7 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">7. Color Orina</p>
                                        <PillSelector options={['Transparente', 'Ámbar (oscuro)', 'Amarillo (claro)', 'Hematuria (rojo)']} value={data.anamnesis.urine_color} onChange={v => updateAnamnesis('urine_color', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 8 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">8. Reflejo Tusígeno</p>
                                        <PillSelector options={['Ausente', 'Presente']} value={data.anamnesis.cough_reflex} onChange={v => updateAnamnesis('cough_reflex', v)} colorClass="bg-brand-primary" />
                                    </div>
                                    {/* 9 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">9. Reflejo Deglutorio</p>
                                        <PillSelector options={['Ausente', 'Presente']} value={data.anamnesis.swallowing_reflex} onChange={v => updateAnamnesis('swallowing_reflex', v)} colorClass="bg-brand-primary" />
                                    </div>

                                    {/* 10 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">10. Descarga Nasal</p>
                                        <PillSelector options={['Ausente', 'Presente']} value={data.anamnesis.nasal_discharge} onChange={v => updateAnamnesis('nasal_discharge', v)} colorClass="bg-brand-primary" />
                                        {data.anamnesis.nasal_discharge === 'Presente' && (
                                            <input type="text" placeholder="Observaciones..." className="w-full mt-2 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2 transition-all shadow-inner"
                                                value={data.anamnesis.nasal_discharge_notes} onChange={e => updateAnamnesis('nasal_discharge_notes', e.target.value)} />
                                        )}
                                    </div>
                                    {/* 11 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">11. Descarga Auricular</p>
                                        <PillSelector options={['Ausente', 'Presente']} value={data.anamnesis.auricular_discharge} onChange={v => updateAnamnesis('auricular_discharge', v)} colorClass="bg-brand-primary" />
                                        {data.anamnesis.auricular_discharge === 'Presente' && (
                                            <input type="text" placeholder="Observaciones..." className="w-full mt-2 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2 transition-all shadow-inner"
                                                value={data.anamnesis.auricular_discharge_notes} onChange={e => updateAnamnesis('auricular_discharge_notes', e.target.value)} />
                                        )}
                                    </div>
                                    {/* 12 */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-amber-500/20 pb-1">12. Descarga Vulvar/Prep.</p>
                                        <PillSelector options={['Ausente', 'Presente']} value={data.anamnesis.vulvar_discharge} onChange={v => updateAnamnesis('vulvar_discharge', v)} colorClass="bg-brand-primary" />
                                        {data.anamnesis.vulvar_discharge === 'Presente' && (
                                            <input type="text" placeholder="Observaciones..." className="w-full mt-2 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary/40 px-3 py-2 transition-all shadow-inner"
                                                value={data.anamnesis.vulvar_discharge_notes} onChange={e => updateAnamnesis('vulvar_discharge_notes', e.target.value)} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* SOAP blocks */}
                            <div className="space-y-8 mt-10">
                                {/* S */}
                                <div className="relative pl-12 pr-4 py-2 group">
                                    <div className="absolute left-0 top-1 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center font-black text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">S</div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] mb-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                        Subjetivo <span className="text-slate-500 lowercase tracking-normal italic text-[10px] ml-1">(Anamnesis ampliada / Historia previa)</span>
                                    </label>
                                    <textarea value={data.subjective} onChange={e => setData('subjective', e.target.value)} rows="3"
                                        className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm p-4 focus:ring-blue-500 focus:border-blue-500 shadow-inner" placeholder="Escribe aquí los detalles ampliados..."></textarea>
                                </div>

                                {/* O */}
                                <div className="relative pl-12 pr-4 py-2 group">
                                    <div className="absolute left-0 top-1 w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center font-black text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">O</div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] mb-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                        Objetivo <span className="text-slate-500 lowercase tracking-normal italic text-[10px] ml-1">(Examen físico / Hallazgos directos)</span>
                                    </label>
                                    <textarea value={data.objective} onChange={e => setData('objective', e.target.value)} rows="4"
                                        className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm p-4 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner" placeholder="Anota tus hallazgos clínicos..." required></textarea>
                                </div>

                                {/* A */}
                                <div className="relative pl-12 pr-4 py-2 group">
                                    <div className="absolute left-0 top-1 w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center font-black text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">A</div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] mb-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                        Análisis <span className="text-slate-500 lowercase tracking-normal italic text-[10px] ml-1">(Dx. presuntivo / Diferenciales)</span>
                                    </label>
                                    <textarea value={data.assessment} onChange={e => setData('assessment', e.target.value)} rows="2"
                                        className="w-full bg-slate-50 dark:bg-[#111822] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm p-4 focus:ring-amber-500 focus:border-amber-500 shadow-inner" placeholder="Tu interpretación médica..." required></textarea>
                                </div>



                                {/* P */}
                                <div className="relative pl-12 pr-4 py-2 group">
                                    <div className="absolute left-0 top-1 w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center font-black text-brand-primary border border-brand-primary/30 group-hover:scale-110 transition-transform">P</div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                        Tratamiento / Plan Estratégico <span className="text-slate-500 lowercase tracking-normal italic text-[10px] ml-1">(Indicaciones, Receta y Artículos/Servicios)</span>
                                    </label>
                                    
                                    <div className="flex items-center gap-1.5 ml-4">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPreviewModal(true)}
                                            className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition shadow-sm"
                                        >
                                            👁 Ver Vista Previa Receta
                                        </button>
                                    </div>
                                </div>
                                        
                                        {/* Herramienta de Agregar Fármacos */}
                                        <div className="relative group/med w-full md:w-80">
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    placeholder="🔍 Buscar Artículo o Servicio..." 
                                                    value={medSearchQuery}
                                                    onChange={(e) => setMedSearchQuery(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-full text-[10px] px-4 py-2 focus:ring-brand-primary focus:border-brand-primary placeholder-slate-400 font-bold uppercase transition-all shadow-sm"
                                                />
                                            </div>
                                            {medSearchQuery && (
                                                <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto p-1 ring-1 ring-slate-900/5 transition-all">
                                                    {safeProducts.filter(p => {
                                                        const name = normalize(p?.name);
                                                        const query = normalize(medSearchQuery);
                                                        return name.includes(query);
                                                    }).slice(0, 10).map(med => (
                                                        <button 
                                                            key={`med-${med.id}`}
                                                            type="button"
                                                            onClick={() => addMedication(med)}
                                                            className="w-full text-left px-3 py-2.5 hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 flex flex-col transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-slate-900 dark:text-white uppercase truncate">{med.name}</span>
                                                                {med.is_service ? (
                                                                    <span className="text-[7px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-1 py-0.5 rounded uppercase">Servicio</span>
                                                                ) : (
                                                                    <span className="text-[7px] bg-brand-primary/10 text-brand-primary px-1 py-0.5 rounded uppercase">Stock: {med.stock || 0}</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[8px] text-slate-400 font-normal truncate">{med.category?.name || 'Veterinaria'}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <textarea value={data.plan} onChange={e => setData('plan', e.target.value)} rows="5"
                                        className="w-full bg-white dark:bg-[#111822] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-[2rem] text-sm p-6 focus:ring-brand-primary focus:border-brand-primary shadow-sm mb-4 min-h-[150px]" 
                                        placeholder="Escribe las indicaciones generales para el propietario (dieta, reposo, cuidados especiales)..."></textarea>

                                    {/* Listado de Medicamentos/Servicios con estilo unificado */}
                                    <div className="space-y-3 mt-4">
                                        {data.medications.length > 0 && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Artículos y Servicios Programados (Receta)</p>}
                                            <div className="grid grid-cols-1 gap-2">
                                                {data.medications.map((m, i) => (
                                                    <div key={`m-list-${i}`} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group/med-item">
                                                        <div className="flex justify-between items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                                                                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{m.name}</p>
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => removeMedication(i)} 
                                                                className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dosis / Aplicación</label>
                                                                <input type="text" placeholder="Ej: 5ml / 1 tableta" value={m.dosage} onChange={e => updateMedication(i, 'dosage', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl text-[11px] py-1.5 focus:ring-brand-primary focus:bg-white dark:focus:bg-slate-900 transition-all font-bold" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Frecuencia / Cada</label>
                                                                <input type="text" placeholder="Ej: Cada 8 horas" value={m.frequency} onChange={e => updateMedication(i, 'frequency', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl text-[11px] py-1.5 focus:ring-brand-primary focus:bg-white dark:focus:bg-slate-900 transition-all font-bold" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Duración del Tto.</label>
                                                                <input type="text" placeholder="Ej: Por 5 días" value={m.duration} onChange={e => updateMedication(i, 'duration', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl text-[11px] py-1.5 focus:ring-brand-primary focus:bg-white dark:focus:bg-slate-900 transition-all font-bold" />
                                                            </div>
                                                            <div className="sm:col-span-3">
                                                                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Observaciones / Recomendaciones (Ej: Con alimento)</label>
                                                                <input type="text" placeholder="Instrucciones adicionales..." value={m.notes} onChange={e => updateMedication(i, 'notes', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl text-[11px] py-1.5 focus:ring-brand-primary focus:bg-white dark:focus:bg-slate-900 transition-all" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            {/* Subida de Archivos */}
                            <div className={`${cardBase} border border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-100 dark:bg-slate-800/30 transition-all relative text-center py-12 my-8 group cursor-pointer`}>
                                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <svg className="w-12 h-12 mx-auto text-slate-500 group-hover:text-brand-primary group-hover:scale-110 transition-all mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>

                                <h4 className="text-slate-700 dark:text-slate-300 font-bold mt-2 mb-1 uppercase tracking-widest text-[11px]">Subir Imágenes o PDF</h4>
                                <p className="text-[10px] text-slate-500 tracking-wide uppercase font-medium">Rayos X, Ultrasonido, Laboratorio...</p>

                                {data.attachments.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-8 px-10 relative z-20">
                                        {previews.map((preview, idx) => (
                                            preview ? (
                                                <img key={idx} src={preview} className="w-full aspect-square object-cover rounded-xl border-2 border-slate-600 shadow-lg" alt="Preview" />
                                            ) : (
                                                <div key={idx} className="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-lg uppercase">DOC</div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Enviar a Caja */}
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
                                cardBase={cardBase}
                                headerTitle={headerTitle}
                            />

                            {/* Spacer for sticky footer on mobile */}
                            <div className="h-24 sm:h-0"></div>

                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-[#111822]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 sm:relative sm:bg-transparent sm:border-0 sm:p-0 sm:pt-6 flex flex-col-reverse sm:flex-row justify-end sm:pb-8 gap-3 sm:gap-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] sm:shadow-none">
                                <Link
                                    href={route('pets.show', pet.id)}
                                    className="px-10 py-3 sm:py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sm:bg-slate-900 sm:dark:bg-white sm:text-white sm:dark:text-slate-900 rounded-xl font-bold uppercase text-xs tracking-widest transition-all active:scale-95 text-center shadow-sm sm:shadow-lg sm:shadow-black/20 border border-slate-200 dark:border-slate-700 sm:border-transparent"
                                >
                                    Cerrar / Finalizar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 sm:flex-none px-10 py-3 sm:py-4 bg-brand-primary hover:opacity-90 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-brand-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-brand-primary/50"
                                >
                                    {processing ? 'Guardando...' : (
                                        <>
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                            {isEditing ? 'Actualizar Cambios' : 'Guardar y Continuar'}
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>

                    </form>
                </div>
            </div>

            {/* Modal de Vista Previa de Receta */}
            {showPreviewModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#1B2132] rounded-[2.5rem] w-full max-w-lg border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 sm:p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">👁️ Vista Previa Receta</h3>
                                <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-1">Borrador de indicaciones médicas</p>
                            </div>
                            <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-red-500 transition-colors text-2xl">×</button>
                        </div>

                        <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                            <div className="border-l-4 border-brand-primary pl-4 py-2">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Rx / Prescripción</p>
                                
                                {data.medications.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.medications.map((m, i) => (
                                            <div key={`prev-${i}`} className="border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0">
                                                <p className="font-black text-sm text-slate-900 dark:text-white uppercase leading-tight">{m.name}</p>
                                                <p className="text-xs text-brand-primary font-bold mt-1">
                                                    {m.dosage || '—'} • {m.frequency || '—'} • {m.duration || '—'}
                                                </p>
                                                {m.notes && <p className="text-[10px] text-slate-500 font-medium italic mt-1">{m.notes}</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 font-bold italic">No se han agregado fármacos estructurados.</p>
                                )}
                            </div>

                            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Indicaciones Generales / Plan</p>
                                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                                    {data.plan || 'Sin indicaciones generales registradas.'}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button onClick={() => setShowPreviewModal(false)} className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cerrar Vista Previa</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

