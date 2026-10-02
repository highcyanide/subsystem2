import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Boxes, 
    Search, 
    RefreshCw, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle,
    Edit3,
    Check,
    X,
    Layers,
    Download,
    FileSpreadsheet,
    Building2,
    Tag,
    ChevronDown,
    SlidersHorizontal,
    Plus,
    Minus
} from 'lucide-react';
import { useTablePaginationAndSort } from '@/hooks/useTablePaginationAndSort';
import TablePagination from '@/Components/TablePagination';
import SortableHeader from '@/Components/SortableHeader';
import { exportInventoryExcel, exportInventoryCSV } from '@/utils/exportTemplateExcel';

interface InventoryItem {
    id: number;
    product_id: number;
    sku: string;
    category: string;
    distributor_name: string;
    product_name: string;
    quantity: number;
    purchase_price: number;
    selling_price: number;
    updated_at: string;
    total_valuation?: number;
    stock_status?: string;
}

interface Summary {
    total_products: number;
    total_items: number;
    total_valuation: number;
}

interface Props {
    inventories: InventoryItem[];
    categories: string[];
    distributors: string[];
    summary: Summary;
    filters: {
        search?: string;
        categories?: string[];
        distributors?: string[];
        category?: string;
        distributor?: string;
    };
    lowStockThreshold?: number;
}

