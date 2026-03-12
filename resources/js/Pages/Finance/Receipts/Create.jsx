import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';

export default function Create({ auth, clients, products, pets, selectedClientId, activeRegister, currentStats, generalPublicClient, staff, pendingCharges }) {
    const { data, setData, post, processing } = useForm({
        user_id: selectedClientId || generalPublicClient?.id || '',
        items: [],
        payment_method: 'cash',
        mixed_cash_amount: '',
        notes: '',
        pending_charge_ids: [],
    });

    const { flash } = usePage().props;
    const hasPermission = (permission) => auth.user?.role === 'admin' || auth.permissions?.includes(permission);

    useEffect(() => {
        if (flash && flash.print_movement_id) {
            window.open(route('cash.print', flash.print_movement_id), '_blank', 'noopener,noreferrer');
        }
    }, [flash]);

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
            return clients.filter(c => c.name.toLowerCase().includes(query) || (c.phone && c.phone.includes(query))).slice(0, 8);
        } else {
            return pets?.filter(p => p.name.toLowerCase().includes(query)).slice(0, 8) || [];
        }
    }, [generalSearch, searchType, clients, pets]);

    const filteredProducts = useMemo(() => {
        if (!productSearch) return [];
        const search = productSearch.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(search) || (p.barcode && p.barcode.toLowerCase().includes(search)) || (p.sku && p.sku.toLowerCase().includes(search))).slice(0, 10);
    }, [productSearch, products]);

    const filteredInventory = useMemo(() => {
        if (!inventorySearch) return [];
        const search = inventorySearch.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(search) || (p.barcode && p.barcode.toLowerCase().includes(search)) || (p.sku && p.sku.toLowerCase().includes(search))).slice(0, 10);
    }, [inventorySearch, products]);

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
                product_id: product.id, concept: product.name, unit_price: product.price, quantity: 1,
                tax_iva: product.tax_iva !== undefined ? parseFloat(product.tax_iva) : (product.is_service ? 0 : 16),
                tax_ieps: product.tax_ieps !== undefined ? parseFloat(product.tax_ieps) : 0,
                type: product.is_service ? 'service' : 'product',
                assigned_user_id: '',
            }
        ]);
        setProductSearch('');
        setIsProductSearchOpen(false);
    };

    const importPendingCharge = (charge) => {
        if (data.pending_charge_ids.includes(charge.id)) return; // Already imported

        setData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    product_id: charge.product_id, 
                    concept: charge.product?.name || 'Servicio Médico', 
                    unit_price: charge.product?.price || 0, 
                    quantity: charge.quantity,
                    tax_iva: charge.product?.tax_iva !== undefined ? parseFloat(charge.product.tax_iva) : (charge.product?.is_service ? 0 : 16),
                    tax_ieps: charge.product?.tax_ieps !== undefined ? parseFloat(charge.product.tax_ieps) : 0,
                    type: charge.product?.is_service ? 'service' : 'product',
                    assigned_user_id: charge.assigned_user_id,
                }
            ],
            pending_charge_ids: [...prev.pending_charge_ids, charge.id]
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

    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const taxIvaAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price * (item.tax_iva / 100)), 0);
    const taxIepsAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unit_price * (item.tax_ieps / 100)), 0);
    const tax = taxIvaAmount + taxIepsAmount;
    const total = subtotal + tax;

    const clientPendingCharges = useMemo(() => {
        if (!selectedClient || !pendingCharges) return [];
        return pendingCharges.filter(pc => pc.client_id === selectedClient.id && !data.pending_charge_ids.includes(pc.id));
    }, [selectedClient, pendingCharges, data.pending_charge_ids]);

    const submit = (e) => {
        e.preventDefault();
        post(route('receipts.store'));
    };

    return (
        <div className="h-[100dvh] w-full flex flex-col bg-[#0f111a] text-gray-200 overflow-hidden font-sans">
            <Head title="Punto de Venta" />

            {!activeRegister ? (
                <div className="flex-1 flex items-center justify-center p-6 print:hidden">
                    <div className="bg-[#1A2131] rounded-[2rem] border border-[#2A3347] shadow-2xl p-10 max-w-xl w-full text-center">
                        <div className="w-24 h-24 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-purple-500/10">🔒</div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">POS Bloqueado</h2>
                        {hasPermission('manage cash register') ? (
                            <>
                                <p className="text-gray-400 font-bold mb-8 text-sm">Debes abrir el turno de caja e ingresar tu fondo inicial para operar.</p>
                                <form onSubmit={handleOpenSubmit} className="space-y-6 text-left">
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input type="number" step="0.01" value={openData.opening_amount} onChange={e => setOpenData('opening_amount', e.target.value)} placeholder="500.00" className="w-full bg-[#111623] border border-[#2A3347] rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-purple-500 font-black text-white text-lg transition-colors" required />
                                    </div>
                                    <button type="submit" disabled={processingOpen} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-purple-500/30 transition-all">{processingOpen ? 'Abriendo...' : 'Abrir Turno'}</button>
                                </form>
                            </>
                        ) : (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mt-4"><p className="text-red-400 text-sm font-bold uppercase">Caja Cerrada. Pide a un gerente aperturar turno.</p></div>
                        )}
                        <div className="mt-8 text-center text-xs text-gray-500"><Link href={route('dashboard')} className="hover:text-white transition">← Volver al Sistema</Link></div>
                    </div>
                </div>
            ) : (
                <>
                    {/* TOP BAR */}
                    <div className="h-20 bg-[#1A2131] border-b border-[#2A3347] flex items-center justify-between px-6 shrink-0 z-40 print:hidden relative">
                        <div className="flex items-center gap-6">
                            <Link href={route('dashboard')} title="Salir del POS" className="w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg transition-all">C</Link>
                            <div className="hidden md:flex flex-col">
                                <span className="text-xl font-black text-white tracking-widest uppercase leading-none">CANBULL</span>
                                <span className="text-[9px] font-black text-purple-400 tracking-[0.2em] uppercase mt-1">POS System</span>
                            </div>
                            <div className="h-8 w-px bg-[#2A3347] mx-2"></div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>Turno Abierto
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">En Caja:</span>
                                    <span className="text-white font-black text-sm">{showBalance ? `$${currentStats ? parseFloat(currentStats.expected_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}` : '****'}</span>
                                    <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 hover:text-white transition" title="Ver Saldo">👁</button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href={route('receipts.index')} className="hidden xl:flex bg-[#111623] hover:bg-[#2A3347] border border-[#2A3347] px-4 py-2 rounded-lg text-[10px] font-bold text-gray-300 uppercase tracking-widest transition items-center gap-2">📄 Ventas</Link>
                            <button onClick={() => setShowInventoryModal(true)} className="hidden xl:flex bg-[#111623] hover:bg-[#2A3347] border border-[#2A3347] px-4 py-2 rounded-lg text-[10px] font-bold text-gray-300 uppercase tracking-widest transition items-center gap-2">📦 Almacén</button>
                            <button onClick={() => setShowWithdrawalModal(true)} className="hidden xl:flex bg-[#111623] hover:bg-[#2A3347] border border-[#2A3347] px-4 py-2 rounded-lg text-[10px] font-bold text-purple-400 uppercase tracking-widest transition items-center gap-2">💸 Retesar</button>
                            <button onClick={() => setShowCloseModal(true)} className="hidden xl:flex bg-[#111623] hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-lg text-[10px] font-bold text-red-400 uppercase tracking-widest transition items-center gap-2">🔐 Corte Z</button>

                            <div className="h-8 w-px bg-[#2A3347] mx-2"></div>

                            {/* Client/Pet Search Form Unified */}
                            <div className="bg-[#111623] border border-[#2A3347] rounded-full flex flex-row items-center p-1 w-[320px] md:w-[400px] relative">
                                <div className="flex bg-[#1A2131] rounded-full p-0.5 shrink-0">
                                    <button onClick={() => { setSearchType('client'); setGeneralSearch(''); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${searchType === 'client' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-white'}`}>Cliente</button>
                                    <button onClick={() => { setSearchType('pet'); setGeneralSearch(''); }} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${searchType === 'pet' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-gray-400 hover:text-white'}`}>Mascota</button>
                                </div>
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">🔍</div>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border-none py-2 pl-9 pr-4 text-sm font-bold text-white focus:ring-0 placeholder-gray-500"
                                        placeholder={`Buscar ${searchType === 'client' ? 'cliente' : 'mascota'}...`}
                                        value={generalSearch}
                                        onChange={e => { setGeneralSearch(e.target.value); setIsSearchOpen(true); }}
                                        onFocus={() => setIsSearchOpen(true)}
                                        onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                                    />
                                    {isSearchOpen && filteredSearchOptions.length > 0 && (
                                        <div className="absolute z-50 top-full right-0 mt-3 w-[400px] bg-[#1A2131] border border-[#2A3347] shadow-2xl rounded-2xl p-2 max-h-80 overflow-y-auto">
                                            {filteredSearchOptions.map(opt => (
                                                <div key={opt.id} onClick={() => handleGeneralSelect(opt)} className="px-4 py-3 hover:bg-[#2A3347] rounded-xl cursor-pointer transition">
                                                    <p className="font-bold text-white leading-tight">{opt.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{opt.phone || (opt.breed ? opt.breed : 'Registrado')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 flex flex-col xl:flex-row gap-6 p-6 overflow-hidden min-h-0">

                        {/* LEFT PANE */}
                        <div className="flex-[5] flex flex-col bg-[#1A2131] border border-[#2A3347] rounded-[2rem] overflow-hidden shadow-2xl relative">
                            {/* Product Search Bar */}
                            <div className="p-5 border-b border-[#2A3347] shrink-0 bg-[#111623]/20">
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🛒</span>
                                    <input
                                        type="text"
                                        className="w-full bg-[#0B0F19] border border-[#2A3347] rounded-xl py-4 pl-14 pr-6 text-white font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors placeholder-[#4A5568]"
                                        placeholder="Escanea o busca productos y servicios..."
                                        value={productSearch}
                                        onChange={e => { setProductSearch(e.target.value); setIsProductSearchOpen(true); }}
                                        onFocus={() => setIsProductSearchOpen(true)}
                                        onBlur={() => setTimeout(() => setIsProductSearchOpen(false), 200)}
                                        onKeyDown={handleProductKeyDown}
                                        autoFocus
                                    />
                                    {isProductSearchOpen && filteredProducts.length > 0 && (
                                        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1A2131] border border-[#2A3347] shadow-2xl rounded-2xl p-2 max-h-80 overflow-y-auto">
                                            {filteredProducts.map(p => (
                                                <div key={p.id} onClick={() => handleProductSelect(p)} className="px-4 py-3 hover:bg-[#2A3347] rounded-xl cursor-pointer flex justify-between items-center group transition">
                                                    <div>
                                                        <p className="font-bold text-gray-200 group-hover:text-purple-400 transition-colors uppercase leading-tight">{p.name}</p>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">SKU: {p.sku || p.barcode || 'S/C'} • {!p.is_service ? 'Pro.' : 'Serv.'}</p>
                                                    </div>
                                                    <p className="font-black text-white px-3 py-1 bg-[#111623] rounded-lg border border-[#2A3347] group-hover:border-purple-500/30 group-hover:text-purple-400">${parseFloat(p.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Table Headers */}
                            <div className="flex px-8 py-4 border-b border-[#2A3347] bg-[#1A2131] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] shrink-0">
                                <div className="flex-[3]">Descripción del Ítem</div>
                                <div className="w-32 text-center">Cant.</div>
                                <div className="w-32 text-right">Precio</div>
                                <div className="w-32 text-right">Total</div>
                                <div className="w-12"></div>
                            </div>

                            {/* Table List View (Scrollable) */}
                            <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-[#2A3347] scrollbar-track-transparent">
                                {data.items.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                                        <span className="text-6xl mb-4">🩺</span>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Carrito de Ventas Vacío</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {data.items.map((item, idx) => (
                                            <div key={idx} className={`flex items-center px-4 py-4 border rounded-2xl transition-all group ${item.type === 'service' ? 'bg-[#2D235C]/20 border-purple-500/30 hover:border-purple-500/60' : 'hover:bg-[#2A3347]/30 border-transparent hover:border-[#2A3347]'}`}>
                                                <div className="flex-[3] pr-4">
                                                    <p className={`font-bold text-sm uppercase leading-tight ${item.type === 'service' ? 'text-purple-300' : 'text-white'}`}>{item.concept}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded max-w-max border ${item.type === 'service' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-[#111623] text-gray-500 border-[#2A3347]'}`}>
                                                            {item.type === 'service' ? '✨ Servicio' : '📦 Producto'}
                                                        </span>
                                                        {item.type === 'service' && (
                                                            <select
                                                                className="bg-[#111623] text-white border border-[#2A3347] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded p-1 text-[10px] uppercase font-bold tracking-widest"
                                                                value={item.assigned_user_id}
                                                                onChange={(e) => updateAssignedUser(idx, e.target.value)}
                                                            >
                                                                <option value="">👤 Asignar Atendió...</option>
                                                                {staff?.map(user => (
                                                                    <option key={user.id} value={user.id}>{user.name}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-32 flex items-center justify-center gap-1">
                                                    <button type="button" onClick={() => updateQuantity(idx, -1)} className="w-8 h-8 rounded-lg bg-[#111623] border border-[#2A3347] hover:bg-[#2A3347] hover:text-white text-gray-400 flex items-center justify-center font-bold transition">-</button>
                                                    <span className="font-black w-8 text-center text-white">{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(idx, 1)} className="w-8 h-8 rounded-lg bg-[#111623] border border-[#2A3347] hover:bg-[#2A3347] hover:text-white text-gray-400 flex items-center justify-center font-bold transition">+</button>
                                                </div>
                                                <div className="w-32 text-right font-bold text-gray-400">
                                                    ${parseFloat(item.unit_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="w-32 text-right font-black text-white text-lg">
                                                    ${((item.quantity * item.unit_price) + (item.quantity * item.unit_price * (item.tax_iva / 100)) + (item.quantity * item.unit_price * (item.tax_ieps / 100))).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="w-12 flex justify-end">
                                                    <button type="button" onClick={() => removeItem(idx)} className="text-[#2A3347] group-hover:text-red-400 transition hover:bg-red-500/10 p-2 rounded-lg" title="Eliminar Ítem">✖</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pending Charges Alert */}
                            {clientPendingCharges.length > 0 && (
                                <div className="px-6 pb-4 shrink-0">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-black animate-pulse">!</div>
                                            <div>
                                                <h4 className="text-emerald-400 font-bold text-sm">Cargos Médicos Pendientes</h4>
                                                <p className="text-emerald-500/70 text-xs font-semibold">Este cliente tiene {clientPendingCharges.length} cargos enviados desde consultorio.</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => clientPendingCharges.forEach(importPendingCharge)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition shadow-lg shadow-emerald-500/20"
                                        >
                                            Cargar Todos al POS
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Client Active Info Bar (Bottom) */}
                            <div className="flex items-center justify-between p-5 bg-[#111623] border-t border-[#2A3347] shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#1A2131] border border-[#2A3347] rounded-xl px-4 py-2 flex items-center gap-3">
                                        <span className="text-xl opacity-60">👤</span>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 leading-none mb-1">Dueño / Cliente</p>
                                            <p className="font-black text-sm text-gray-200 uppercase leading-none">{selectedClient ? selectedClient.name : 'Público en General'}</p>
                                        </div>
                                    </div>
                                    {selectedPet && (
                                        <>
                                            <div className="h-6 w-px bg-[#2A3347] rotate-[15deg] mx-1"></div>
                                            <div className="bg-[#1A2131] border border-[#2A3347] rounded-xl px-4 py-2 flex items-center gap-3">
                                                <span className="text-xl opacity-60">🐾</span>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-400 leading-none mb-1">Paciente</p>
                                                    <p className="font-black text-sm text-white uppercase leading-none">{selectedPet.name}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button type="button" onClick={emptyCart} disabled={data.items.length === 0} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-red-400 transition bg-transparent border border-transparent hover:border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg disabled:opacity-0">VACIAR CARRITO</button>
                            </div>
                        </div>

                        {/* RIGHT PANE: Summary and Controls */}
                        <div className="flex-[2] flex flex-col gap-5 shrink-0 w-full xl:max-w-[420px] overflow-y-auto hide-scrollbar">

                            {/* Purple Card Total */}
                            <div className="bg-gradient-to-br from-purple-600 via-[#7928CA] to-[#5C1CA6] rounded-[2rem] p-7 shadow-2xl relative overflow-hidden shrink-0 border border-purple-400/20">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full mix-blend-overlay"></div>
                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <h3 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Resumen del Cobro</h3>
                                </div>
                                <div className="space-y-2 mb-6 text-sm font-bold relative z-10 text-purple-100">
                                    <div className="flex justify-between border-b border-purple-500/30 pb-2"><span>Subtotal</span><span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between border-b border-purple-500/30 pb-2"><span>Impuestos</span><span>${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span></div>
                                </div>
                                <div className="pt-2 flex flex-col items-end relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 text-purple-200">Total Venta</span>
                                    <div className="flex items-start gap-1">
                                        <span className="text-3xl font-black mt-1">$</span>
                                        <span className="text-6xl font-black tracking-tighter drop-shadow-lg">{total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Configuration container */}
                            <div className="bg-[#1A2131] border border-[#2A3347] rounded-[2rem] p-7 flex-1 flex flex-col shadow-xl">
                                <h3 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Método de Pago</h3>
                                <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                                    {[
                                        { id: 'cash', label: 'Efectivo', icon: '💵' },
                                        { id: 'card', label: 'Tarjeta', icon: '💳' },
                                        { id: 'transfer', label: 'Transf.', icon: '🏦' },
                                        { id: 'mixed', label: 'Mixto', icon: '📝' },
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => {
                                                setData('payment_method', method.id);
                                                if (method.id !== 'cash' && method.id !== 'mixed') { setReceivedAmount(''); setData('mixed_cash_amount', ''); }
                                            }}
                                            className={`py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all ${data.payment_method === method.id ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-bold shadow-inner' : 'border-[#2A3347] bg-[#111623] hover:bg-[#252E43] text-gray-500'}`}
                                        >
                                            <span className="text-2xl">{method.icon}</span>
                                            <span className="text-[10px] uppercase tracking-widest">{method.label}</span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            setData('payment_method', 'credit');
                                            setReceivedAmount(''); setData('mixed_cash_amount', '');
                                        }}
                                        disabled={selectedClient?.id === generalPublicClient?.id}
                                        className={`col-span-2 py-3 rounded-2xl flex items-center justify-center gap-2 border transition-all ${data.payment_method === 'credit' ? 'border-amber-500 bg-amber-500/10 text-amber-500 font-bold' : 'border-[#2A3347] bg-[#111623] hover:bg-[#252E43] text-gray-500'} ${selectedClient?.id === generalPublicClient?.id ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    >
                                        <span>⏳</span><span className="text-[10px] uppercase tracking-widest">Fiado / Crédito Pospago</span>
                                    </button>
                                </div>

                                {/* Dynamic Fields */}
                                {data.payment_method === 'cash' && (
                                    <div className="mb-6 shrink-0 space-y-2 relative">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Importe Recibido ($)</label>
                                        <input type="number" step="0.01" value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} className="w-full bg-[#0B0F19] text-white border border-[#2A3347] rounded-xl py-4 px-4 font-black transition text-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-left" placeholder="0.00" />
                                        {receivedAmount && Number(receivedAmount) >= total && (
                                            <div className="mt-3 p-3 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                <span className="text-emerald-400 font-bold text-sm uppercase tracking-widest">Cambio Saliente: </span>
                                                <span className="text-emerald-400 font-black text-lg">${(Number(receivedAmount) - total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {data.payment_method === 'mixed' && (
                                    <div className="mb-6 shrink-0 space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Efectivo Ingresado ($)</label>
                                        <input type="number" step="0.01" value={data.mixed_cash_amount} onChange={e => setData('mixed_cash_amount', e.target.value)} className="w-full bg-[#0B0F19] text-white border border-[#2A3347] rounded-xl py-4 px-4 font-black transition text-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-left" placeholder="0.00" />
                                        {data.mixed_cash_amount && (
                                            <div className="mt-3 p-3 text-center bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                                <span className="text-blue-400 font-bold text-sm uppercase tracking-widest">A Cobrar en Tarjeta: </span>
                                                <span className="text-blue-400 font-black text-lg">${Math.max(0, total - Number(data.mixed_cash_amount)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-auto space-y-2 shrink-0">
                                    <input type="text" value={data.notes} onChange={e => setData('notes', e.target.value)} className="w-full bg-[#111623] border border-[#2A3347] rounded-xl py-4 px-4 font-bold text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500" placeholder="Añadir nota o folio a la venta..." />
                                </div>

                                <button type="button" onClick={submit} disabled={processing || data.items.length === 0 || !data.user_id || (data.payment_method === 'mixed' && !data.mixed_cash_amount)} className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_-5px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0">
                                    {processing ? 'COBRANDO...' : 'COMPLETAR TRANSACCIÓN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {showWithdrawalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-sm print:hidden">
                    <div className="bg-[#1A2131] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-[#2A3347]">
                        <div className="p-6 border-b border-[#2A3347] flex justify-between items-center bg-[#111623]/50">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Retesar Efectivo</h3>
                            <button onClick={() => setShowWithdrawalModal(false)} className="text-2xl text-gray-400 hover:text-red-500 transition">×</button>
                        </div>
                        <form onSubmit={handleWithdrawalSubmit} className="p-6 space-y-6">
                            <p className="text-[11px] font-bold text-[#7E8A9A]">Registra aquí salidas por pagos a proveedores u otros egresos extra.</p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#A78BFA] uppercase tracking-widest ml-1">Monto a Retirar ($)</label>
                                    <input type="number" step="0.01" min="0.01" value={withdrawalData.amount} onChange={e => setWithdrawalData('amount', e.target.value)} className="w-full bg-[#111623] border border-[#2A3347] rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#A78BFA] font-black text-xl text-center text-white" placeholder="0.00" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#7E8A9A] uppercase tracking-widest ml-1">Motivo</label>
                                    <textarea value={withdrawalData.description} onChange={e => setWithdrawalData('description', e.target.value)} className="w-full bg-[#111623] border border-[#2A3347] rounded-2xl py-3 px-4 focus:ring-2 focus:ring-[#A78BFA] font-medium text-white" rows="2" required></textarea>
                                </div>
                            </div>
                            <button type="submit" disabled={processingWithdrawal} className="w-full bg-[#2D235C] hover:bg-[#3A3266] text-[#A78BFA] border border-[#A78BFA]/30 py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 transition">{processingWithdrawal ? 'Registrando...' : 'Confirmar Retiro o Gasto'}</button>
                        </form>
                    </div>
                </div>
            )}

            {showCloseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F19]/80 backdrop-blur-sm print:hidden">
                    <div className="bg-[#1A2131] rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-red-500/30">
                        <div className="p-6 border-b border-[#2A3347] flex justify-between items-center bg-red-500/10">
                            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Cierre de Turno</h3>
                            <button onClick={() => setShowCloseModal(false)} className="text-2xl text-gray-400 hover:text-red-500 transition">×</button>
                        </div>
                        <form onSubmit={handleCloseSubmit} className="p-6 space-y-6">
                            <div className="bg-[#111623] rounded-2xl p-4 border border-[#2A3347] text-center mb-6">
                                <p className="text-[10px] font-black text-[#7E8A9A] uppercase tracking-widest mb-1">El sistema espera que haya en caja:</p>
                                <p className="font-black text-2xl text-white">${currentStats ? parseFloat(currentStats.expected_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-1">¿Cuánto dinero físico contaste en total? ($)</label>
                                <input type="number" step="0.01" min="0" value={closeData.closing_amount} onChange={e => setCloseData('closing_amount', e.target.value)} className="w-full bg-[#111623] border border-[#2A3347] rounded-2xl py-4 px-4 focus:ring-2 focus:ring-red-500 font-black text-2xl text-center text-white" placeholder="0.00" required />
                            </div>
                            <button type="submit" disabled={processingClose} className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">{processingClose ? 'Cerrando Turno...' : 'Realizar Corte Final'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Inventory Modal */}
            {showInventoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md print:hidden">
                    <div className="bg-[#1A2131] rounded-[2.5rem] w-full max-w-3xl border border-[#2A3347] overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-[#2A3347] flex justify-between items-center bg-[#151B2B] shrink-0">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">📦 Consulta de Almacén</h3>
                            <button onClick={() => setShowInventoryModal(false)} className="text-3xl text-gray-500 hover:text-white transition">×</button>
                        </div>
                        <div className="p-6 flex flex-col flex-1 overflow-hidden">
                            <input type="text" autoFocus className="w-full mb-6 shrink-0 bg-[#0B0F19] border border-[#2A3347] rounded-2xl py-4 px-6 focus:ring-2 focus:ring-purple-500 text-white font-bold transition shadow-inner" placeholder="Buscar producto o código..." value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} />
                            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-[#2A3347]">
                                {filteredInventory.length > 0 ? filteredInventory.map(item => (
                                    <div key={item.id} className="flex justify-between items-center bg-[#111623] border border-[#2A3347] p-4 rounded-2xl hover:bg-[#252E43] transition">
                                        <div>
                                            <h4 className="font-black text-white uppercase leading-tight">{item.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{item.category?.name || 'S/C'} • SKU {item.sku || 'N/A'}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Precio</p>
                                                <p className="text-sm font-black text-emerald-400">${parseFloat(item.price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="text-right pl-4 border-l border-[#2A3347]">
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">En Stock</p>
                                                <p className={`text-sm font-black ${(parseFloat(item.current_stock) || 0) > 0 ? 'text-blue-400' : 'text-amber-500'}`}>{parseFloat(item.current_stock) || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="text-center text-gray-500 font-bold uppercase mt-10">Sin resultados en almacén</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Impresion Presupuesto */}
            <div id="print-quote" className="hidden print:block print:bg-white print:text-black p-4 font-sans max-w-4xl mx-auto text-sm">
                <div className="mb-4 border-b pb-2 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter mb-0 italic leading-none">CANBULL</h1>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Sistema Veterinario</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-gray-600 text-sm uppercase tracking-widest leading-none mb-1">PRESUPUESTO</p>
                        <p className="font-bold text-gray-500 text-xs">{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                </div>
                <div className="mb-4 text-xs">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Cotización a nombre de:</p>
                    <h3 className="text-base font-black text-gray-900 uppercase leading-none">{selectedClient ? selectedClient.name : 'Público en General'}</h3>
                    {selectedPet && <p className="font-bold text-gray-500 mt-0.5 uppercase tracking-widest text-[10px]">Paciente: <span className="text-gray-900">{selectedPet.name}</span></p>}
                </div>
                <table className="w-full text-left mb-6 text-xs border-collapse">
                    <thead>
                        <tr className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-300">
                            <th className="py-1">Concepto</th>
                            <th className="py-1 text-center">Cant</th>
                            <th className="py-1 text-right">P.U.</th>
                            <th className="py-1 text-right">Importe</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {data.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-1">
                                    <p className="font-bold text-gray-900 uppercase leading-tight">{item.concept}</p>
                                    {item.assigned_user_id && staff && (
                                        <p className="text-[8px] font-bold text-gray-500 uppercase">Atendió: {staff.find(s => s.id == item.assigned_user_id)?.name}</p>
                                    )}
                                </td>
                                <td className="py-1 text-center font-bold text-gray-700">{item.quantity}</td>
                                <td className="py-1 text-right font-bold text-gray-700">${parseFloat(item.unit_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                                <td className="py-1 text-right font-black text-gray-900">${(parseFloat(item.quantity) * parseFloat(item.unit_price)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="flex justify-end pt-2">
                    <div className="w-48 space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-500 uppercase">Subtotal</span><span className="font-black text-gray-900">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-500 uppercase">Imps.</span><span className="font-black text-gray-900">${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-t-2 border-gray-900 mt-1">
                            <span className="text-[10px] font-black uppercase text-gray-900">Total</span><span className="text-base font-black text-gray-900">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                body { background-color: #0f111a !important; margin: 0; padding: 0; }
                input::placeholder { font-weight: 500; }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #2A3347; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #34405A; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @media print {
                    body { background-color: white !important; }
                    /* Ocultar barra de navegacion si existiese e hide print:hidden elements */
                }
            `}} />
        </div>
    );
}
