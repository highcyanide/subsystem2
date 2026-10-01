import React, { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { downloadCSV } from '@/utils/exportCsv';
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
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    CheckSquare,
    Square,
    Download
} from 'lucide-react';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDaysInMonth = new Date(year, month, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
            day: prevDaysInMonth - i,
            isCurrentMonth: false,
            dateStr: '',
        });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({
            day: d,
            isCurrentMonth: true,
            dateStr: dateStr,
        });
    }

    const totalSlots = Math.ceil(days.length / 7) * 7;
    const nextDaysCount = totalSlots - days.length;
    for (let n = 1; n <= nextDaysCount; n++) {
        days.push({
            day: n,
            isCurrentMonth: false,
            dateStr: '',
        });
    }

    return days;
};

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
    distributor?: Distributor;
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
    selectedDistributorIds?: number[];
    selectedDistributors?: Distributor[];
    isAllDistributors?: boolean;
    products: Product[];
    allProducts?: Product[];
    purchases: Purchase[];
    summary: Summary;
    availableDates: string[];
    filters: {
        search: string;
        date?: string;
        start_date?: string;
        end_date?: string;
        month?: string;
        distributor_id?: string;
        distributor_ids?: number[];
    };
}

export default function SalesPurchaseIndex({
    favorites,
    others,
    allDistributors,
    selectedDistributor,
    selectedDistributorIds = [],
    selectedDistributors = [],
    isAllDistributors = false,
    products,
    allProducts = [],
    purchases,
    summary,
    availableDates,
    filters
}: Props) {
    const { auth, settings } = usePage().props as any;
    const userRole = auth?.user?.role || 'guest';
    const canManage = userRole === 'admin' || userRole === 'owner';
    const canDelete = userRole === 'admin';
    const defaultVatPercentage = Number(settings?.default_vat_percentage || 12);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [purchaseToDelete, setPurchaseToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedDate, setSelectedDate] = useState(filters.date || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

    // Distributor Multi-Select Filter Modal State
    const [isDistributorModalOpen, setIsDistributorModalOpen] = useState(false);
    const [tempDistributorIds, setTempDistributorIds] = useState<number[]>([]);
    const [distributorModalSearch, setDistributorModalSearch] = useState('');

    // Date Filter Modal Calendar state (Supports Single Date, Per Month, Date Range)
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [filterTab, setFilterTab] = useState<'single' | 'month' | 'range'>('single');

    // Temporary modal selection states for dates
    const [tempSingleDate, setTempSingleDate] = useState(filters.date || '');
    const [tempMonth, setTempMonth] = useState(filters.month || '');
    const [tempStartDate, setTempStartDate] = useState(filters.start_date || '');
    const [tempEndDate, setTempEndDate] = useState(filters.end_date || '');

    // Custom Day Range inputs (ex: Day 4 to Day 27)
    const [rangeStartDay, setRangeStartDay] = useState<string>('4');
    const [rangeEndDay, setRangeEndDay] = useState<string>('27');

    const [calendarYear, setCalendarYear] = useState(() => {
        if (filters.start_date) return parseInt(filters.start_date.split('-')[0]);
        if (filters.month) return parseInt(filters.month.split('-')[0]);
        if (filters.date) return parseInt(filters.date.split('-')[0]);
        return new Date().getFullYear();
    });
    const [calendarMonth, setCalendarMonth] = useState(() => {
        if (filters.start_date) return parseInt(filters.start_date.split('-')[1]) - 1;
        if (filters.month) return parseInt(filters.month.split('-')[1]) - 1;
        if (filters.date) return parseInt(filters.date.split('-')[1]) - 1;
        return new Date().getMonth();
    });

    const isFilterActive = !!(filters.date || filters.start_date || filters.end_date || filters.month);
    const hasSelectedDistributors = selectedDistributorIds.length > 0;

    // Open Custom Distributor Selection Modal
    const openDistributorModal = () => {
        setTempDistributorIds(selectedDistributorIds.length > 0 ? [...selectedDistributorIds] : allDistributors.map(d => d.id));
        setDistributorModalSearch('');
        setIsDistributorModalOpen(true);
    };

    const toggleDistributorInTemp = (id: number) => {
        if (tempDistributorIds.includes(id)) {
            setTempDistributorIds(tempDistributorIds.filter(dId => dId !== id));
        } else {
            setTempDistributorIds([...tempDistributorIds, id]);
        }
    };

    const selectAllDistributorsInTemp = () => {
        setTempDistributorIds(allDistributors.map(d => d.id));
    };

    const clearDistributorSelectionInTemp = () => {
        setTempDistributorIds([]);
    };

    const applyDistributorSelection = () => {
        setIsDistributorModalOpen(false);
        if (tempDistributorIds.length === 0) {
            router.get('/sales-purchase');
        } else if (tempDistributorIds.length === allDistributors.length) {
            router.get('/sales-purchase', {
                ...filters,
                distributor_id: 'all',
            }, { preserveState: true });
        } else if (tempDistributorIds.length === 1) {
            router.get('/sales-purchase', {
                ...filters,
                distributor_id: tempDistributorIds[0].toString(),
            }, { preserveState: true });
        } else {
            router.get('/sales-purchase', {
                ...filters,
                distributor_id: tempDistributorIds.join(','),
            }, { preserveState: true });
        }
    };

    const removeDistributorChip = (idToRemove: number) => {
        const nextIds = selectedDistributorIds.filter(id => id !== idToRemove);
        if (nextIds.length === 0) {
            router.get('/sales-purchase');
        } else if (nextIds.length === allDistributors.length) {
            router.get('/sales-purchase', { ...filters, distributor_id: 'all' });
        } else {
            router.get('/sales-purchase', { ...filters, distributor_id: nextIds.join(',') });
        }
    };

    const getProviderBannerLabel = () => {
        if (isAllDistributors) {
            return `ALL DISTRIBUTORS (${allDistributors.length} Total)`;
        }
        if (selectedDistributors.length > 1) {
            return `${selectedDistributors.map(d => d.name).join(', ')} (${selectedDistributors.length} Selected)`;
        }
        if (selectedDistributor) {
            return selectedDistributor.name;
        }
        if (selectedDistributors.length === 1) {
            return selectedDistributors[0].name;
        }
        return 'ALL DISTRIBUTORS';
    };

    const getActiveFilterLabel = () => {
        if (filters.start_date && filters.end_date) {
            return `${formatDateDisplay(filters.start_date)} – ${formatDateDisplay(filters.end_date)}`;
        }
        if (filters.month) {
            const parts = filters.month.split('-');
            if (parts.length === 2) {
                return `${MONTH_NAMES[parseInt(parts[1]) - 1]} ${parts[0]}`;
            }
        }
        if (filters.date) {
            if (filters.date.includes('..')) {
                const [s, e] = filters.date.split('..');
                return `${formatDateDisplay(s)} – ${formatDateDisplay(e)}`;
            }
            if (filters.date.length === 7) {
                const parts = filters.date.split('-');
                if (parts.length === 2) {
                    return `${MONTH_NAMES[parseInt(parts[1]) - 1]} ${parts[0]}`;
                }
            }
            return formatDateDisplay(filters.date);
        }
        return 'All Purchase Dates';
    };

    const prevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(y => y - 1);
        } else {
            setCalendarMonth(m => m - 1);
        }
    };

    const nextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(y => y + 1);
        } else {
            setCalendarMonth(m => m + 1);
        }
    };

    const openDateFilterModal = () => {
        if (filters.start_date && filters.end_date) {
            setFilterTab('range');
            setTempStartDate(filters.start_date);
            setTempEndDate(filters.end_date);
        } else if (filters.month) {
            setFilterTab('month');
            setTempMonth(filters.month);
            const parts = filters.month.split('-');
            if (parts.length === 2) {
                setCalendarYear(parseInt(parts[0]));
                setCalendarMonth(parseInt(parts[1]) - 1);
            }
        } else if (filters.date && filters.date.includes('..')) {
            setFilterTab('range');
            const [s, e] = filters.date.split('..');
            setTempStartDate(s);
            setTempEndDate(e);
        } else if (filters.date && filters.date.length === 7) {
            setFilterTab('month');
            setTempMonth(filters.date);
        } else {
            setFilterTab('single');
            setTempSingleDate(filters.date || '');
        }
        setIsDateModalOpen(true);
    };

    const handleClearAllDateFilters = () => {
        setSelectedDate('');
        router.get('/sales-purchase', {
            distributor_id: filters.distributor_id,
            search: searchQuery,
            date: '',
            start_date: '',
            end_date: '',
            month: ''
        }, { preserveState: true });
    };

    const handleApplyModalFilter = () => {
        setIsDateModalOpen(false);

        if (filterTab === 'single') {
            router.get('/sales-purchase', {
                distributor_id: filters.distributor_id,
                search: searchQuery,
                date: tempSingleDate,
                start_date: '',
                end_date: '',
                month: ''
            }, { preserveState: true });
        } else if (filterTab === 'month') {
            const mVal = tempMonth || `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
            router.get('/sales-purchase', {
                distributor_id: filters.distributor_id,
                search: searchQuery,
                month: mVal,
                date: '',
                start_date: '',
                end_date: ''
            }, { preserveState: true });
        } else if (filterTab === 'range') {
            if (tempStartDate && tempEndDate) {
                router.get('/sales-purchase', {
                    distributor_id: filters.distributor_id,
                    search: searchQuery,
                    start_date: tempStartDate,
                    end_date: tempEndDate,
                    date: '',
                    month: ''
                }, { preserveState: true });
            } else if (tempStartDate) {
                router.get('/sales-purchase', {
                    distributor_id: filters.distributor_id,
                    search: searchQuery,
                    date: tempStartDate,
                    start_date: '',
                    end_date: '',
                    month: ''
                }, { preserveState: true });
            } else {
                handleClearAllDateFilters();
            }
        }
    };

    const handleDayClickInCalendar = (dateStr: string) => {
        if (filterTab === 'single') {
            setTempSingleDate(dateStr);
        } else if (filterTab === 'range') {
            if (!tempStartDate || (tempStartDate && tempEndDate)) {
                setTempStartDate(dateStr);
                setTempEndDate('');
            } else {
                if (dateStr < tempStartDate) {
                    setTempEndDate(tempStartDate);
                    setTempStartDate(dateStr);
                } else {
                    setTempEndDate(dateStr);
                }
            }
        }
    };

    const applyQuickDayNumberRange = (sDay: number, eDay: number) => {
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const validStart = Math.max(1, Math.min(sDay, daysInMonth));
        const validEnd = Math.max(validStart, Math.min(eDay, daysInMonth));

        const sStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(validStart).padStart(2, '0')}`;
        const eStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(validEnd).padStart(2, '0')}`;

        setFilterTab('range');
        setTempStartDate(sStr);
        setTempEndDate(eStr);
    };

    // Form state for new/edited purchase
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
    const [formDistributorId, setFormDistributorId] = useState<number | ''>('');
    const [formProductId, setFormProductId] = useState<number | ''>('');
    const [formQuantity, setFormQuantity] = useState<number>(10);
    const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
    const [formDiscount, setFormDiscount] = useState<number>(0);
    const [formVatRate, setFormVatRate] = useState<number>(12);

    // Filter products available for the selected distributor in modal form
    const poolProducts = allProducts.length > 0 ? allProducts : products;
    const availableProductsForForm = formDistributorId !== '' 
        ? poolProducts.filter(p => p.distributor_id === Number(formDistributorId))
        : [];

    // Live search debounce ref
    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            router.get('/sales-purchase', {
                distributor_id: filters.distributor_id,
                search: value,
                date: selectedDate
            }, { preserveState: true });
        }, 300);
    };

    // Search distributor handler
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        router.get('/sales-purchase', {
            distributor_id: filters.distributor_id,
            search: searchQuery,
            date: selectedDate
        }, { preserveState: true });
    };

    const selectDistributorCard = (distId: number) => {
        router.get('/sales-purchase', { distributor_id: distId, date: '' });
    };

    const toggleFavorite = (e: React.MouseEvent, distId: number) => {
        e.stopPropagation();
        router.post(`/distributors/${distId}/toggle-favorite`, {}, { preserveScroll: true });
    };

    const handleFormDistributorChange = (distId: number | '') => {
        setFormDistributorId(distId);
        if (distId !== '') {
            const distProds = poolProducts.filter(p => p.distributor_id === Number(distId));
            if (distProds.length > 0) {
                setFormProductId(distProds[0].id);
                setFormPurchasePrice(Number(distProds[0].purchase_price));
                setFormDiscount(Number(distProds[0].default_discount || 0));
            } else {
                setFormProductId('');
                setFormPurchasePrice(0);
                setFormDiscount(0);
            }
        } else {
            setFormProductId('');
            setFormPurchasePrice(0);
            setFormDiscount(0);
        }
    };

    const handleProductChange = (prodId: number | '') => {
        setFormProductId(prodId);
        if (prodId !== '') {
            const prod = poolProducts.find(p => p.id === Number(prodId));
            if (prod) {
                setFormPurchasePrice(Number(prod.purchase_price));
                setFormDiscount(Number(prod.default_discount || 0));
            }
        } else {
            setFormPurchasePrice(0);
            setFormDiscount(0);
        }
    };

    const openAddModal = () => {
        let initDistId: number | '' = '';
        if (selectedDistributor && !isAllDistributors) {
            initDistId = selectedDistributor.id;
        } else if (selectedDistributors.length === 1 && !isAllDistributors) {
            initDistId = selectedDistributors[0].id;
        }

        setFormDistributorId(initDistId);

        if (initDistId !== '') {
            const distProds = poolProducts.filter(p => p.distributor_id === Number(initDistId));
            if (distProds.length > 0) {
                setFormProductId(distProds[0].id);
                setFormPurchasePrice(Number(distProds[0].purchase_price));
                setFormDiscount(Number(distProds[0].default_discount || 0));
            } else {
                setFormProductId('');
                setFormPurchasePrice(0);
                setFormDiscount(0);
            }
        } else {
            setFormProductId('');
            setFormPurchasePrice(0);
            setFormDiscount(0);
        }

        setFormDate(new Date().toISOString().split('T')[0]);
        setFormQuantity(10);
        setFormVatRate(defaultVatPercentage);
        setEditingPurchase(null);
        setIsAddModalOpen(true);
    };

    const openEditModal = (purchase: Purchase) => {
        setEditingPurchase(purchase);
        setFormDate(purchase.date);
        setFormDistributorId(purchase.distributor_id);
        setFormProductId(purchase.product_id);
        setFormQuantity(purchase.quantity);
        setFormPurchasePrice(Number(purchase.purchase_price));
        setFormDiscount(Number(purchase.discount));
        setFormVatRate(Number(purchase.vat_percentage));
        setIsAddModalOpen(true);
    };

    const handleSubmitPurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formDistributorId || !formProductId) return;

        const payload = {
            date: formDate,
            distributor_id: formDistributorId,
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

    const confirmDeletePurchase = (id: number) => {
        setPurchaseToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (!purchaseToDelete) return;
        setIsDeleting(true);
        router.delete(`/sales-purchase/${purchaseToDelete}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setPurchaseToDelete(null);
            }
        });
    };

    const handleExportCSV = () => {
        const headers = [
            'Date',
            'Provider / Distributor',
            'Product Name',
            'Quantity',
            'Purchase Price (PHP)',
            'Total Purchase (PHP)',
            'Dealing Price (PHP)',
            'Discount (PHP)',
            'Gross Amount (PHP)',
            'VAT Percentage',
            'VAT Adjusted Amount (PHP)',
            'Net Profit (PHP)'
        ];

        const rows = purchases.map(item => [
            item.date,
            item.distributor?.name || selectedDistributor?.name || 'N/A',
            item.product?.name || 'Item',
            item.quantity,
            item.purchase_price,
            item.total_purchase,
            item.dealing_price,
            item.discount,
            item.gross_amount,
            `${item.vat_percentage}%`,
            item.vat_adjusted_amount,
            item.net_profit
        ]);

        const providerLabel = selectedDistributor ? selectedDistributor.name.replace(/\s+/g, '_') : 'All_Distributors';
        downloadCSV(`winzelle_sales_purchases_${providerLabel}_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
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
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
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

                <div className="flex flex-wrap items-center gap-2">
                    {/* CUSTOMIZE DISTRIBUTORS SELECTOR BUTTON */}
                    <button
                        onClick={openDistributorModal}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-500/50 text-xs font-bold transition shadow-sm"
                    >
                        <Building2 className="h-4 w-4 text-emerald-400" />
                        <span>
                            {isAllDistributors
                                ? `ALL Distributors (${allDistributors.length})`
                                : selectedDistributors.length > 1
                                    ? `${selectedDistributors.length} Distributors Selected`
                                    : selectedDistributor
                                        ? selectedDistributor.name
                                        : 'Select Distributors'}
                        </span>
                        <ChevronDown className="h-3.5 w-3.5 text-emerald-400" />
                    </button>

                    {hasSelectedDistributors && (
                        <button
                            onClick={() => router.get('/sales-purchase')}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-medium transition shadow-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Cards</span>
                        </button>
                    )}
                </div>
            </div>

            {/* IF NO DISTRIBUTOR SELECTED: SHOW DISTRIBUTOR CARDS VIEW */}
            {!hasSelectedDistributors ? (
                <div className="space-y-8 animate-fade-in">

                    {/* HERO CARD: ALL DISTRIBUTORS OPTION */}
                    <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 p-6 rounded-2xl shadow-xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
                        <div className="flex items-center space-x-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform shrink-0">
                                <Layers className="h-7 w-7" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                                        ALL DISTRIBUTORS
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                        {allDistributors.length} Distributors Total
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1">
                                    Display sales & purchases for <strong>ALL Distributors</strong> combined, or customize who to display (e.g. choose Pepsi and Coca-Cola Bottlers).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                            <button
                                onClick={() => router.get('/sales-purchase', { distributor_id: 'all' })}
                                className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 border border-emerald-400/40"
                            >
                                <span>View All Transactions</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={openDistributorModal}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center space-x-1.5"
                            >
                                <Filter className="h-4 w-4 text-emerald-400" />
                                <span>Customize (Select)</span>
                            </button>
                        </div>
                    </div>

                    {/* Search & Intro Header */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">Select a Distributor Card</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Click any card below to view its specific transactions, or use the <strong>"ALL Distributors"</strong> button above to customize your view.
                                </p>
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="w-full md:w-80 relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search distributor or product..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => handleSearchChange('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* FAVORITES DISTRIBUTORS SECTION */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                            <h2 className="text-base font-bold text-white uppercase tracking-wider">Favorite Distributors</h2>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {favorites.length} Favorites
                            </span>
                        </div>

                        {favorites.length === 0 ? (
                            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
                                <Star className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                                <p className="font-semibold text-slate-400">No favorite distributors pinned yet</p>
                                <p className="text-[11px] text-slate-500 mt-1">Click the star icon on any distributor below to pin it here for quick access.</p>
                            </div>
                        ) : (
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
                        )}
                    </div>

                    {/* THE REST OF THE DISTRIBUTORS SECTION */}
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
                /* SELECTED DISTRIBUTORS SALES & PURCHASE VIEW */
                <div className="space-y-6 animate-fade-in">

                    {/* Active Selected Distributor Chips Bar */}
                    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Filter className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Distributor Filter:</span>
                            </span>

                            {isAllDistributors ? (
                                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600/60 rounded-full text-xs font-bold">
                                    <Layers className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>ALL Distributors ({allDistributors.length})</span>
                                </span>
                            ) : (
                                selectedDistributors.map(d => (
                                    <span
                                        key={d.id}
                                        className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/80 text-emerald-200 border border-emerald-700/60 rounded-full text-xs font-semibold"
                                    >
                                        <span>{d.name}</span>
                                        {selectedDistributors.length > 1 && (
                                            <button
                                                onClick={() => removeDistributorChip(d.id)}
                                                className="hover:text-rose-400 transition"
                                                title={`Remove ${d.name}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </span>
                                ))
                            )}

                            <button
                                onClick={openDistributorModal}
                                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline px-2 py-1 flex items-center space-x-1"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Customize / Select More</span>
                            </button>
                        </div>

                        {!isAllDistributors && (
                            <button
                                onClick={() => router.get('/sales-purchase', { ...filters, distributor_id: 'all' })}
                                className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
                            >
                                Switch to ALL Distributors
                            </button>
                        )}
                    </div>

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
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{defaultVatPercentage}% VAT Adjusted</span>
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

                            <button
                                type="button"
                                onClick={openDateFilterModal}
                                className="inline-flex items-center space-x-2.5 bg-slate-950 border border-slate-700 hover:border-emerald-500 rounded-lg px-3.5 py-2 text-xs text-white transition focus:outline-none shadow-sm group"
                            >
                                <Calendar className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span className="font-semibold text-slate-200">
                                    {getActiveFilterLabel()}
                                </span>
                                {availableDates.length > 0 && (
                                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/80">
                                        {availableDates.length} {availableDates.length === 1 ? 'date' : 'dates'}
                                    </span>
                                )}
                                <Filter className="h-3 w-3 text-slate-400 group-hover:text-emerald-400 transition-colors ml-1" />
                            </button>

                            {isFilterActive && (
                                <button
                                    type="button"
                                    onClick={handleClearAllDateFilters}
                                    className="text-xs text-slate-400 hover:text-rose-400 flex items-center space-x-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-rose-900 transition"
                                    title="Clear date filter"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    <span>Clear Filter</span>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={handleExportCSV}
                                disabled={purchases.length === 0}
                                className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs rounded-lg transition border border-slate-700 shadow-sm"
                                title="Export currently filtered spreadsheet to CSV"
                            >
                                <Download className="h-4 w-4 text-emerald-400" />
                                <span>Export CSV</span>
                            </button>

                            {canManage && (
                                <button
                                    onClick={openAddModal}
                                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-emerald-950/50 transition border border-emerald-400/30"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Add Purchase Transaction</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* SPREADSHEET CONTAINER WITH GREEN BANNER HEADER */}
                    <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl overflow-hidden shadow-2xl">

                        {/* GREEN BRANDED BANNER HEADER (WINZELLE SALES & PURCHASE) */}
                        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-800 text-white font-black text-center py-3.5 tracking-widest uppercase text-sm sm:text-base border-b border-emerald-500/40 shadow-inner flex flex-wrap items-center justify-center gap-2">
                            <span>WINZELLE SALES & PURCHASE</span>
                            <span className="text-xs bg-emerald-900/80 px-3 py-0.5 rounded-full border border-emerald-400/40 font-normal">
                                Provider: {getProviderBannerLabel()}
                            </span>
                        </div>

                        {/* SPREADSHEET DATA TABLE */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse font-sans text-xs">
                                <thead>
                                    {/* Table Header */}
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
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap bg-emerald-900/80">{defaultVatPercentage}% VAT</th>
                                        <th className="py-3 px-3 border-r border-emerald-700/60 text-right whitespace-nowrap bg-emerald-950 text-emerald-300">NET PROFIT</th>
                                        <th className="py-3 px-2 text-center whitespace-nowrap">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 bg-slate-950 font-mono text-[11px]">
                                    {purchases.length === 0 ? (
                                        <tr>
                                            <td colSpan={12} className="py-12 text-center text-slate-500 font-sans">
                                                No purchase records found for the selected distributor filter. Click <strong className="text-emerald-400">"Add Purchase Transaction"</strong> above to record a purchase.
                                            </td>
                                        </tr>
                                    ) : (
                                        purchases.map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                className={`hover:bg-slate-900/90 transition-colors ${idx % 2 === 0 ? 'bg-slate-950' : 'bg-slate-900/40'
                                                    }`}
                                            >
                                                <td className="py-2.5 px-3 font-sans text-slate-300 border-r border-slate-800 whitespace-nowrap">
                                                    {formatDateDisplay(item.date)}
                                                </td>
                                                <td className="py-2.5 px-3 font-sans font-bold text-white border-r border-slate-800 whitespace-nowrap">
                                                    {item.distributor?.name || selectedDistributor?.name || 'N/A'}
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
                                                    {canManage && (
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                                                            title="Edit Row"
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => confirmDeletePurchase(item.id)}
                                                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                                            title="Delete Row"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                    {!canManage && !canDelete && (
                                                        <span className="text-[10px] text-slate-500 italic">View only</span>
                                                    )}
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

            {/* CUSTOMIZE DISTRIBUTORS SELECTION MODAL */}
            {isDistributorModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center space-x-2">
                                <Building2 className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-base font-bold text-white">Customize Distributors Display</h3>
                            </div>
                            <button
                                onClick={() => setIsDistributorModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mb-4">
                            Select specific distributors to display their sales & purchase transactions together (for example: choose Pepsi and Coca-Cola Bottlers, or select All).
                        </p>

                        {/* Quick Actions */}
                        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 mb-3 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={selectAllDistributorsInTemp}
                                className="px-3 py-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700 rounded-lg transition"
                            >
                                ✓ Select All ({allDistributors.length})
                            </button>
                            <button
                                type="button"
                                onClick={clearDistributorSelectionInTemp}
                                className="px-3 py-1.5 bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Search filter inside modal */}
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search distributor name..."
                                value={distributorModalSearch}
                                onChange={(e) => setDistributorModalSearch(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Distributor Checkbox List */}
                        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 mb-4 border border-slate-800/80 rounded-xl p-2 bg-slate-950/60">
                            {allDistributors
                                .filter(d => d.name.toLowerCase().includes(distributorModalSearch.toLowerCase()))
                                .map((dist) => {
                                    const isChecked = tempDistributorIds.includes(dist.id);
                                    return (
                                        <label
                                            key={dist.id}
                                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition text-xs font-medium ${isChecked
                                                    ? 'bg-emerald-950/80 border-emerald-500/60 text-white font-bold'
                                                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-850'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleDistributorInTemp(dist.id)}
                                                    className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                                />
                                                <span>{dist.name}</span>
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-mono">
                                                {dist.products_count || 0} products
                                            </span>
                                        </label>
                                    );
                                })}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setIsDistributorModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={applyDistributorSelection}
                                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5"
                            >
                                <Check className="h-4 w-4" />
                                <span>Apply ({tempDistributorIds.length} Selected)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD / EDIT PURCHASE MODAL */}
            {isAddModalOpen && (
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

                            {/* Date & Provider Selection */}
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
                                    {selectedDistributor && !isAllDistributors && selectedDistributors.length === 1 ? (
                                        <input
                                            type="text"
                                            disabled
                                            value={selectedDistributor.name}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 font-bold"
                                        />
                                    ) : (
                                        <select
                                            required
                                            value={formDistributorId}
                                            onChange={(e) => handleFormDistributorChange(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                                        >
                                            <option value="">-- Select Distributor First --</option>
                                            {allDistributors.map(d => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Hierarchical Product Selector: Hidden until distributor is chosen */}
                            <div>
                                {!formDistributorId ? (
                                    <div className="p-3 bg-slate-950/70 border border-dashed border-slate-700 rounded-xl text-center">
                                        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                            <span>Please select a <strong>Distributor</strong> above to view and choose its products</span>
                                        </div>
                                    </div>
                                ) : availableProductsForForm.length === 0 ? (
                                    <div className="text-xs text-rose-300 bg-rose-950/60 p-3 rounded-xl border border-rose-800/80 flex items-center justify-between">
                                        <span>No products registered for this distributor yet.</span>
                                        <a href="/products" className="text-rose-400 hover:text-white underline font-semibold text-xs ml-2">Add to Catalog &rarr;</a>
                                    </div>
                                ) : (
                                    <div className="transition-all duration-300">
                                        <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                                            <span>Product of Selected Distributor</span>
                                            <span className="text-[10px] text-slate-400 font-normal">
                                                ({availableProductsForForm.length} products available)
                                            </span>
                                        </label>
                                        <select
                                            required
                                            value={formProductId}
                                            onChange={(e) => handleProductChange(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full bg-slate-950 border border-emerald-500/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                                        >
                                            <option value="">-- Select Product --</option>
                                            {availableProductsForForm.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} (Base Cost: ₱{p.purchase_price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
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
                                    <span>{formVatRate}% VAT Adjusted Amount:</span>
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
                                    disabled={availableProductsForForm.length === 0}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md"
                                >
                                    {editingPurchase ? 'Save Changes' : 'Save & Sync Inventory'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* DATE FILTER MODAL CALENDAR (Single Date, Per Month, Date Range) */}
            {isDateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-scale-up">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 bg-emerald-950 border border-emerald-500/40 rounded-xl text-emerald-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Filter Purchase Transactions</h3>
                                    <p className="text-xs text-slate-400">Filter by single date, entire month, or custom date range</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDateModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Segmented Filter Mode Tabs */}
                        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-4 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setFilterTab('single')}
                                className={`py-2 rounded-lg transition text-center flex items-center justify-center space-x-1.5 ${filterTab === 'single'
                                        ? 'bg-emerald-600 text-white shadow-md font-bold'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                    }`}
                            >
                                <span>📅 Single Date</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterTab('month')}
                                className={`py-2 rounded-lg transition text-center flex items-center justify-center space-x-1.5 ${filterTab === 'month'
                                        ? 'bg-emerald-600 text-white shadow-md font-bold'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                    }`}
                            >
                                <span>🗓️ Per Month</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterTab('range')}
                                className={`py-2 rounded-lg transition text-center flex items-center justify-center space-x-1.5 ${filterTab === 'range'
                                        ? 'bg-emerald-600 text-white shadow-md font-bold'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                    }`}
                            >
                                <span>↔️ Date Range</span>
                            </button>
                        </div>

                        {/* MODE 1: SINGLE DATE / MODE 3: DATE RANGE CALENDAR VIEW */}
                        {(filterTab === 'single' || filterTab === 'range') && (
                            <div>
                                {/* Range Info Banner in Range Mode */}
                                {filterTab === 'range' && (
                                    <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl mb-4 text-xs space-y-2">
                                        <div className="flex items-center justify-between text-slate-300">
                                            <span className="font-semibold">Selected Range:</span>
                                            <span className="font-mono text-emerald-400 font-bold">
                                                {tempStartDate ? formatDateDisplay(tempStartDate) : 'Select Start'}
                                                {' → '}
                                                {tempEndDate ? formatDateDisplay(tempEndDate) : 'Select End'}
                                            </span>
                                        </div>

                                        {/* Direct Day Range Inputs (ex. Day 4 to Day 27) */}
                                        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                                            <span className="text-[11px] text-slate-400 whitespace-nowrap">Day Range:</span>
                                            <div className="flex items-center space-x-1">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={rangeStartDay}
                                                    onChange={(e) => setRangeStartDay(e.target.value)}
                                                    className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs text-white font-mono"
                                                    placeholder="4"
                                                />
                                                <span className="text-slate-500">to</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={rangeEndDay}
                                                    onChange={(e) => setRangeEndDay(e.target.value)}
                                                    className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs text-white font-mono"
                                                    placeholder="27"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => applyQuickDayNumberRange(parseInt(rangeStartDay) || 4, parseInt(rangeEndDay) || 27)}
                                                className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 rounded text-xs font-semibold ml-auto"
                                            >
                                                Apply ({rangeStartDay}–{rangeEndDay})
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Month & Year Navigation Header */}
                                <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3">
                                    <button
                                        type="button"
                                        onClick={prevMonth}
                                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                                        title="Previous Month"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    <div className="text-center">
                                        <span className="text-sm font-bold text-white tracking-wide">
                                            {MONTH_NAMES[calendarMonth]} {calendarYear}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={nextMonth}
                                        className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                                        title="Next Month"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Calendar Days of Week Header */}
                                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 uppercase mb-2">
                                    <div>Sun</div>
                                    <div>Mon</div>
                                    <div>Tue</div>
                                    <div>Wed</div>
                                    <div>Thu</div>
                                    <div>Fri</div>
                                    <div>Sat</div>
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-1 mb-4">
                                    {getDaysInMonth(calendarYear, calendarMonth).map((item, idx) => {
                                        if (!item.isCurrentMonth) {
                                            return (
                                                <div
                                                    key={idx}
                                                    className="h-9 flex items-center justify-center text-xs text-slate-700 select-none"
                                                >
                                                    {item.day}
                                                </div>
                                            );
                                        }

                                        const hasData = availableDates.includes(item.dateStr);
                                        const isToday = item.dateStr === new Date().toISOString().split('T')[0];

                                        if (filterTab === 'single') {
                                            const isSelected = tempSingleDate === item.dateStr;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleDayClickInCalendar(item.dateStr)}
                                                    className={`h-9 relative flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all ${isSelected
                                                            ? 'bg-emerald-600 text-white font-bold shadow-md scale-105 ring-2 ring-emerald-400'
                                                            : hasData
                                                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900 font-bold'
                                                                : 'text-slate-300 hover:bg-slate-800'
                                                        } ${isToday && !isSelected ? 'ring-1 ring-slate-500' : ''}`}
                                                >
                                                    <span>{item.day}</span>
                                                    {hasData && (
                                                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                                                    )}
                                                </button>
                                            );
                                        } else {
                                            // RANGE MODE STYLING
                                            const isStart = tempStartDate === item.dateStr;
                                            const isEnd = tempEndDate === item.dateStr;
                                            const isInRange = tempStartDate && tempEndDate && item.dateStr >= tempStartDate && item.dateStr <= tempEndDate;

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleDayClickInCalendar(item.dateStr)}
                                                    className={`h-9 relative flex flex-col items-center justify-center text-xs font-semibold transition-all ${isStart || isEnd
                                                            ? 'bg-emerald-600 text-white font-bold shadow-md ring-2 ring-emerald-400 rounded-xl'
                                                            : isInRange
                                                                ? 'bg-emerald-900/60 text-emerald-200 border-y border-emerald-600/40'
                                                                : hasData
                                                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900 rounded-xl font-bold'
                                                                    : 'text-slate-300 hover:bg-slate-800 rounded-xl'
                                                        }`}
                                                >
                                                    <span>{item.day}</span>
                                                    {hasData && (
                                                        <span className={`h-1.5 w-1.5 rounded-full ${isStart || isEnd ? 'bg-white' : 'bg-emerald-400'}`} />
                                                    )}
                                                </button>
                                            );
                                        }
                                    })}
                                </div>

                                {/* Range Presets / Quick Chips */}
                                {filterTab === 'range' && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => applyQuickDayNumberRange(4, 27)}
                                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-950 font-mono font-semibold"
                                        >
                                            Day 4 – 27
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyQuickDayNumberRange(1, 15)}
                                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 font-mono"
                                        >
                                            Days 1 – 15
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyQuickDayNumberRange(16, 31)}
                                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 font-mono"
                                        >
                                            Days 16 – 31
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyQuickDayNumberRange(1, 31)}
                                            className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 font-mono"
                                        >
                                            Entire Month
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MODE 2: PER MONTH FILTER VIEW */}
                        {filterTab === 'month' && (
                            <div className="space-y-4">
                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                                    <label className="block text-xs font-semibold text-slate-300 mb-2">Select Year</label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setCalendarYear(y => y - 1)}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
                                        >
                                            &larr; {calendarYear - 1}
                                        </button>
                                        <div className="flex-1 text-center font-bold text-lg text-emerald-400">
                                            {calendarYear}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCalendarYear(y => y + 1)}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg"
                                        >
                                            {calendarYear + 1} &rarr;
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-2">Select Month of {calendarYear}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {MONTH_NAMES.map((mName, idx) => {
                                            const mStr = `${calendarYear}-${String(idx + 1).padStart(2, '0')}`;
                                            const isSelected = tempMonth === mStr || (tempMonth === '' && calendarMonth === idx);

                                            const hasMonthData = availableDates.some(d => d.startsWith(mStr));

                                            return (
                                                <button
                                                    key={mName}
                                                    type="button"
                                                    onClick={() => {
                                                        setCalendarMonth(idx);
                                                        setTempMonth(mStr);
                                                    }}
                                                    className={`py-3 px-2 rounded-xl text-xs font-semibold transition border flex flex-col items-center justify-center space-y-1 ${tempMonth === mStr
                                                            ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-md shadow-emerald-950 ring-2 ring-emerald-400'
                                                            : hasMonthData
                                                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900 font-bold'
                                                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <span>{mName}</span>
                                                    {hasMonthData && (
                                                        <span className="text-[10px] font-normal text-emerald-400">● Data</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modal Footer Actions */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 gap-2">
                            <button
                                type="button"
                                onClick={handleClearAllDateFilters}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                            >
                                Clear All Filters
                            </button>

                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsDateModalOpen(false)}
                                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApplyModalFilter}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950 transition flex items-center space-x-1.5"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>Apply Filter</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Delete Purchase Record"
                message="Are you sure you want to permanently delete this purchase transaction? The inventory stock quantity in Subsystem 1 will be automatically adjusted to maintain balance."
                confirmText="Yes, Delete Record"
                isLoading={isDeleting}
                onConfirm={handleExecuteDelete}
                onCancel={() => {
                    if (!isDeleting) {
                        setDeleteModalOpen(false);
                        setPurchaseToDelete(null);
                    }
                }}
            />
        </MainLayout>
    );
}
