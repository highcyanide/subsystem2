import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Search, 
    Star, 
    Plus, 
    Calendar, 
    ArrowLeft, 
    Trash2, 
    Edit2, 
    DollarSign, 
    Calculator,
    Check,
    X,
    Filter,
    Layers,
    Boxes,
    Building2,
    CheckCircle2
} from 'lucide-react';

interface Distributor {
    id: number;
    name: string;
    contact_number: string;
    email?: string;
    address?: string;
    is_favorite: boolean;
    products_count?: number;
}

interface Product {
    id: number;
    distributor_id: number;
    name: string;
    sku?: string;
    category: string;
    purchase_price: number;
    default_discount: number;
    default_dealing_price: number;
}

interface Purchase {
    id: number;
    date: string;
    distributor_id: number;
    product_id: number;
    quantity: number;
    purchase_price: number;
    total_purchase: number;
    dealing_price: number;
    discount: number;
    gross_amount: number;
    vat_percentage: number;
    vat_adjusted_amount: number;
    net_profit: number;
    distributor?: Distributor;
    product?: Product;
}

interface Summary {
    total_purchase: number;
    gross_amount: number;
    vat_adjusted_amount: number;
    net_profit: number;
    total_items: number;
}

interface Props {
    favorites: Distributor[];
    others: Distributor[];
    allDistributors: Distributor[];
    selectedDistributor: Distributor | null;
    products: Product[];
    purchases: Purchase[];
    summary: Summary;
    availableDates: string[];
    filters: {
        search: string;
        date: string;
    };
}

