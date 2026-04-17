import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';

export default function Create({ auth, clients, products, pets, selectedClientId, activeRegister, currentStats, generalPublicClient, staff, pendingCharges, posPrinterName, posTicketPreview }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: selectedClientId || generalPublicClient?.id || '',
        items: [],
        payment_method: 'cash',
        mixed_cash_amount: '',
        notes: '',
        pending_charge_ids: [],
    });

    const { flash, settings } = usePage().props;
    const hasPermission = (permission) => auth.user?.role === 'admin' || auth.permissions?.includes(permission);

    useEffect(() => {
        if (flash?.message) {
            setLocalSuccessMessage(flash.message);
            const timer = setTimeout(() => {
                setLocalSuccessMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.message]);

    useEffect(() => {
        if (flash && flash.print_movement_id) {
            window.open(route('cash.print', flash.print_movement_id), '_blank', 'noopener,noreferrer');
        }
        if (flash && flash.print_receipt_id) {
            window.open(route('receipts.print', flash.print_receipt_id), '_blank', 'width=400,height=600,noopener,noreferrer');
            emptyCart();
            setReceivedAmount('');
            setShowBalance(false);
            if (searchInputRef.current) searchInputRef.current.focus();
        }
    }, [flash?.print_movement_id, flash?.print_receipt_id]);

    const { data: openData, setData: setOpenData, post: postOpen, processing: processingOpen, errors: openErrors, reset: resetOpen } = useForm({
        opening_amount: '', notes: ''
    });
    const handleOpenSubmit = (e) => {
        e.preventDefault();
        postOpen(route('cash-register.open'), { onSuccess: () => resetOpen() });
    };

    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal } = useForm({
        amount: '', description: '', type: 'out', method: 'cash'
    });
    const handleWithdrawalSubmit = (e) => {
        e.preventDefault();
        postWithdrawal(route('cash.store'), {
            onSuccess: () => { setShowWithdrawalModal(false); resetWithdrawal(); router.reload({ only: ['currentStats'] }); }
        });
    };

    const [showCloseModal, setShowCloseModal] = useState(false);
    const { data: closeData, setData: setCloseData, post: postClose, processing: processingClose } = useForm({
        closing_amount: '', notes: ''
    });
    const handleCloseSubmit = (e) => {
        e.preventDefault();
        if (activeRegister) {
            postClose(route('cash-register.close', activeRegister.id), { onSuccess: () => { setShowCloseModal(false); } });
        }
    };

    const [showInventoryModal, setShowInventoryModal] = useState(false);
    const [inventorySearch, setInventorySearch] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState('all');

    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const { data: printerData, setData: setPrinterData, post: postPrinter, processing: processingPrinter } = useForm({
        pos_printer_name: posPrinterName || 'POS-80',
        pos_ticket_preview: posTicketPreview || false
    });
    
    const [localSuccessMessage, setLocalSuccessMessage] = useState(null);
    const searchInputRef = React.useRef(null);

    const handlePrinterSubmit = (e) => {
        e.preventDefault();
        postPrinter(route('settings.pos-printer.update'), { onSuccess: () => setShowSettingsModal(false) });
    };

    const [searchType, setSearchType] = useState('client');
    const [generalSearch, setGeneralSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const [productSearch, setProductSearch] = useState('');
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);

    const [selectedPet, setSelectedPet] = useState(null);
    const [selectedClient, setSelectedClient] = useState(clients.find(c => c.id === selectedClientId) || generalPublicClient || null);
    const [receivedAmount, setReceivedAmount] = useState('');
    const [showBalance, setShowBalance] = useState(false);

    const filteredSearchOptions = useMemo(() => {
        if (!generalSearch) return [];
        const query = generalSearch.toLowerCase();
        if (searchType === 'client') {
            return clients.filter(c => 
                c.name.toLowerCase().includes(query) || 
                (c.phone && c.phone.includes(query)) ||
                c.pets?.some(p => p.name.toLowerCase().includes(query))
            ).slice(0, 8);
        } else {
            return pets?.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(query);
                const ownerMatch = p.owner?.name?.toLowerCase().includes(query) || 
                                 p.owners?.some(o => o.name?.toLowerCase().includes(query));
                const breedMatch = p.breed?.toLowerCase().includes(query);
                return nameMatch || ownerMatch || breedMatch;
            }).slice(0, 8) || [];
        }
    }, [generalSearch, searchType, clients, pets]);

    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        const search = productSearch.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(search) || (p.barcode && p.barcode.toLowerCase().includes(search)) || (p.sku && p.sku.toLowerCase().includes(search))).slice(0, 10);
    }, [productSearch, products]);

    const filteredInventory = useMemo(() => {
        let filtered = products;
        if (inventoryFilter === 'product') filtered = filtered.filter(p => !p.is_service);
        else if (inventoryFilter === 'service') filtered = filtered.filter(p => p.is_service);
        if (inventorySearch) {
            const search = inventorySearch.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || (p.barcode && p.barcode.toLowerCase().includes(search)) || (p.sku && p.sku.toLowerCase().includes(search)));
        }
        return filtered.slice(0, 50);
    }, [inventorySearch, inventoryFilter, products]);

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setData('user_id', client.id);
        setGeneralSearch('');
        setIsSearchOpen(false);
    };

    const loadClientFromPet = (pet) => {
        setSelectedPet(pet);
        setGeneralSearch('');
        setIsSearchOpen(false);
        let owner = null;
        if (pet.owners && pet.owners.length > 0) owner = pet.owners[0];
        else if (pet.owner) owner = pet.owner;
        else if (pet.user_id) owner = clients.find(c => c.id === pet.user_id);
        if (owner) {
            setSelectedClient(owner);
            setData('user_id', owner.id);
        }
    };

    const handleGeneralSelect = (option) => {
        if (searchType === 'client') handleClientSelect(option);
        else loadClientFromPet(option);
    };

    const handleProductSelect = (product) => {
        setData('items', [
            ...data.items,
            {
                product_id: product.id, concept: product.name, unit_price: Number(product.price), quantity: 1,
                tax_iva: (product.tax_iva !== null && product.tax_iva !== undefined) ? parseFloat(product.tax_iva) : (product.is_service ? 0 : 16),
                tax_ieps: (product.tax_ieps !== null && product.tax_ieps !== undefined) ? parseFloat(product.tax_ieps) : 0,
                type: product.is_service ? 'service' : 'product',
                assigned_user_id: '',
            }
        ]);
        setProductSearch('');
        setIsProductSearchOpen(false);
        if (searchInputRef.current) searchInputRef.current.focus();
    };

    const clientPendingCharges = useMemo(() => {
        if (!selectedClient) return [];
        return (pendingCharges || []).filter(pc => 
            pc.client_id == selectedClient.id && 
            !data.pending_charge_ids.includes(pc.id)
        );
    }, [selectedClient, pendingCharges, data.pending_charge_ids]);

    const handlePendingChargeSelect = (charge) => {
        setData(d => ({
            ...d,
            items: [...d.items, {
                product_id: charge.product_id,
                concept: charge.product?.name || 'Cargo Pendiente',
                unit_price: Number(charge.product?.price || 0),
                quantity: Number(charge.quantity),
                tax_iva: charge.product?.tax_iva || (charge.product?.is_service ? 0 : 16),
                tax_ieps: charge.product?.tax_ieps || 0,
                type: charge.product?.is_service ? 'service' : 'product',
                assigned_user_id: charge.assigned_user_id || '',
                notes: charge.notes
            }],
            pending_charge_ids: [...d.pending_charge_ids, charge.id]
        }));
    };

    const handleProductKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const exactMatch = products.find(p => p.barcode === productSearch || p.sku === productSearch);
            if (exactMatch) handleProductSelect(exactMatch);
            else if (filteredProducts.length === 1) handleProductSelect(filteredProducts[0]);
        }
    };

    const updateQuantity = (index, delta) => {
        const newItems = [...data.items];
        if (newItems[index].quantity + delta > 0) {
            newItems[index].quantity += delta;
            setData('items', newItems);
        }
    };

    const updateAssignedUser = (index, userId) => {
        const newItems = [...data.items];
        newItems[index].assigned_user_id = userId;
        setData('items', newItems);
    };

    const removeItem = (index) => setData('items', data.items.filter((_, i) => i !== index));
    const emptyCart = () => setData('items', []);

    const totals = useMemo(() => {
        return data.items.reduce((acc, item) => {
            const qty = Number(item.quantity || 0);
            const lineFinal = qty * Number(item.unit_price || 0);
            
            const ivaP = Number(item.tax_iva || 0) / 100;
            const iepsP = Number(item.tax_ieps || 0) / 100;

            // Desglose inverso
            const divisor = (1 + iepsP) * (1 + ivaP);
            const lineBase = divisor > 0 ? lineFinal / divisor : lineFinal;
            const lineIeps = lineBase * iepsP;
            const lineIva = (lineBase + lineIeps) * ivaP;

            return {
                subtotal: acc.subtotal + lineBase,
                iva: acc.iva + lineIva,
                ieps: acc.ieps + lineIeps,
                total: acc.total + lineFinal
            };
        }, { subtotal: 0, iva: 0, ieps: 0, total: 0 });
    }, [data.items]);

    const subtotal = Math.round(totals.subtotal * 100) / 100;
    const taxTotals = { 
        iva: Math.round(totals.iva * 100) / 100, 
        ieps: Math.round(totals.ieps * 100) / 100 
    };
    const tax = Math.round((taxTotals.iva + taxTotals.ieps) * 100) / 100;
    const total = Math.round(totals.total * 100) / 100;

    const submit = (e) => {
        e.preventDefault();
        post(route('receipts.store'), {
            onSuccess: () => {
                reset();
                setReceivedAmount('');
                setGeneralSearch('');
                setSelectedPet(null);
                setSelectedClient(generalPublicClient || null);
            }
        });
    };

    const handlePrintLatest = () => {
        if (flash?.print_receipt_id) {
            window.open(route('receipts.print', flash.print_receipt_id), '_blank', 'width=400,height=600,noopener,noreferrer');
        }
    };

    return (
        <div className="h-[100dvh] w-full flex flex-col bg-gray-100 dark:bg-[#0f111a] text-gray-800 dark:text-gray-200 overflow-hidden font-sans transition-colors duration-300">
            <Head title="Punto de Venta" />

            {!activeRegister ? (
                <div className="flex-1 flex items-center justify-center p-6 print:hidden">
                    <div className="bg-white dark:bg-[#1A2131] rounded-[2rem] border border-gray-200 dark:border-[#2A3347] shadow-2xl p-10 max-w-xl w-full text-center">
                        <div className="w-24 h-24 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-purple-500/10">🔒</div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">POS Bloqueado</h2>
                        {hasPermission('manage cash register') ? (
                            <>
                                <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 text-sm">Debes abrir el turno de caja e ingresar tu fondo inicial para operar.</p>
                                <form onSubmit={handleOpenSubmit} className="space-y-6 text-left">
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input type="number" step="0.01" value={openData.opening_amount} onChange={e => setOpenData('opening_amount', e.target.value)} placeholder="500.00" className="w-full bg-gray-50 dark:bg-[#111623] border border-gray-200 dark:border-[#2A3347] rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-purple-500 font-black text-gray-900 dark:text-white text-lg transition-colors" required />
                                    </div>
                                    <button type="submit" disabled={processingOpen} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 transition-all">{processingOpen ? 'Abriendo...' : 'Abrir Turno'}</button>
                                </form>
                            </>
                        ) : (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4"><p className="text-red-600 dark:text-red-400 text-sm font-bold uppercase">Caja Cerrada. Pide a un gerente aperturar turno.</p></div>
                        )}
                        <div className="mt-8 text-center text-xs text-gray-500"><Link href={route('dashboard')} className="hover:text-purple-600 dark:hover:text-white transition">← Volver al Sistema</Link></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="h-auto md:h-20 py-4 md:py-0 bg-white dark:bg-[#1A2131] border-b border-gray-200 dark:border-[#2A3347] flex flex-col md:flex-row items-start md:items-center justify-between px-6 gap-4 shrink-0 z-40 print:hidden relative transition-colors">
                        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-start">
                            <div className="flex items-center gap-4">
                                <Link href={route('dashboard')} title="Regresar al Dashboard" className="w-10 h-10 bg-purple-600 hover:bg-purple-50 rounded-xl flex items-center justify-center text-white font-black shadow-lg transition-all group">
                                    <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                </Link>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xl font-black text-gray-900 dark:text-white tracking-widest uppercase leading-none">{settings?.site_name || 'POS'}</span>
                                    <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 tracking-[0.2em] uppercase mt-1">POS System</span>
                                </div>
                                <div className="h-8 w-px bg-gray-200 dark:bg-[#2A3347] mx-2 hidden sm:block"></div>
                            </div>
                            <div className="flex flex-col gap-0.5 items-end md:items-start">
                                <span className="text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>Turno Abierto
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase hidden sm:inline">En Caja:</span>
                                    <span className="text-gray-900 dark:text-white font-black text-sm">{showBalance ? `$${currentStats ? parseFloat(currentStats.expected_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}` : '****'}</span>
                                    <button onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-purple-600 dark:hover:text-white transition" title="Ver Saldo">👁</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                            <button onClick={() => setShowSettingsModal(true)} className="w-10 h-10 bg-gray-100 dark:bg-[#111623] hover:bg-gray-200 dark:hover:bg-[#2A3347] rounded-xl flex shrink-0 items-center justify-center text-gray-600 dark:text-gray-400 transition-all shadow-sm" title="Configuración PDV">⚙️</button>
                            <Link href={route('receipts.index')} className="hidden xl:flex bg-gray-50 dark:bg-[#111623] hover:bg-purple-50 dark:hover:bg-[#2A3347] border border-gray-200 dark:border-[#2A3347] px-4 py-2 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest transition items-center gap-2">📄 Ventas</Link>
                            {flash?.print_receipt_id && (
                                <button onClick={handlePrintLatest} className="hidden xl:flex bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 rounded-lg text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest transition items-center gap-2">🖨️ Reimprimir Ticket</button>
                            )}
                            <button onClick={() => setShowInventoryModal(true)} className="hidden xl:flex bg-gray-50 dark:bg-[#111623] hover:bg-purple-50 dark:hover:bg-[#2A3347] border border-gray-200 dark:border-[#2A3347] px-4 py-2 rounded-lg text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest transition items-center gap-2">🔍 Buscar</button>
                            <button onClick={() => setShowWithdrawalModal(true)} className="hidden xl:flex bg-gray-50 dark:bg-[#111623] hover:bg-purple-50 dark:hover:bg-[#2A3347] border border-gray-200 dark:border-[#2A3347] px-4 py-2 rounded-lg text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest transition items-center gap-2">💸 Retirar</button>
                            <button onClick={() => setShowCloseModal(true)} className="hidden xl:flex bg-gray-50 dark:bg-red-500/10 border border-gray-200 px-4 py-2 rounded-lg text-[10px] font-bold text-red-600 dark:text-blue-400">🔐 Corte Z</button>
                            <div className="h-8 w-px bg-gray-200 dark:bg-[#2A3347] mx-2 hidden xl:block"></div>
                            <div className="bg-gray-50 dark:bg-[#111623] border border-gray-200 dark:border-[#2A3347] rounded-[2rem] flex flex-col sm:flex-row items-center p-1 w-full md:w-[400px] relative gap-1 sm:gap-0">
                                <div className="w-full sm:w-auto flex bg-white dark:bg-[#1A2131] rounded-full p-0.5 shrink-0 border border-gray-100 dark:border-transparent">
                                    <button onClick={() => { setSearchType('client'); setGeneralSearch(''); }} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${searchType === 'client' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-purple-600'}`}>Cliente</button>
                                    <button onClick={() => { setSearchType('pet'); setGeneralSearch(''); }} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${searchType === 'pet' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-purple-600'}`}>Mascota</button>
                                </div>
                                <div className="flex-1 relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">🔍</div>
                                    <input type="text" className="w-full bg-transparent border-none py-2 pl-9 pr-4 text-sm font-bold text-gray-800 dark:text-white focus:ring-0 placeholder-gray-400" placeholder={`Buscar ${searchType === 'client' ? 'cliente' : 'mascota'}...`} value={generalSearch} onChange={e => { setGeneralSearch(e.target.value); setIsSearchOpen(true); }} onFocus={() => setIsSearchOpen(true)} onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)} />
                                    {isSearchOpen && filteredSearchOptions.length > 0 && (
                                        <div className="absolute z-50 top-full right-0 mt-3 w-[400px] bg-white dark:bg-[#1A2131] border border-gray-200 dark:border-[#2A3347] shadow-2xl rounded-2xl p-2 max-h-80 overflow-y-auto">
                                            {filteredSearchOptions.map(opt => {
                                                const ownerName = opt.owner?.name || (opt.owners && opt.owners[0]?.name);
                                                const petsList = opt.pets || [];
                                                return (
                                                    <div key={opt.id} onClick={() => handleGeneralSelect(opt)} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2A3347] rounded-xl cursor-pointer transition border-b border-gray-50 dark:border-gray-800 last:border-0">
                                                        <div className="flex justify-between items-center">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-bold text-gray-900 dark:text-white leading-tight truncate">
                                                                    {opt.name}
                                                                    {searchType === 'client' && petsList.length > 0 && (
                                                                        <span className="text-[9px] text-brand-primary ml-2 italic font-black">🐾 {petsList.map(p => p.name).join(', ')}</span>
                                                                    )}
                                                                </p>
                                                                <div className="flex flex-col gap-0.5 mt-1">
                                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tight truncate">
                                                                        {searchType === 'pet' 
                                                                            ? `${opt.species || 'Mascota'} • ${opt.breed || 'Sin Raza'} • ${ownerName || 'Público General'}` 
                                                                            : `${opt.phone || 'Sin Teléfono'}`}
                                                                    </p>

                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                                                {searchType === 'pet' ? (
                                                                    <span className={`text-[9px] ${opt.species === 'Canino' ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-amber-100 text-amber-600 border-amber-200'} dark:bg-opacity-20 px-2 py-0.5 rounded-full font-black border uppercase tracking-tighter`}>
                                                                        {opt.species || 'Mascota'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-black border border-gray-200 dark:border-gray-700 uppercase tracking-tighter">
                                                                        Cliente
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col xl:flex-row gap-4 md:gap-6 p-4 md:p-6 overflow-y-auto xl:overflow-hidden min-h-0">
                        {/* Seccion Izquierda: Productos (6.5/10) */}
                        <div className="flex-[6.5] flex flex-col bg-white dark:bg-[#1A2131] border border-gray-200 dark:border-[#2A3347] rounded-[2rem] shadow-2xl relative transition-colors duration-300">
                            {localSuccessMessage && (
                                <div className="absolute top-2 right-2 left-2 z-[60] bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between font-black uppercase text-[10px] animate-in slide-in-from-top-4 duration-500">
                                    <span>✅ {localSuccessMessage}</span>
                                    <button onClick={() => setLocalSuccessMessage(null)} className="opacity-50 hover:opacity-100">✖</button>
                                </div>
                            )}
                            <div className="p-5 border-b border-gray-200 dark:border-[#2A3347] shrink-0 bg-gray-50 dark:bg-[#111623]/20">
                                    <div className="relative z-[100]">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🛒</span>
                                        <input ref={searchInputRef} type="text" className="w-full bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-[#2A3347] rounded-xl py-4 pl-14 pr-6 text-gray-900 dark:text-white font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-gray-400" placeholder="Escanea o busca productos..." value={productSearch} onChange={e => { setProductSearch(e.target.value); setIsProductSearchOpen(true); }} onFocus={() => setIsProductSearchOpen(true)} onBlur={() => setTimeout(() => setIsProductSearchOpen(false), 200)} onKeyDown={handleProductKeyDown} autoFocus />
                                        {isProductSearchOpen && filteredProducts.length > 0 && (
                                            <div className="absolute z-[200] top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A2131] border border-gray-200 dark:border-[#2A3347] shadow-2xl rounded-2xl p-2 max-h-80 overflow-y-auto backdrop-blur-md">
                                            {filteredProducts.map(p => (
                                                <div key={p.id} onClick={() => handleProductSelect(p)} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2A3347] rounded-xl cursor-pointer flex justify-between items-center group transition">
                                                    <div><p className="font-bold text-gray-700 dark:text-gray-200 uppercase leading-tight">{p.name}</p><p className="text-[10px] text-gray-500 uppercase mt-1">SKU: {p.sku || p.barcode || 'S/C'}</p></div>
                                                    <p className="font-black text-gray-900 dark:text-white px-3 py-1 bg-gray-100 dark:bg-[#111623] rounded-lg">${parseFloat(p.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex px-8 py-4 border-b border-gray-100 dark:border-[#2A3347] bg-gray-50/50 dark:bg-[#1A2131] text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shrink-0">
                                <div className="flex-[3]">Descripción</div><div className="w-32 text-center">Cant.</div><div className="w-32 text-right">Precio</div><div className="w-32 text-right">Total</div><div className="w-12"></div>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-[#2A3347]">
                                {/* Cargos Pendientes Alert */}
                                {clientPendingCharges.length > 0 && (
                                    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🔔</span>
                                                <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Servicios Pendientes por Cobrar ({clientPendingCharges.length})</p>
                                            </div>
                                            <span className="text-[9px] font-bold text-amber-500 bg-white dark:bg-black/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 tracking-tighter uppercase">Caja / PDV</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {clientPendingCharges.map(charge => (
                                                <button
                                                    key={charge.id}
                                                    type="button"
                                                    onClick={() => handlePendingChargeSelect(charge)}
                                                    className="flex flex-col p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800/50 hover:border-amber-500 hover:shadow-lg transition-all text-left group"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase leading-tight group-hover:text-amber-600 truncate flex-1">{charge.product?.name || 'Servicio'}</span>
                                                        <span className="text-[10px] font-black text-emerald-600 ml-2 shrink-0">${parseFloat(charge.product?.price || 0).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-gray-100 dark:border-slate-700">
                                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">Cant: {charge.quantity}</span>
                                                        {charge.pet && <span className="text-[8px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-tighter">🐾 {charge.pet.name}</span>}
                                                    </div>
                                                    {charge.notes && <p className="text-[7px] text-gray-400 font-bold uppercase mt-1 italic truncate italic">"{charge.notes}"</p>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {data.items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30"><span className="text-6xl mb-4">🩺</span><p className="text-xs font-black uppercase text-gray-500 tracking-[0.2em]">Seleccione productos</p></div>
                                ) : (
                                    <div className="space-y-1">
                                        {data.items.map((item, idx) => (
                                            <div key={idx} className={`flex items-center px-4 py-3 border rounded-2xl transition-all group ${item.type === 'service' ? 'bg-purple-50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/20' : 'hover:bg-gray-50 border-transparent dark:hover:bg-white/5'}`}>
                                                <div className="flex-[3] pr-4">
                                                    <p className="font-bold text-sm uppercase text-gray-900 dark:text-white">{item.concept}</p>
                                                    {item.type === 'service' && (
                                                        <select className="bg-white dark:bg-[#111623] text-gray-800 dark:text-white border border-gray-200 dark:border-[#2A3347] rounded p-1 text-[10px] mt-1" value={item.assigned_user_id} onChange={(e) => updateAssignedUser(idx, e.target.value)}>
                                                            <option value="">Persona...</option>{staff?.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                                        </select>
                                                    )}
                                                </div>
                                                <div className="w-32 flex items-center justify-center gap-1">
                                                    <button type="button" onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 rounded-lg border text-gray-400 hover:border-purple-500 hover:text-purple-600 transition-colors">-</button>
                                                    <span className="font-black w-7 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 rounded-lg border text-gray-400 hover:border-purple-500 hover:text-purple-600 transition-colors">+</button>
                                                </div>
                                                <div className="w-32 text-right font-black text-gray-900 dark:text-white text-base">${(item.quantity * item.unit_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
                                                <div className="w-12 text-right"><button type="button" onClick={() => removeItem(idx)} className="text-gray-200 hover:text-red-500 transition-colors">✖</button></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#111623] border-t border-gray-200 dark:border-[#2A3347] shrink-0 transition-colors duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-[#1A2131] border border-gray-200 dark:border-[#2A3347] rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
                                        <span className="text-xl opacity-60">👤</span>
                                        <div><p className="text-[8px] font-black uppercase text-gray-400 leading-none mb-1">Cliente</p><p className="font-black text-[11px] text-gray-800 dark:text-gray-200 uppercase">{selectedClient ? selectedClient.name : 'Público en General'}</p></div>
                                    </div>
                                    {selectedPet && <div className="bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20 rounded-xl px-4 py-2 flex items-center gap-3 transition-colors duration-300"><span className="text-xl opacity-60">🐾</span><div><p className="text-[8px] font-black uppercase text-purple-600 leading-none mb-1">Paciente</p><p className="font-black text-[11px] text-purple-800 dark:text-white uppercase">{selectedPet.name}</p></div></div>}
                                </div>
                                <button type="button" onClick={emptyCart} disabled={data.items.length === 0} className="text-[10px] font-black text-gray-400 hover:text-red-500 transition tracking-widest">LIMPIAR CARRITO</button>
                            </div>
                        </div>

                        {/* Seccion Derecha: Pago y Resumen (3.5/10) */}
                        <div className="flex-[3.5] flex flex-col gap-6 shrink-0 w-full xl:max-w-[500px]">
                            {/* Resumen Total: Dos Columnas */}
                            <div className="bg-gradient-to-br from-purple-700 to-indigo-900 rounded-[2rem] p-6 shadow-2xl border border-white/10 shrink-0">
                                <div className="grid grid-cols-2 gap-4 items-center">
                                    <div className="space-y-1.5 border-r border-white/10 pr-4">
                                        <div className="flex justify-between items-center text-white/70">
                                            <span className="text-[9px] font-black uppercase tracking-widest">Subtotal</span>
                                            <span className="text-xs font-bold">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        {taxTotals.ieps > 0 && (
                                            <div className="flex justify-between items-center text-white/70">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[#A78BFA]">IEPS</span>
                                                <span className="text-xs font-bold font-mono">${taxTotals.ieps.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        {taxTotals.iva > 0 && (
                                            <div className="flex justify-between items-center text-white/70">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">IVA</span>
                                                <span className="text-xs font-bold font-mono">${taxTotals.iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black uppercase text-white/60 tracking-[0.2em] mb-1">Total a Liquidar</span>
                                        <div className="flex items-start gap-0.5 text-white">
                                            <span className="text-xl font-black mt-2 leading-none">$</span>
                                            <span className="text-5xl font-black tracking-tighter drop-shadow-lg leading-tight">{total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nueva Distribución Vertical de Pago */}
                            <div className="bg-white dark:bg-[#1A2131] border border-gray-200 dark:border-[#2A3347] rounded-[2rem] p-4 sm:p-6 flex-1 flex flex-col sm:flex-row gap-6 shadow-xl transition-colors duration-300">
                                {/* Columna 1: Métodos de Pago */}
                                <div className="w-full sm:w-1/3 flex flex-row sm:flex-col border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-[#2A3347] pb-4 sm:pb-0 sm:pr-4 overflow-x-auto sm:overflow-visible scrollbar-none">
                                    <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-4 shrink-0">Método</h3>
                                    <div className="flex sm:flex-1 flex-row sm:flex-col gap-2 shrink-0">
                                        {[ 
                                            { id: 'cash', label: 'Efectivo', icon: '💵' }, 
                                            { id: 'card', label: 'Tarjeta', icon: '💳' }, 
                                            { id: 'transfer', label: 'Transf.', icon: '🏦' }, 
                                            { id: 'mixed', label: 'Mixto', icon: '📝' }, 
                                        ].map(method => (
                                            <button key={method.id} type="button" onClick={() => {
                                                setData('payment_method', method.id);
                                                if (method.id !== 'mixed') setData('mixed_cash_amount', '');
                                            }} disabled={method.id === 'credit' && (selectedClient?.id === generalPublicClient?.id)} className={`flex-1 min-h-[50px] rounded-xl flex items-center px-4 gap-3 border transition-all ${data.payment_method === method.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-sm' : 'border-gray-50 bg-gray-50/20 hover:bg-white dark:bg-white/5 text-gray-400 dark:text-gray-400 border-transparent dark:border-[#2A3347] dark:hover:bg-white/10'}`}>
                                                <span className="text-xl">{method.icon}</span>
                                                <span className="text-[9px] font-black uppercase tracking-tight">{method.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Columna 2: Detalles y Confirmación */}
                                <div className="w-full sm:w-2/3 flex flex-col justify-between flex-1 gap-4">
                                    <div className="space-y-4 pb-4">
                                        {data.payment_method === 'cash' && (
                                            <div className="space-y-3 animate-in fade-in duration-300 slide-in-from-right-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efectivo Recibido</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl">$</span>
                                                        <input type="number" step="0.01" value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white border border-gray-100 dark:border-[#2A3347] rounded-xl py-2 pl-8 pr-4 font-black text-xl focus:ring-1 focus:ring-purple-500 transition-all shadow-inner" placeholder="0.00" />
                                                    </div>
                                                </div>
                                                {receivedAmount && Number(receivedAmount) >= total && (
                                                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                                                        <div>
                                                            <p className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-[8px] tracking-widest leading-none mb-1">Cambio p/ Cliente</p>
                                                            <p className="text-emerald-600 dark:text-emerald-400 font-black text-xl leading-none">${(Number(receivedAmount) - total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                                        </div>
                                                        <span className="text-2xl animate-bounce">💰</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {data.payment_method === 'mixed' && (
                                            <div className="space-y-3 animate-in fade-in duration-300 slide-in-from-right-2">
                                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                                    <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold mb-1 uppercase tracking-tight">Cobro Mixto (Efectivo + Tarjeta)</p>
                                                    <p className="text-[9px] text-indigo-600/60 dark:text-indigo-400/60 leading-tight">Define cuánto recibes en efectivo, el resto se cargará a tarjeta automáticamente.</p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300 font-black text-lg">$</span>
                                                        <input type="number" step="0.01" value={data.mixed_cash_amount} onChange={e => setData('mixed_cash_amount', e.target.value)} className="w-full bg-indigo-50/30 dark:bg-[#0B0F19] text-indigo-900 dark:text-indigo-100 border border-indigo-100 dark:border-[#2A3347] rounded-xl py-2 pl-8 pr-4 font-black text-lg focus:ring-1 focus:ring-indigo-500" placeholder="0.00" />
                                                    </div>
                                                </div>
                                                {data.mixed_cash_amount && Number(data.mixed_cash_amount) < total && (
                                                    <div className="flex justify-between text-[10px] font-black uppercase text-indigo-500 p-1">
                                                        <span>A Tarjeta:</span>
                                                        <span>${(total - Number(data.mixed_cash_amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Comentarios Internos</label>
                                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full bg-gray-50/50 dark:bg-[#0B0F19] border border-gray-100 dark:border-[#2A3347] rounded-xl py-2 px-3 text-[12px] font-medium text-gray-600 dark:text-gray-300 focus:ring-1 focus:ring-purple-500 transition-all resize-none shadow-inner min-h-[40px]" rows="1" placeholder="Ej: Pago pendiente..."></textarea>
                                        </div>
                                    </div>

                                    {Object.keys(errors).length > 0 && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 shrink-0 transition-all animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[9px] font-black text-red-600 uppercase mb-1">⚠️ Error al Procesar Pago:</p>
                                            <ul className="list-disc list-inside text-[9px] text-red-500 font-bold uppercase">
                                                {Object.entries(errors).map(([key, err]) => <li key={key}>{err}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    <button 
                                        type="button" 
                                        onClick={submit} 
                                        disabled={
                                            processing || 
                                            data.items.length === 0 || 
                                            !data.user_id || 
                                            (data.payment_method === 'cash' && (!receivedAmount || parseFloat(receivedAmount) < total)) ||
                                            (data.payment_method === 'mixed' && (!data.mixed_cash_amount || isNaN(total) || parseFloat(data.mixed_cash_amount) >= total))
                                        } 
                                        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-lg shadow-purple-500/10 active:scale-[98%] transition-all border-b-4 border-purple-800 disabled:grayscale disabled:opacity-30"
                                    >
                                        {processing ? 'CARGANDO...' : 'CONFIRMAR VENTA'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modales mantenidos igual por consistencia y funcionalidad */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm print:hidden">
                    <div className="bg-white dark:bg-[#1A2131] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-[#2A3347]">
                        <div className="p-6 border-b border-gray-100 dark:border-[#2A3347] flex justify-between items-center bg-gray-50 dark:bg-[#111623]/50">
                            <h3 className="text-lg font-black uppercase text-gray-800 dark:text-white leading-none">Ajustes del Punto de Venta</h3>
                            <button onClick={() => setShowSettingsModal(false)} className="text-2xl text-gray-400 hover:text-red-500 transition">×</button>
                        </div>
                        <form onSubmit={handlePrinterSubmit} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-500/20">
                                    <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1 leading-none">Impresora Especial (80mm)</p>
                                    <p className="text-[11px] text-purple-800/60 dark:text-purple-300/60 leading-relaxed">Solo los tickets generados aquí se enviarán a esta impresora.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del dispositivo</label>
                                    <input type="text" value={printerData.pos_printer_name} onChange={e => setPrinterData('pos_printer_name', e.target.value)} className="w-full bg-white dark:bg-[#111623] border border-gray-200 dark:border-[#2A3347] rounded-xl py-3 px-4 font-bold dark:text-white focus:ring-1 focus:ring-purple-500" placeholder="Ej: EpsonPOS80" required />
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-transparent cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-all" onClick={() => setPrinterData('pos_ticket_preview', !printerData.pos_ticket_preview)}>
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${printerData.pos_ticket_preview ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {printerData.pos_ticket_preview && <span>✓</span>}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-gray-800 dark:text-white">Activar Vista Previa</span>
                                        <span className="text-[9px] text-gray-500 font-bold uppercase">Muestra el ticket antes de imprimir</span>
                                    </div>
                                    <input type="checkbox" className="hidden" checked={printerData.pos_ticket_preview} onChange={e => setPrinterData('pos_ticket_preview', e.target.checked)} />
                                </div>
                            </div>
                            <button type="submit" disabled={processingPrinter} className="w-full bg-purple-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-purple-700 transition active:scale-95">{processingPrinter ? 'Guardando...' : 'Aplicar Cambios'}</button>
                        </form>
                    </div>
                </div>
            )}
            
            {showWithdrawalModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm print:hidden">
                    <div className="bg-white dark:bg-[#1A2131] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-[#2A3347]">
                        <div className="p-6 border-b border-gray-100 dark:border-[#2A3347] flex justify-between items-center bg-gray-50 dark:bg-[#111623]/50">
                            <h3 className="text-lg font-black uppercase text-gray-800 dark:text-white">Retirar Efectivo</h3>
                            <button onClick={() => setShowWithdrawalModal(false)} className="text-2xl text-gray-400">×</button>
                        </div>
                        <form onSubmit={handleWithdrawalSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-purple-600 dark:text-[#A78BFA] uppercase tracking-widest ml-1">Monto ($)</label>
                                <input type="number" autoFocus step="0.01" min="0.01" value={withdrawalData.amount} onChange={e => setWithdrawalData('amount', e.target.value)} className="w-full bg-gray-50 dark:bg-[#111623] dark:text-white border border-gray-200 dark:border-[#2A3347] rounded-2xl py-3 px-4 font-black" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Motivo del Retiro</label>
                                <textarea value={withdrawalData.description} onChange={e => setWithdrawalData('description', e.target.value)} className="w-full bg-gray-50 dark:bg-[#111623] dark:text-white border border-gray-200 dark:border-[#2A3347] rounded-2xl py-3 px-4" rows="2" required></textarea>
                            </div>
                            <button type="submit" disabled={processingWithdrawal} className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition active:scale-95 leading-none">{processingWithdrawal ? 'Haciendo...' : 'Confirmar Retiro'}</button>
                        </form>
                    </div>
                </div>
            )}

            {showCloseModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm print:hidden">
                    <div className="bg-white dark:bg-[#1A2131] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-[#2A3347]">
                        <div className="p-6 border-b border-gray-100 dark:border-[#2A3347] flex justify-between items-center bg-red-50 dark:bg-red-500/10">
                            <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white leading-none">Cierre de Caja</h3>
                            <button onClick={() => setShowCloseModal(false)} className="text-2xl text-gray-400">×</button>
                        </div>
                        <form onSubmit={handleCloseSubmit} className="p-6 space-y-6">
                            <div className="bg-gray-50 dark:bg-[#111623] rounded-2xl p-4 border border-gray-200 dark:border-[#2A3347] text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cálculo del Sistema:</p>
                                <p className="font-black text-3xl text-gray-900 dark:text-white leading-none">${currentStats ? parseFloat(currentStats.expected_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-red-600 uppercase ml-1">Efectivo en Caja ($)</label>
                                <input type="number" autoFocus step="0.01" min="0" value={closeData.closing_amount} onChange={e => setCloseData('closing_amount', e.target.value)} className="w-full bg-white dark:bg-[#111623] dark:text-white border border-gray-200 dark:border-[#2A3347] rounded-xl py-4 px-4 font-black text-3xl text-center focus:ring-1 focus:ring-red-500" required />
                            </div>
                            <button type="submit" disabled={processingClose} className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase active:scale-95 transition-all text-sm">{processingClose ? 'Cerrando...' : 'Finalizar Turno'}</button>
                        </form>
                    </div>
                </div>
            )}

            {showInventoryModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md print:hidden">
                    <div className="bg-white dark:bg-[#1A2131] rounded-[2.5rem] w-full max-w-2xl border border-gray-200 dark:border-[#2A3347] overflow-hidden flex flex-col max-h-[80vh] shadow-2xl">
                        <div className="p-6 border-b border-gray-100 dark:border-[#2A3347] flex justify-between items-center bg-gray-50 dark:bg-[#111623]/50 shrink-0">
                            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase leading-none">📦 Stock de Almacén</h3>
                            <button onClick={() => setShowInventoryModal(false)} className="text-3xl text-gray-400 hover:text-white transition">×</button>
                        </div>
                        <div className="p-6 flex flex-col flex-1 overflow-hidden transition-colors duration-300">
                            <div className="relative mb-6">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 opacity-50 text-lg">🔍</span>
                                <input type="text" autoFocus className="w-full bg-white dark:bg-[#0B0F19] dark:text-white border border-gray-200 dark:border-[#2A3347] rounded-xl py-4 pl-12 pr-6 font-bold focus:ring-1 focus:ring-purple-500 transition-all shadow-sm" placeholder="Buscar producto por nombre o SKU..." value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
                                {filteredInventory.length > 0 ? filteredInventory.map(item => (
                                    <div key={item.id} onClick={() => { handleProductSelect(item); setShowInventoryModal(false); }} className="cursor-pointer flex justify-between items-center bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent p-4 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all duration-200">
                                        <div className="flex flex-col">
                                            <h4 className="font-black text-gray-800 dark:text-white text-sm uppercase leading-tight">{item.name}</h4>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-tight">{item.category?.name || 'Varios'} • {item.sku || 'Sin SKU'}</p>
                                        </div>
                                        <div className="text-right pl-4 border-l border-gray-200 dark:border-white/10 shrink-0">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Disponibles</p>
                                            <p className={`text-base font-black leading-none ${(parseFloat(item.current_stock) || 0) > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-amber-500'}`}>{Math.floor(parseFloat(item.current_stock) || 0)}</p>
                                        </div>
                                    </div>
                                )) : <div className="text-center py-10"><p className="text-gray-400 uppercase font-black text-[10px] tracking-widest opacity-50">Sin resultados en inventario</p></div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                body { transition: background-color 0.3s ease; }
                .dark body { background-color: #0f111a !important; }
                body { background-color: #f3f4f6 !important; margin: 0; padding: 0; }
                input::placeholder { font-weight: 500; opacity: 0.5; }
                ::-webkit-scrollbar { width: 5px; height: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                .dark ::-webkit-scrollbar-thumb { background: #2A3347; }
                ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .scrollbar-none::-webkit-scrollbar { display: none; }
                @media print { body { background-color: white !important; } }
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                    -webkit-appearance: none; 
                    margin: 0; 
                }
            `}} />
        </div>
    );
}
