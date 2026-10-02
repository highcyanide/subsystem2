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
    Tag
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
    
    // Quick inline stock editor
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQty, setEditQty] = useState<number>(0);

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
        data: inventories,
        defaultSortKey: 'quantity',
        defaultDirection: 'asc',
        defaultPageSize: 10,
    });

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
            product_id: item.product_id,
            sku: item.sku,
            category: item.category,
            distributor_name: item.distributor_name,
            product_name: item.product_name,
            purchase_price: Number(item.purchase_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            quantity: Number(item.quantity) || 0,
            total_valuation: (Number(item.purchase_price) || 0) * (Number(item.quantity) || 0)
        }));

        exportInventoryExcel(companyName, exportData, 'inventory_report');
    };

    const handleExportCSV = () => {
        const exportData = sortedData.map(item => ({
            product_id: item.product_id,
            sku: item.sku,
            category: item.category,
            distributor_name: item.distributor_name,
            product_name: item.product_name,
            purchase_price: Number(item.purchase_price) || 0,
            selling_price: Number(item.selling_price) || 0,
            quantity: Number(item.quantity) || 0,
            total_valuation: (Number(item.purchase_price) || 0) * (Number(item.quantity) || 0)
        }));

        exportInventoryCSV(companyName, exportData, 'inventory_report');
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
            {/* INVENTORY TABLE                                          */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-850 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-emerald-400" />
                        <span>Inventory</span>
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                        {totalItems} items matching
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                                <SortableHeader label="SKU" sortKey="sku" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Category" sortKey="category" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Distributor" sortKey="distributor_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Product Name" sortKey="product_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} />
                                <SortableHeader label="Purchase Price" sortKey="purchase_price" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                <SortableHeader label="Selling Price" sortKey="selling_price" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                <SortableHeader label="Stock Quantity" sortKey="quantity" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="center" className="whitespace-nowrap" />
                                <th className="py-3 px-4 text-center whitespace-nowrap">Stock Status</th>
                                <th className="py-3 px-4 text-center whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-500">
                                        No inventory records match your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item) => {
                                    const isEditing = editingId === item.id;
                                    const isLowStock = item.quantity <= lowStockThreshold;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-850/80 transition-colors">
                                            {/* SKU */}
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                                {item.sku || 'N/A'}
                                            </td>

                                            {/* Category (whitespace-nowrap inline-flex) */}
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
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editQty}
                                                        onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                                                        className="w-20 bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-center font-bold text-white text-xs"
                                                    />
                                                ) : (
                                                    <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded whitespace-nowrap ${
                                                        isLowStock 
                                                            ? 'bg-amber-950 text-amber-300 border border-amber-700/60' 
                                                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                                    }`}>
                                                        {item.quantity}
                                                    </span>
                                                )}
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

                                            {/* Action */}
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <button
                                                            onClick={() => saveQuantityUpdate(item.id)}
                                                            className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded"
                                                            title="Save"
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEditing(item)}
                                                        className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition"
                                                        title="Adjust Stock Quantity"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
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
        </MainLayout>
    );
}