export default function SalesPurchaseIndex({
    favorites,
    others,
    allDistributors,
    selectedDistributor,
    products,
    purchases,
    summary,
    availableDates,
    filters
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

    // Form state for new/edited purchase
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formProductId, setFormProductId] = useState<number | ''>('');
    const [formQuantity, setFormQuantity] = useState<number>(10);
    const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
    const [formDiscount, setFormDiscount] = useState<number>(0);
    const [formVatRate, setFormVatRate] = useState<number>(12);

    // Search distributor handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/sales-purchase', { 
            distributor_id: selectedDistributor?.id, 
            search: searchQuery, 
            date: selectedDate 
        }, { preserveState: true });
    };

    const handleDateFilterChange = (dateVal: string) => {
        setSelectedDate(dateVal);
        router.get('/sales-purchase', { 
            distributor_id: selectedDistributor?.id, 
            search: searchQuery, 
            date: dateVal 
        }, { preserveState: true });
    };

    const selectDistributorCard = (distId: number) => {
        router.get('/sales-purchase', { distributor_id: distId, date: '' });
    };

    const toggleFavorite = (e: React.MouseEvent, distId: number) => {
        e.stopPropagation();
        router.post(`/distributors/${distId}/toggle-favorite`, {}, { preserveScroll: true });
    };

    // When selecting product in modal, auto fill purchase price & discount
    const handleProductChange = (prodId: number) => {
        setFormProductId(prodId);
        const prod = products.find(p => p.id === prodId);
        if (prod) {
            setFormPurchasePrice(Number(prod.purchase_price));
            setFormDiscount(Number(prod.default_discount || 0));
        }
    };

    const openAddModal = () => {
        if (products.length > 0) {
            setFormProductId(products[0].id);
            setFormPurchasePrice(Number(products[0].purchase_price));
            setFormDiscount(Number(products[0].default_discount || 0));
        } else {
            setFormProductId('');
            setFormPurchasePrice(0);
            setFormDiscount(0);
        }
        setFormDate(new Date().toISOString().split('T')[0]);
        setFormQuantity(10);
        setFormVatRate(12);
        setEditingPurchase(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (purchase: Purchase) => {
        setEditingPurchase(purchase);
        setFormDate(purchase.date);
        setFormProductId(purchase.product_id);
        setFormQuantity(purchase.quantity);
        setFormPurchasePrice(Number(purchase.purchase_price));
        setFormDiscount(Number(purchase.discount));
        setFormVatRate(Number(purchase.vat_percentage));
        setIsAddModalOpen(true);
    };

    const handleSubmitPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDistributor || !formProductId) return;

        const payload = {
            date: formDate,
            distributor_id: selectedDistributor.id,
            product_id: formProductId,
            quantity: formQuantity,
            purchase_price: formPurchasePrice,
            discount: formDiscount,
            vat_percentage: formVatRate,
        };

        if (editingPurchase) {
            router.put(`/sales-purchase/${editingPurchase.id}`, payload, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setEditingPurchase(null);
                }
            });
        } else {
            router.post('/sales-purchase', payload, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                }
            });
        }
    };

    const handleDeletePurchase = (id: number) => {
        if (confirm('Are you sure you want to delete this purchase entry? Stock quantity in Subsystem 1 Inventory will be automatically adjusted.')) {
            router.delete(`/sales-purchase/${id}`, { preserveScroll: true });
        }
    };

    // Live Math calculations for form preview
    const calcTotalPurchase = formQuantity * formPurchasePrice;
    const calcDealingPrice = formPurchasePrice + formDiscount;
    const calcGrossAmount = formQuantity * calcDealingPrice;
    const calcVatAdjusted = calcGrossAmount * (1 - (formVatRate / 100));
    const calcNetProfit = calcGrossAmount - calcTotalPurchase;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount || 0);
    };

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY matching spreadsheet image
        }
        return dateStr;
    };

    return (
        <MainLayout title="Sales & Purchase Management">
            <Head title="Subsystem 2: Sales & Purchase Module" />

            {/* Header / Subsystem Navigation Banner */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                        <span>Subsystem 2</span>
                        <span>•</span>
                        <span>Module 3: Sales & Purchase Page</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Distributor Sales & Purchase Portal</span>
                    </h1>
                </div>

                {selectedDistributor && (
                    <button
                        onClick={() => router.get('/sales-purchase')}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-sm font-medium transition shadow-sm w-fit"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Distributor Cards</span>
                    </button>
                )}
            </div>

            {/* IF NO DISTRIBUTOR SELECTED: SHOW DISTRIBUTOR CARDS VIEW */}
            {!selectedDistributor ? (
                <div className="space-y-8 animate-fade-in">
                    {/* Search & Intro Header */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Select a Distributor to Manage</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Browse favorite and categorized distributors to view transactions, add purchases, and sync live inventory.
                                </p>
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="w-full md:w-80 relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search distributor by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                />
                            </form>
                        </div>
                    </div>

                    {/* FAVORITES DISTRIBUTORS SECTION (At least 4 Cards) */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                            <h2 className="text-base font-bold text-white uppercase tracking-wider">Favorite Distributors</h2>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {favorites.length} Favorites
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {favorites.map((dist) => (
                                <div
                                    key={dist.id}
                                    onClick={() => selectDistributorCard(dist.id)}
                                    className="group relative bg-gradient-to-b from-slate-900 to-slate-950 hover:from-emerald-950/40 hover:to-slate-900 border border-amber-500/30 hover:border-emerald-500/60 p-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-950/50 hover:-translate-y-1 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="h-10 w-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-inner">
                                                {dist.name.charAt(0)}
                                            </div>
                                            <button
                                                onClick={(e) => toggleFavorite(e, dist.id)}
                                                title="Favorite toggle"
                                                className="p-1.5 text-amber-400 hover:scale-110 transition"
                                            >
                                                <Star className="h-5 w-5 fill-amber-400" />
                                            </button>
                                        </div>

                                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                                            {dist.name}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                            <span>📞</span>
                                            <span>{dist.contact_number}</span>
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-1 rounded-md border border-slate-700/50">
                                            {dist.products_count || 0} Products
                                        </span>
                                        <span className="text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                            Manage Purchases &rarr;
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* THE REST OF THE DISTRIBUTORS SECTION (Alphabetically Arranged) */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Building2 className="h-5 w-5 text-slate-400" />
                            <h2 className="text-base font-bold text-white uppercase tracking-wider">All Distributors</h2>
                            <span className="text-xs font-medium text-slate-400">(Alphabetical)</span>
                        </div>

                        {others.length === 0 ? (
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">
                                All available distributors are in your Favorites list above!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {others.map((dist) => (
                                    <div
                                        key={dist.id}
                                        onClick={() => selectDistributorCard(dist.id)}
                                        className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 p-5 rounded-2xl cursor-pointer transition-all duration-300 shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm group-hover:bg-emerald-900 group-hover:text-emerald-200 transition-colors">
                                                    {dist.name.charAt(0)}
                                                </div>
                                                <button
                                                    onClick={(e) => toggleFavorite(e, dist.id)}
                                                    title="Mark as favorite"
                                                    className="p-1.5 text-slate-600 hover:text-amber-400 hover:scale-110 transition"
                                                >
                                                    <Star className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                                                {dist.name}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {dist.contact_number}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                                            <span className="text-[11px] text-slate-500">
                                                {dist.products_count || 0} Products
                                            </span>
                                            <span className="text-xs font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">
                                                Select &rarr;
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* CHOSEN DISTRIBUTOR SALES & PURCHASE VIEW (Excel Table Header style as in Screenshot) */
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Top Summary Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Purchase Cost</span>
                            <div className="text-lg sm:text-xl font-bold text-white mt-1">₱{formatCurrency(summary.total_purchase)}</div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Amount</span>
                            <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">₱{formatCurrency(summary.gross_amount)}</div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">12% VAT Adjusted</span>
                            <div className="text-lg sm:text-xl font-bold text-teal-300 mt-1">₱{formatCurrency(summary.vat_adjusted_amount)}</div>
                        </div>

                        <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 shadow-md">
                            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Net Profit</span>
                            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">₱{formatCurrency(summary.net_profit)}</div>
                        </div>
                    </div>

                    {/* Filter Bar & Controls */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
                                <Calendar className="h-4 w-4 text-emerald-400" />
                                <span>Filter Date:</span>
                            </div>
                            
                            <select
                                value={selectedDate}
                                onChange={(e) => handleDateFilterChange(e.target.value)}
                                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                            >
                                <option value="">All Purchase Dates</option>
                                {availableDates.map(d => (
                                    <option key={d} value={d}>{formatDateDisplay(d)}</option>
                                ))}
                            </select>

                            {selectedDate && (
                                <button
                                    onClick={() => handleDateFilterChange('')}
                                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-emerald-950/50 transition border border-emerald-400/30"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Purchase Transaction</span>
                            </button>
                        </div>
                    </div>

                    {/* SPREADSHEET CONTAINER WITH EXACT GREEN BANNER HEADER FROM SCREENSHOT */}
                    <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl overflow-hidden shadow-2xl">
                        
                        {/* GREEN BRANDED BANNER HEADER (WINZELLE SALES & PURCHASE) MATCHING SCREENSHOT */}
                        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 text-white font-black text-center py-3.5 tracking-widest uppercase text-sm sm:text-base border-b border-emerald-500/40 shadow-inner flex items-center justify-center space-x-2">
                            <span>WINZELLE SALES & PURCHASE</span>
                            <span className="text-xs bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-400/40 font-normal">
                                Provider: {selectedDistributor.name}
                            </span>
                        </div>

                        {/* SPREADSHEET DATA TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-sans text-xs">
                                <thead>
                                    {/* Table Header Styled like the Spreadsheet image */}
                                    <tr className="bg-emerald-800 text-emerald-50 uppercase tracking-wider font-bold border-b border-emerald-600 text-[11px]">
                                        <th className="py-3 px-3 border-r border-emerald-700/60 whitespace-nowrap">DATE</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 whitespace-nowrap">PROVIDER</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap">QUANTITY</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 whitespace-nowrap">PRODUCT NAME</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap">PURCHASE PRICE</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap">TOTAL PURCHASE</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap">DEALING PRICE</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap">DISCOUNT</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap">GROSS AMOUNT</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap bg-emerald-900/80">12% VAT</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap bg-emerald-950 text-emerald-300">NET PROFIT</th>
                                        <th className="py-3 px-2 text-center whitespace-nowrap">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 bg-slate-950 font-mono text-[11px]">
                                    {purchases.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} className="py-12 text-center text-slate-500 font-sans">
                                                No purchase records found for this distributor. Click <strong className="text-emerald-400">"Add Purchase Transaction"</strong> above to record a purchase.
                                            </td>
                                        </tr>
                                    ) : (
                                        purchases.map((item, idx) => (
                                            <tr 
                                                key={item.id} 
                                                className={`hover:bg-slate-900/90 transition-colors ${
                                                    idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'
                                                }`}
                                            >
                                                <td className="py-2.5 px-3 font-sans text-slate-300 border-r border-slate-800 whitespace-nowrap">
                                                    {formatDateDisplay(item.date)}
                                                </td>
                                                <td className="py-2.5 px-3 font-sans font-bold text-white border-r border-slate-800 whitespace-nowrap">
                                                    {selectedDistributor.name}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-amber-300 border-r border-slate-800">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-2.5 px-3 font-sans font-medium text-slate-100 border-r border-slate-800 whitespace-nowrap">
                                                    {item.product?.name || 'Item'}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-slate-300 border-r border-slate-800">
                                                    {formatCurrency(Number(item.purchase_price))}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-slate-200 border-r border-slate-800">
                                                    {formatCurrency(Number(item.total_purchase))}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-slate-300 border-r border-slate-800">
                                                    {formatCurrency(Number(item.dealing_price))}
                                                </td>
                                                <td className="py-2.5 px-3 text-right text-slate-400 border-r border-slate-800">
                                                    {formatCurrency(Number(item.discount))}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-emerald-400 border-r border-slate-800">
                                                    {formatCurrency(Number(item.gross_amount))}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-teal-300 border-r border-slate-800 bg-slate-900/60">
                                                    {formatCurrency(Number(item.vat_adjusted_amount))}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-bold text-emerald-400 border-r border-slate-800 bg-emerald-950/40">
                                                    {formatCurrency(Number(item.net_profit))}
                                                </td>
                                                <td className="py-2.5 px-2 text-center font-sans space-x-1">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                                                        title="Edit Row"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePurchase(item.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                                        title="Delete Row"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD / EDIT PURCHASE MODAL */}
            {isAddModalOpen && selectedDistributor && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Plus className="h-5 w-5 text-emerald-400" />
                                <span>{editingPurchase ? 'Edit Purchase Entry' : 'Record New Purchase'}</span>
                            </h3>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPurchase} className="space-y-4">
                            
                            {/* Date & Provider */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Purchase</label>
                                    <input
                                        type="date"
                                        required
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Provider (Distributor)</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={selectedDistributor.name}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-bold"
                                    />
                                </div>
                            </div>

                            {/* Product Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Product of Distributor</label>
                                {products.length === 0 ? (
                                    <div className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900">
                                        No products found for {selectedDistributor.name}. Please add items first under Subsystem 2: Distributor Items!
                                    </div>
                                ) : (
                                    <select
                                        required
                                        value={formProductId}
                                        onChange={(e) => handleProductChange(Number(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Base Cost: ₱{p.purchase_price})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Quantity & Purchase Price */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formQuantity}
                                        onChange={(e) => setFormQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={formPurchasePrice}
                                        onChange={(e) => setFormPurchasePrice(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Discount & VAT % */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Discount (₱/unit)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formDiscount}
                                        onChange={(e) => setFormDiscount(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">VAT Percentage (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={formVatRate}
                                        onChange={(e) => setFormVatRate(parseFloat(e.target.value) || 12)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* LIVE SPREADSHEET COMPUTATION PREVIEW BOX */}
                            <div className="bg-slate-950 border border-emerald-900/60 p-3 rounded-xl space-y-1.5 text-[11px] font-mono">
                                <div className="text-[10px] font-sans font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Calculator className="h-3.5 w-3.5" />
                                    <span>Real-time Computed Spreadsheet Values</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Total Purchase (Qty × Cost):</span>
                                    <span className="font-bold">₱{formatCurrency(calcTotalPurchase)}</span>
                                </div>
                                <div className="flex justify-between text-slate-300">
                                    <span>Dealing Price (Cost + Discount):</span>
                                    <span className="font-bold">₱{formatCurrency(calcDealingPrice)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-300">
                                    <span>Gross Amount (Qty × Dealing):</span>
                                    <span className="font-bold">₱{formatCurrency(calcGrossAmount)}</span>
                                </div>
                                <div className="flex justify-between text-teal-300">
                                    <span>12% VAT Adjusted Amount:</span>
                                    <span className="font-bold">₱{formatCurrency(calcVatAdjusted)}</span>
                                </div>
                                <div className="flex justify-between text-emerald-400 font-bold border-t border-slate-800 pt-1">
                                    <span>Net Profit (Gross − Total Purchase):</span>
                                    <span>₱{formatCurrency(calcNetProfit)}</span>
                                </div>
                            </div>

                            {/* Subsystem Sync Notice */}
                            <div className="text-[11px] text-emerald-300/80 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/50 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>
                                    Saving will automatically record stock items into <strong>Subsystem 1: Module 1 (Inventory Management System)</strong>.
                                </span>
                            </div>

                            {/* Submit buttons */}
                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={products.length === 0}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md"
                                >
                                    {editingPurchase ? 'Save Changes' : 'Save & Sync Inventory'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