export default function InventoryIndex({
    inventories,
    categories,
    distributors,
    summary,
    filters,
    lowStockThreshold = 15
}: Props) {
    const { props } = usePage<any>();
    const companyName = props?.companyName || props?.settings?.company_name || 'WINZELLE';

    // Parse initial multi-select filters
    const initialDistributors = useMemo(() => {
        if (Array.isArray(filters?.distributors) && filters.distributors.length > 0) {
            return filters.distributors;
        }
        if (filters?.distributor) {
            return filters.distributor.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    }, [filters]);

    const initialCategories = useMemo(() => {
        if (Array.isArray(filters?.categories) && filters.categories.length > 0) {
            return filters.categories;
        }
        if (filters?.category) {
            return filters.category.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
    }, [filters]);

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedDistributors, setSelectedDistributors] = useState<string[]>(initialDistributors);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);

    const [distributorSearch, setDistributorSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');

    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    
    const userRole = props?.auth?.user?.role || 'guest';
    const canEditStock = userRole === 'admin' || userRole === 'owner' || userRole === 'checker';

    // Batch Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);

    // Batch Stock Adjust Modal State
    const [isBatchStockModalOpen, setIsBatchStockModalOpen] = useState(false);
    const [stockActionMode, setStockActionMode] = useState<'set' | 'adjust'>('set');
    const [stockSetQty, setStockSetQty] = useState<number>(10);
    const [stockAdjustDelta, setStockAdjustDelta] = useState<number>(5);
    const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

    // Batch Category Modal State
    const [isBatchCategoryModalOpen, setIsBatchCategoryModalOpen] = useState(false);
    const [selectedNewCategory, setSelectedNewCategory] = useState<string>('');
    const [customNewCategory, setCustomNewCategory] = useState<string>('');

    // Quick inline stock editor (if needed)
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQty, setEditQty] = useState<number>(0);

    // Enrich inventories with pre-calculated fields for sorting & display
    const enrichedInventories = useMemo(() => {
        return inventories.map(item => {
            const qty = Number(item.quantity) || 0;
            const pPrice = Number(item.purchase_price) || 0;
            const valuation = qty * pPrice;
            const isLow = qty <= lowStockThreshold;
            const status = isLow ? 'Low Stock' : 'In Stock';
            return {
                ...item,
                total_valuation: valuation,
                stock_status: status
            };
        });
    }, [inventories, lowStockThreshold]);

    // Sorting & Pagination
    const {
        sortedData,
        paginatedData,
        sortConfig,
        requestSort,
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        setPage,
        setPageSize,
    } = useTablePaginationAndSort({
        data: enrichedInventories,
        defaultSortKey: 'quantity',
        defaultDirection: 'asc',
        defaultPageSize: 10,
    });

    // Compute active totals based on filtered & sorted dataset
    const tableTotals = useMemo(() => {
        let totalQty = 0;
        let totalValuation = 0;
        let sumPurchase = 0;
        let sumSelling = 0;
        let inStock = 0;
        let lowStock = 0;

        sortedData.forEach(item => {
            const q = Number(item.quantity) || 0;
            const p = Number(item.purchase_price) || 0;
            const s = Number(item.selling_price) || 0;
            const v = Number(item.total_valuation) || (q * p);
            totalQty += q;
            totalValuation += v;
            sumPurchase += p;
            sumSelling += s;
            if (q <= lowStockThreshold) lowStock++;
            else inStock++;
        });

        const count = sortedData.length;
        const avgPurchase = count > 0 ? (sumPurchase / count) : 0;
        const avgSelling = count > 0 ? (sumSelling / count) : 0;

        return {
            count,
            totalQty,
            totalValuation,
            avgPurchase,
            avgSelling,
            inStock,
            lowStock
        };
    }, [sortedData, lowStockThreshold]);

    const triggerBackendFilter = (
        dists: string[] = selectedDistributors,
        cats: string[] = selectedCategories,
        query: string = searchQuery
    ) => {
        router.get('/inventory', {
            search: query || undefined,
            distributors: dists.length > 0 ? dists : undefined,
            categories: cats.length > 0 ? cats : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    // Live debounced search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            triggerBackendFilter(selectedDistributors, selectedCategories, value);
        }, 300);
    };

    // Toggle a distributor (multi-select)
    const toggleDistributor = (distName: string) => {
        const next = selectedDistributors.includes(distName)
            ? selectedDistributors.filter(d => d !== distName)
            : [...selectedDistributors, distName];
        setSelectedDistributors(next);
        triggerBackendFilter(next, selectedCategories, searchQuery);
    };

    const clearDistributors = () => {
        setSelectedDistributors([]);
        triggerBackendFilter([], selectedCategories, searchQuery);
    };

    // Toggle a category (multi-select: e.g. pick 2 out of 3)
    const toggleCategory = (catName: string) => {
        const next = selectedCategories.includes(catName)
            ? selectedCategories.filter(c => c !== catName)
            : [...selectedCategories, catName];
        setSelectedCategories(next);
        triggerBackendFilter(selectedDistributors, next, searchQuery);
    };

    const clearCategories = () => {
        setSelectedCategories([]);
        triggerBackendFilter(selectedDistributors, [], searchQuery);
    };

    const handleClearAll = () => {
        setSearchQuery('');
        setSelectedDistributors([]);
        setSelectedCategories([]);
        setDistributorSearch('');
        setCategorySearch('');
        router.get('/inventory', {}, { preserveState: true, preserveScroll: true });
    };

    // Filter distributor pills by quick search
    const filteredDistributorPills = useMemo(() => {
        const q = distributorSearch.trim().toLowerCase();
        if (!q) return distributors;
        return distributors.filter(d => d.toLowerCase().includes(q));
    }, [distributors, distributorSearch]);

    // Filter category pills by quick search
    const filteredCategoryPills = useMemo(() => {
        const q = categorySearch.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter(c => c.toLowerCase().includes(q));
    }, [categories, categorySearch]);

    const startEditing = (item: InventoryItem) => {
        setEditingId(item.id);
        setEditQty(item.quantity);
    };

    const saveQuantityUpdate = (id: number) => {
        router.patch(`/inventory/${id}/quantity`, { quantity: editQty }, {
            onSuccess: () => setEditingId(null),
            preserveScroll: true
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    const handleExportExcel = () => {
        const exportData = sortedData.map(item => ({
            sku: item.sku,
            category: item.category,
            distributor_name: item.distributor_name,
            product_name: item.product_name,
            purchase_price: Number(item.purchase_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            quantity: Number(item.quantity) || 0,
            stock_status: item.stock_status,
            total_valuation: item.total_valuation ?? ((Number(item.purchase_price) || 0) * (Number(item.quantity) || 0))
        }));

        exportInventoryExcel(companyName, exportData, 'inventory_report');
    };

    const handleExportCSV = () => {
        const exportData = sortedData.map(item => ({
            sku: item.sku,
            category: item.category,
            distributor_name: item.distributor_name,
            product_name: item.product_name,
            purchase_price: Number(item.purchase_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            quantity: Number(item.quantity) || 0,
            stock_status: item.stock_status,
            total_valuation: item.total_valuation ?? ((Number(item.purchase_price) || 0) * (Number(item.quantity) || 0))
        }));

        exportInventoryCSV(companyName, exportData, 'inventory_report');
    };

    // Selection helpers
    const isAllOnPageSelected = useMemo(() => {
        if (paginatedData.length === 0) return false;
        return paginatedData.every(item => selectedIds.includes(item.id));
    }, [paginatedData, selectedIds]);

    const isSomeOnPageSelected = useMemo(() => {
        if (paginatedData.length === 0) return false;
        return paginatedData.some(item => selectedIds.includes(item.id)) && !isAllOnPageSelected;
    }, [paginatedData, selectedIds, isAllOnPageSelected]);

    const handleToggleSelectAllOnPage = () => {
        if (isAllOnPageSelected) {
            const pageIds = paginatedData.map(i => i.id);
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const pageIds = paginatedData.map(i => i.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
        }
    };

    const handleToggleSelectRow = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
        );
    };

    const handleSelectAllMatching = () => {
        setSelectedIds(inventories.map(i => i.id));
    };

    const handleClearSelection = () => {
        setSelectedIds([]);
        setIsActionDropdownOpen(false);
    };

    // Export Selected items
    const handleExportSelectedExcel = () => {
        const selectedItems = enrichedInventories.filter(item => selectedIds.includes(item.id));
        const exportData = (selectedItems.length > 0 ? selectedItems : sortedData).map(item => ({
            sku: item.sku,
            category: item.category,
            distributor_name: item.distributor_name,
            product_name: item.product_name,
            purchase_price: Number(item.purchase_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            quantity: Number(item.quantity) || 0,
            stock_status: item.stock_status,
            total_valuation: item.total_valuation ?? ((Number(item.purchase_price) || 0) * (Number(item.quantity) || 0))
        }));

        exportInventoryExcel(companyName, exportData, `inventory_selected_${selectedItems.length}`);
    };

    const handleExportSelectedCSV = () => {
        const selectedItems = enrichedInventories.filter(item => selectedIds.includes(item.id));
        const exportData = (selectedItems.length > 0 ? selectedItems : sortedData).map(item => ({
            sku: item.sku,
            category: item.category,
            distributor_name: item.distributor_name,
            product_name: item.product_name,
            purchase_price: Number(item.purchase_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            quantity: Number(item.quantity) || 0,
            stock_status: item.stock_status,
            total_valuation: item.total_valuation ?? ((Number(item.purchase_price) || 0) * (Number(item.quantity) || 0))
        }));

        exportInventoryCSV(companyName, exportData, `inventory_selected_${selectedItems.length}`);
    };

    // Batch Submit Handlers
    const handleExecuteBatchStock = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0) return;
        setIsSubmittingBatch(true);

        const payload: any = {
            ids: selectedIds,
            action: stockActionMode === 'set' ? 'set_quantity' : 'add_quantity',
        };

        if (stockActionMode === 'set') {
            payload.quantity = stockSetQty;
        } else {
            payload.adjustment = stockAdjustDelta;
        }

        router.post('/inventory/batch', payload, {
            onSuccess: () => {
                setIsBatchStockModalOpen(false);
                setSelectedIds([]);
            },
            onFinish: () => setIsSubmittingBatch(false),
            preserveScroll: true
        });
    };

    const handleExecuteBatchCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIds.length === 0) return;
        const targetCategory = customNewCategory.trim() || selectedNewCategory;
        if (!targetCategory) return;

        setIsSubmittingBatch(true);
        router.post('/inventory/batch', {
            ids: selectedIds,
            action: 'set_category',
            category: targetCategory
        }, {
            onSuccess: () => {
                setIsBatchCategoryModalOpen(false);
                setSelectedIds([]);
                setCustomNewCategory('');
            },
            onFinish: () => setIsSubmittingBatch(false),
            preserveScroll: true
        });
    };

    const hasActiveFilters = Boolean(
        selectedDistributors.length > 0 || selectedCategories.length > 0 || searchQuery
    );

    return (
        <MainLayout title="Inventory">
            <Head title="Inventory" />

            {/* Header section */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Boxes className="h-7 w-7 text-emerald-400" />
                        <span>Inventory</span>
                    </h1>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={inventories.length === 0}
                        className="text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold transition shadow-sm"
                        title="Export formatted Excel (.xlsx) report"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                        <span>Export Excel</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={inventories.length === 0}
                        className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium transition shadow-sm"
                        title="Export current inventory table to CSV"
                    >
                        <Download className="h-4 w-4 text-slate-400" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Product SKUs</span>
                        <div className="text-2xl font-black text-white mt-1">{summary.total_products}</div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                        <Layers className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Units in Stock</span>
                        <div className="text-2xl font-black text-amber-400 mt-1">{summary.total_items.toLocaleString()}</div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Boxes className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-slate-900 border border-emerald-900/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Inventory Valuation</span>
                        <div className="text-2xl font-black text-emerald-300 mt-1">{formatCurrency(summary.total_valuation)}</div>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* MINIMALIST MULTI-SELECT SEARCH & FILTER CONSOLE          */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl mb-6 shadow-xl space-y-4">
                
                {/* Search Bar + Reset */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                        <input
                            type="text"
                            placeholder="Search SKU, product, or keyword..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner font-sans"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearAll}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition shrink-0"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Clear Filters</span>
                        </button>
                    )}
                </div>

                {/* Multi-Select Distributors */}
                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                            <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Distributors:</span>
                            {selectedDistributors.length > 0 && (
                                <span className="text-emerald-400 font-normal">({selectedDistributors.length} selected)</span>
                            )}
                        </span>
                        {distributors.length > 6 && (
                            <input
                                type="text"
                                placeholder="Find distributor..."
                                value={distributorSearch}
                                onChange={(e) => setDistributorSearch(e.target.value)}
                                className="w-36 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={clearDistributors}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                selectedDistributors.length === 0
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            All
                        </button>

                        {filteredDistributorPills.map((d) => {
                            const isSelected = selectedDistributors.includes(d);
                            return (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => toggleDistributor(d)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                                        isSelected
                                            ? 'bg-emerald-600 text-white shadow ring-1 ring-emerald-400/50'
                                            : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                                    }`}
                                >
                                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                    <span>{d}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Multi-Select Categories */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                            <Tag className="h-3.5 w-3.5 text-teal-400" />
                            <span>Categories:</span>
                            {selectedCategories.length > 0 && (
                                <span className="text-teal-400 font-normal">({selectedCategories.length} selected)</span>
                            )}
                        </span>
                        {categories.length > 6 && (
                            <input
                                type="text"
                                placeholder="Find category..."
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                className="w-36 bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                            />
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={clearCategories}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                selectedCategories.length === 0
                                    ? 'bg-teal-600 text-white shadow'
                                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                        >
                            All
                        </button>

                        {filteredCategoryPills.map((c) => {
                            const isSelected = selectedCategories.includes(c);
                            return (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => toggleCategory(c)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                                        isSelected
                                            ? 'bg-teal-600 text-white shadow ring-1 ring-teal-400/50'
                                            : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                                    }`}
                                >
                                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                    <span>{c}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ======================================================== */}
            {/* INVENTORY TABLE WITH BATCH SELECTION & ACTION DROPDOWN   */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Header bar: Transforms into batch toolbar when 1+ items selected */}
                <div className={`px-5 py-3 border-b transition-all duration-300 flex flex-wrap items-center justify-between gap-3 ${
                    selectedIds.length > 0 
                        ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border-emerald-500/50 shadow-inner' 
                        : 'bg-slate-850 border-slate-800'
                }`}>
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Boxes className="h-4 w-4 text-emerald-400" />
                            <span>Inventory</span>
                        </h2>

                        {selectedIds.length > 0 ? (
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    <span>{selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected</span>
                                </span>
                                {selectedIds.length < inventories.length && (
                                    <button
                                        type="button"
                                        onClick={handleSelectAllMatching}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 ml-1"
                                    >
                                        Select all {inventories.length} matching
                                    </button>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 font-mono">
                                {totalItems} items matching
                            </span>
                        )}
                    </div>

                    {/* ACTION DROPDOWN / BATCH CONTROLS (REVEALED ONLY WHEN 1+ ITEMS ARE SELECTED) */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 relative">
                            {/* Quick Action Button: Adjust Stock */}
                            {canEditStock && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (selectedIds.length === 1) {
                                            const singleItem = inventories.find(i => i.id === selectedIds[0]);
                                            if (singleItem) setStockSetQty(singleItem.quantity);
                                        }
                                        setIsBatchStockModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                    <span>Adjust Stock {selectedIds.length > 1 ? `(${selectedIds.length})` : ''}</span>
                                </button>
                            )}

                            {/* Dropdown Menu Toggle */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <span>Actions</span>
                                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isActionDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isActionDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-30" 
                                            onClick={() => setIsActionDropdownOpen(false)} 
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 py-1.5 text-xs animate-scale-up">
                                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                                                Batch Actions ({selectedIds.length} Selected)
                                            </div>

                                            {canEditStock && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsActionDropdownOpen(false);
                                                            if (selectedIds.length === 1) {
                                                                const singleItem = inventories.find(i => i.id === selectedIds[0]);
                                                                if (singleItem) setStockSetQty(singleItem.quantity);
                                                            }
                                                            setIsBatchStockModalOpen(true);
                                                        }}
                                                        className="w-full text-left px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition flex items-center gap-2"
                                                    >
                                                        <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                                                        <span>Adjust Stock Quantity</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsActionDropdownOpen(false);
                                                            setSelectedNewCategory(categories[0] || '');
                                                            setCustomNewCategory('');
                                                            setIsBatchCategoryModalOpen(true);
                                                        }}
                                                        className="w-full text-left px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition flex items-center gap-2"
                                                    >
                                                        <Tag className="h-3.5 w-3.5 text-teal-400" />
                                                        <span>Update Category</span>
                                                    </button>

                                                    <div className="my-1 border-t border-slate-800" />
                                                </>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsActionDropdownOpen(false);
                                                    handleExportSelectedExcel();
                                                }}
                                                className="w-full text-left px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition flex items-center gap-2"
                                            >
                                                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                                                <span>Export Selected to Excel</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsActionDropdownOpen(false);
                                                    handleExportSelectedCSV();
                                                }}
                                                className="w-full text-left px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition flex items-center gap-2"
                                            >
                                                <Download className="h-3.5 w-3.5 text-slate-400" />
                                                <span>Export Selected to CSV</span>
                                            </button>

                                            <div className="my-1 border-t border-slate-800" />

                                            <button
                                                type="button"
                                                onClick={handleClearSelection}
                                                className="w-full text-left px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition flex items-center gap-2"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                                <span>Deselect All</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Clear Selection Button */}
                            <button
                                type="button"
                                onClick={handleClearSelection}
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                                title="Clear selection"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                                {/* First Column: Master Checkbox */}
                                <th className="py-3 px-3 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllOnPageSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSomeOnPageSelected;
                                        }}
                                        onChange={handleToggleSelectAllOnPage}
                                        className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                                        title={isAllOnPageSelected ? "Deselect all on this page" : "Select all on this page"}
                                    />
                                </th>
                                <SortableHeader label="SKU" sortKey="sku" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Category" sortKey="category" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Distributor" sortKey="distributor_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Product Name" sortKey="product_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} />
                                <SortableHeader label="Purchase Price" sortKey="purchase_price" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                <SortableHeader label="Selling Price" sortKey="selling_price" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                <SortableHeader label="Stock Quantity" sortKey="quantity" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="center" className="whitespace-nowrap" />
                                <SortableHeader label="Stock Status" sortKey="stock_status" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="center" className="whitespace-nowrap" />
                                <SortableHeader label="Total Valuation" sortKey="total_valuation" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-slate-500">
                                        No inventory records match your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => {
                                    const isSelected = selectedIds.includes(item.id);
                                    const isLowStock = item.quantity <= lowStockThreshold;

                                    return (
                                        <tr 
                                            key={item.id} 
                                            className={`transition-colors cursor-pointer select-none ${
                                                isSelected 
                                                    ? 'bg-emerald-950/40 hover:bg-emerald-950/60' 
                                                    : 'hover:bg-slate-850/80'
                                            }`}
                                            onClick={(e) => {
                                                const target = e.target as HTMLElement;
                                                if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('button')) {
                                                    return;
                                                }
                                                handleToggleSelectRow(item.id);
                                            }}
                                        >
                                            {/* First Column: Checkbox */}
                                            <td className="py-3 px-3 text-center w-10" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelectRow(item.id)}
                                                    className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                                                />
                                            </td>

                                            {/* SKU */}
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                                {item.sku || 'N/A'}
                                            </td>

                                            {/* Category */}
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 shadow-sm">
                                                    {item.category}
                                                </span>
                                            </td>

                                            {/* Distributor */}
                                            <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                                                {item.distributor_name}
                                            </td>

                                            {/* Product Name */}
                                            <td className="py-3 px-4 font-medium text-slate-100 min-w-[200px]">
                                                {item.product_name}
                                            </td>

                                            {/* Purchase Price */}
                                            <td className="py-3 px-4 text-right font-mono whitespace-nowrap text-slate-300">
                                                {formatCurrency(Number(item.purchase_price))}
                                            </td>

                                            {/* Selling Price */}
                                            <td className="py-3 px-4 text-right font-mono whitespace-nowrap text-emerald-300">
                                                {formatCurrency(Number(item.selling_price))}
                                            </td>

                                            {/* Stock Quantity */}
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded whitespace-nowrap ${
                                                    isLowStock 
                                                        ? 'bg-amber-950 text-amber-300 border border-amber-700/60' 
                                                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                                }`}>
                                                    {item.quantity}
                                                </span>
                                            </td>

                                            {/* Stock Status */}
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {isLowStock ? (
                                                    <span className="whitespace-nowrap inline-flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-700/40">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        <span>Low Stock</span>
                                                    </span>
                                                ) : (
                                                    <span className="whitespace-nowrap inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/40">
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>In Stock</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Total Valuation */}
                                            <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap text-emerald-400">
                                                {formatCurrency(item.total_valuation ?? ((Number(item.purchase_price) || 0) * (Number(item.quantity) || 0)))}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        <tfoot className="bg-slate-950 border-t-2 border-slate-700 text-xs font-bold text-slate-200">
                            <tr>
                                <td className="py-3.5 px-3"></td>
                                <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider text-slate-400">
                                    TOTALS ({tableTotals.count} SKUs):
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-slate-300 whitespace-nowrap" title="Average Purchase Price">
                                    {formatCurrency(tableTotals.avgPurchase)} <span className="text-[10px] text-slate-500 font-normal block sm:inline">(Avg)</span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono text-emerald-300 whitespace-nowrap" title="Average Selling Price">
                                    {formatCurrency(tableTotals.avgSelling)} <span className="text-[10px] text-slate-500 font-normal block sm:inline">(Avg)</span>
                                </td>
                                <td className="py-3.5 px-4 text-center font-mono font-black text-white text-sm whitespace-nowrap">
                                    {tableTotals.totalQty.toLocaleString()}
                                </td>
                                <td className="py-3.5 px-4 text-center text-[11px] text-slate-400 whitespace-nowrap">
                                    <span className="text-emerald-400 font-bold">{tableTotals.inStock} In</span> / <span className="text-amber-400 font-bold">{tableTotals.lowStock} Low</span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 text-sm whitespace-nowrap">
                                    {formatCurrency(tableTotals.totalValuation)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Pagination */}
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            {/* ======================================================== */}
            {/* BATCH ADJUST STOCK QUANTITY MODAL                        */}
            {/* ======================================================== */}
            {isBatchStockModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center space-x-2">
                                <SlidersHorizontal className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-base font-bold text-white">
                                    {selectedIds.length === 1 ? 'Adjust Stock Quantity' : `Batch Adjust Stock (${selectedIds.length} Items)`}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBatchStockModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteBatchStock} className="space-y-4">
                            <p className="text-xs text-slate-400">
                                Update inventory stock levels for {selectedIds.length === 1 ? 'the selected item' : `all ${selectedIds.length} selected items`}.
                            </p>

                            {/* Mode Tabs */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setStockActionMode('set')}
                                    className={`py-2 rounded-lg transition text-center ${
                                        stockActionMode === 'set'
                                            ? 'bg-emerald-600 text-white font-bold shadow-md'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Set Fixed Value
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStockActionMode('adjust')}
                                    className={`py-2 rounded-lg transition text-center ${
                                        stockActionMode === 'adjust'
                                            ? 'bg-emerald-600 text-white font-bold shadow-md'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Add / Subtract
                                </button>
                            </div>

                            {stockActionMode === 'set' ? (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        New Stock Quantity (Units)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockSetQty}
                                        onChange={(e) => setStockSetQty(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none"
                                        required
                                    />
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Sets the stock quantity of all {selectedIds.length} item(s) directly to this value.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                        Stock Quantity Adjustment
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setStockAdjustDelta(prev => prev - 5)}
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                                        >
                                            -5
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStockAdjustDelta(prev => prev - 1)}
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                                        >
                                            -1
                                        </button>
                                        <input
                                            type="number"
                                            value={stockAdjustDelta}
                                            onChange={(e) => setStockAdjustDelta(parseInt(e.target.value) || 0)}
                                            className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-center font-bold text-sm text-emerald-400 focus:outline-none"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setStockAdjustDelta(prev => prev + 1)}
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                                        >
                                            +1
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStockAdjustDelta(prev => prev + 5)}
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold"
                                        >
                                            +5
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-1">
                                        Use positive numbers (e.g. +10) to add stock, or negative numbers (e.g. -5) to deduct.
                                    </p>
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsBatchStockModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingBatch}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>{isSubmittingBatch ? 'Applying Changes...' : 'Save Stock Update'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* BATCH UPDATE CATEGORY MODAL                              */}
            {/* ======================================================== */}
            {isBatchCategoryModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-slate-900 border border-teal-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center space-x-2">
                                <Tag className="h-5 w-5 text-teal-400" />
                                <h3 className="text-base font-bold text-white">
                                    Update Category ({selectedIds.length} Items)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsBatchCategoryModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleExecuteBatchCategory} className="space-y-4">
                            <p className="text-xs text-slate-400">
                                Select or type a new category to assign to all {selectedIds.length} selected items.
                            </p>

                            {/* Existing Categories Picker */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Choose Existing Category
                                </label>
                                <select
                                    value={selectedNewCategory}
                                    onChange={(e) => {
                                        setSelectedNewCategory(e.target.value);
                                        setCustomNewCategory('');
                                    }}
                                    className="w-full bg-slate-950 border border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none"
                                >
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Or Custom Category Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    Or Create New Category
                                </label>
                                <input
                                    type="text"
                                    placeholder="Type custom category name..."
                                    value={customNewCategory}
                                    onChange={(e) => setCustomNewCategory(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 focus:border-teal-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsBatchCategoryModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingBatch || (!customNewCategory.trim() && !selectedNewCategory)}
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>{isSubmittingBatch ? 'Updating...' : 'Assign Category'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
