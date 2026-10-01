import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Boxes, 
    Search, 
    Filter, 
    RefreshCw, 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle,
    Edit3,
    Check,
    X,
    Layers,
    Download
} from 'lucide-react';
import { downloadCSV } from '@/utils/exportCsv';

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
        search: string;
        category: string;
        distributor: string;
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
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
    const [selectedDistributor, setSelectedDistributor] = useState(filters.distributor || '');
    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Quick inline stock editor
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editQty, setEditQty] = useState<number>(0);

    const handleFilter = (overrides: Record<string, string> = {}) => {
        router.get('/inventory', {
            search: overrides.search ?? searchQuery,
            category: overrides.category ?? selectedCategory,
            distributor: overrides.distributor ?? selectedDistributor,
        }, { preserveState: true });
    };

    // Live debounced search
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            handleFilter({ search: value });
        }, 300);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedDistributor('');
        router.get('/inventory', {}, { preserveState: true });
    };

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

    const handleExportCSV = () => {
        const headers = [
            'Product ID',
            'SKU',
            'Category',
            'Distributor',
            'Product Name',
            'Purchase Price (PHP)',
            'Selling Price (PHP)',
            'Quantity In Stock',
            'Inventory Valuation (PHP)'
        ];

        const rows = inventories.map(item => [
            item.product_id,
            item.sku,
            item.category,
            item.distributor_name,
            item.product_name,
            item.purchase_price,
            item.selling_price,
            item.quantity,
            (Number(item.purchase_price) * Number(item.quantity)).toFixed(2)
        ]);

        downloadCSV(`winzelle_inventory_report_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    };

    return (
        <MainLayout title="Inventory Management">
            <Head title="Subsystem 1: Module 1 - Inventory Management" />

            {/* Header section */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                        <span>Subsystem 1</span>
                        <span>•</span>
                        <span>Module 1: Inventory Management System</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Boxes className="h-7 w-7 text-emerald-400" />
                        <span>Central Product Inventory</span>
                    </h1>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={inventories.length === 0}
                        className="text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition shadow-sm"
                        title="Export current inventory table to CSV"
                    >
                        <Download className="h-4 w-4 text-emerald-400" />
                        <span>Export CSV</span>
                    </button>
                    <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        <span>Auto-synced with Sales & Purchases</span>
                    </span>
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

            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search SKU, Product, or Distributor..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => { setSelectedCategory(e.target.value); handleFilter({ category: e.target.value }); }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {/* Distributor Filter */}
                    <select
                        value={selectedDistributor}
                        onChange={(e) => { setSelectedDistributor(e.target.value); handleFilter({ distributor: e.target.value }); }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                        <option value="">All Distributors</option>
                        {distributors.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    {/* Filter action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg transition"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Inventory Table as requested for Subsystem 1 Module 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-slate-850 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-emerald-400" />
                        <span>Subsystem 1 - Inventory Table</span>
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                        Columns: Product_id | SKU | Category | Distributor | Product Name | Quantity
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                                <th className="py-3 px-4">Product ID</th>
                                <th className="py-3 px-4">SKU (Distributor)</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Distributor</th>
                                <th className="py-3 px-4">Product Name</th>
                                <th className="py-3 px-4 text-right">Purchase Price</th>
                                <th className="py-3 px-4 text-right">Selling Price</th>
                                <th className="py-3 px-4 text-center">Stock Quantity</th>
                                <th className="py-3 px-4 text-center">Stock Status</th>
                                <th className="py-3 px-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                            {inventories.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-slate-500">
                                        No inventory records match your criteria. Record purchases in Subsystem 2 Module 3 to populate inventory!
                                    </td>
                                </tr>
                            ) : (
                                inventories.map((item) => {
                                    const isEditing = editingId === item.id;
                                    const isLowStock = item.quantity <= lowStockThreshold;

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-850/80 transition-colors">
                                            <td className="py-3 px-4 font-mono text-slate-400">
                                                #{item.product_id}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                                                {item.sku || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-white">
                                                {item.distributor_name}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-slate-100">
                                                {item.product_name}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-slate-300">
                                                {formatCurrency(Number(item.purchase_price))}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-emerald-300">
                                                {formatCurrency(Number(item.selling_price))}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={editQty}
                                                        onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                                                        className="w-20 bg-slate-950 border border-emerald-500 rounded px-2 py-1 text-center font-bold text-white text-xs"
                                                    />
                                                ) : (
                                                    <span className={`font-mono font-black text-sm px-2.5 py-0.5 rounded ${
                                                        isLowStock 
                                                            ? 'bg-amber-950 text-amber-300 border border-amber-700/60' 
                                                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                                                    }`}>
                                                        {item.quantity}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {isLowStock ? (
                                                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-700/40">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        <span>Low Stock</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-700/40">
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>In Stock</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
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
            </div>
        </MainLayout>
    );
}
