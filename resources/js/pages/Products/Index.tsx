import React, { useState, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import TablePagination from '@/Components/TablePagination';
import SortableHeader from '@/Components/SortableHeader';
import { useTablePaginationAndSort } from '@/hooks/useTablePaginationAndSort';
import { 
    PackagePlus, 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Building2, 
    DollarSign, 
    Tag, 
    CheckCircle2,
    AlertCircle,
    Loader2,
    RotateCcw,
    Archive
} from 'lucide-react';

interface Distributor {
    id: number;
    name: string;
    contact_number: string;
    logo?: string;
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
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

interface Props {
    distributors: Distributor[];
    selectedDistributor: Distributor | null;
    products: Product[];
    categories?: string[];
    archivedCount?: number;
    showArchived?: boolean;
    filters?: { search: string; archived?: boolean };
}

export default function ProductsIndex({ 
    distributors, 
    selectedDistributor, 
    products, 
    categories = [], 
    archivedCount = 0, 
    showArchived = false, 
    filters 
}: Props) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role || 'guest';
    const canManage = userRole === 'admin' || userRole === 'owner';
    const canDelete = userRole === 'admin';

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [prodToDelete, setProdToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [category, setCategory] = useState('');
    const [purchasePrice, setPurchasePrice] = useState<number>(0);
    const [defaultDiscount, setDefaultDiscount] = useState<number>(0);
    const [defaultDealingPrice, setDefaultDealingPrice] = useState<number>(0);
    const [processing, setProcessing] = useState(false);

    // Real-time validation: duplicate check
    const duplicateError = useMemo(() => {
        const trimmed = name.trim().toLowerCase();
        if (!trimmed) return '';
        const found = products.find(
            p => p.name.trim().toLowerCase() === trimmed && (!editingProduct || p.id !== editingProduct.id)
        );
        return found ? `Product "${found.name}" already exists under this distributor!` : '';
    }, [name, products, editingProduct]);

    // Sorting and Pagination for products
    const {
        sortKey,
        sortDirection,
        handleSort,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        paginatedData,
    } = useTablePaginationAndSort<Product>({
        data: products,
        initialSortKey: 'name',
        initialSortDirection: 'asc',
        initialPageSize: 15,
    });

    // Live debounced search
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            router.get('/products', { 
                distributor_id: selectedDistributor?.id, 
                search: value || undefined,
                archived: showArchived ? 1 : undefined
            }, { preserveState: true, preserveScroll: true });
        }, 300);
    };

    const toggleArchived = (archived: boolean) => {
        router.get('/products', {
            distributor_id: selectedDistributor?.id,
            archived: archived ? 1 : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleRestore = (prodId: number) => {
        router.post(`/products/${prodId}/restore`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDistributorChange = (distId: number) => {
        router.get('/products', { 
            distributor_id: distId,
            archived: showArchived ? 1 : undefined
        }, { preserveState: true, preserveScroll: true });
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setName('');
        setSku('');
        setCategory(categories[0] || 'General');
        setPurchasePrice(0);
        setDefaultDiscount(0);
        setDefaultDealingPrice(0);
        setIsModalOpen(true);
    };

    const openEditModal = (p: Product) => {
        setEditingProduct(p);
        setName(p.name);
        setSku(p.sku || '');
        setCategory(p.category || 'General');
        setPurchasePrice(Number(p.purchase_price));
        setDefaultDiscount(Number(p.default_discount || 0));
        setDefaultDealingPrice(Number(p.default_dealing_price || 0));
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDistributor || processing || duplicateError || !name.trim() || purchasePrice < 0) return;

        setProcessing(true);
        const payload = {
            distributor_id: selectedDistributor.id,
            name: name.trim(),
            sku: sku.trim() || undefined,
            category: category.trim() || 'General',
            purchase_price: purchasePrice,
            default_discount: defaultDiscount,
            default_dealing_price: defaultDealingPrice || (purchasePrice + defaultDiscount),
        };

        if (editingProduct) {
            router.put(`/products/${editingProduct.id}`, payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setIsModalOpen(false),
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post('/products', payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setIsModalOpen(false),
                onFinish: () => setProcessing(false),
            });
        }
    };

    const confirmDelete = (prodId: number, prodName: string) => {
        setProdToDelete({ id: prodId, name: prodName });
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (!prodToDelete) return;
        setIsDeleting(true);
        router.delete(`/products/${prodToDelete.id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setProdToDelete(null);
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    return (
        <MainLayout title="Products">
            <Head title="Products" />

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <PackagePlus className="h-7 w-7 text-emerald-400" />
                        <span>Products</span>
                    </h1>
                </div>

                {selectedDistributor && (
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Active vs Archived Toggle */}
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                            <button
                                type="button"
                                onClick={() => toggleArchived(false)}
                                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                    !showArchived 
                                        ? 'bg-emerald-600 text-white shadow' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Building2 className="h-3.5 w-3.5" />
                                <span>Active</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleArchived(true)}
                                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                                    showArchived 
                                        ? 'bg-amber-600 text-white shadow' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Archive className="h-3.5 w-3.5" />
                                <span>Archived ({archivedCount})</span>
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-44 lg:w-56 bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                        />
                        {canManage && !showArchived && (
                            <button
                                onClick={openAddModal}
                                className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition border border-emerald-400/30"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Product</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Distributor Selector Tab Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 shadow-md">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select Distributor to Manage Products:
                </label>
                <div className="flex flex-wrap gap-2">
                    {distributors.map((d) => {
                        const isSelected = selectedDistributor?.id === d.id;
                        return (
                            <button
                                key={d.id}
                                onClick={() => handleDistributorChange(d.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 border ${
                                    isSelected
                                        ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/60 shadow-md'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                {d.logo ? (
                                    <img src={d.logo} alt={d.name} className="h-5 w-5 rounded object-contain bg-white/10 p-0.5" />
                                ) : (
                                    <Building2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                )}
                                <span>{d.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Archive Notice Banner */}
            {showArchived && (
                <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>You are viewing archived products. These products are preserved safely and can be restored at any time.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => toggleArchived(false)}
                        className="text-amber-400 hover:underline font-bold whitespace-nowrap"
                    >
                        View Active Products &rarr;
                    </button>
                </div>
            )}

            {/* Products Table */}
            {selectedDistributor ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {selectedDistributor.logo ? (
                                <img
                                    src={selectedDistributor.logo}
                                    alt={selectedDistributor.name}
                                    className="h-12 w-12 rounded-xl object-contain bg-slate-950/80 p-1 border border-emerald-500/40 shadow-md shrink-0"
                                />
                            ) : (
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-lg flex items-center justify-center border border-emerald-400/30 shadow-md shrink-0">
                                    {selectedDistributor.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>Products of</span>
                                    <span className="text-emerald-400 font-extrabold">{selectedDistributor.name}</span>
                                </h2>
                                <p className="text-xs text-slate-400">Configure item names, base purchase prices, and dealing margins.</p>
                            </div>
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-emerald-300 font-mono border border-slate-700">
                            {totalItems} Items Listed
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                                    <SortableHeader label="SKU Code" sortKey="sku" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                                    <SortableHeader label="Product Name" sortKey="name" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                                    <SortableHeader label="Category" sortKey="category" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                                    <SortableHeader label="Base Purchase Price" sortKey="purchase_price" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} align="right" />
                                    <SortableHeader label="Default Discount" sortKey="default_discount" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} align="right" />
                                    <SortableHeader label="Default Dealing Price" sortKey="default_dealing_price" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} align="right" />
                                    <th className="py-3.5 px-4 text-center font-bold uppercase tracking-wider text-[11px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-500">
                                            No products found for this distributor yet. Click <strong className="text-emerald-400">"Add Product"</strong> to register products!
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-850/80 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                                {p.sku || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-white min-w-[160px]">
                                                {p.name}
                                            </td>
                                            <td className="py-3 px-4 whitespace-nowrap">
                                                <span className="whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                                                {formatCurrency(Number(p.purchase_price))}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono text-slate-400">
                                                {formatCurrency(Number(p.default_discount))}
                                            </td>
                                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-300">
                                                {formatCurrency(Number(p.default_dealing_price))}
                                            </td>
                                            <td className="py-3 px-4 text-center space-x-1">
                                                {showArchived ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRestore(p.id)}
                                                        className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-lg transition inline-flex items-center gap-1 font-bold text-xs shadow-sm"
                                                        title="Restore Product"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        <span>Restore</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        {canManage && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(p)}
                                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                                                                title="Adjust Name or Price"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                type="button"
                                                                onClick={() => confirmDelete(p.id, p.name)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                                                title="Archive Product"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {!canManage && !canDelete && (
                                                            <span className="text-[10px] text-slate-500 italic">View only</span>
                                                        )}
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    Please select or add a distributor above.
                </div>
            )}

            {/* ADD / EDIT PRODUCT MODAL WITH REAL-TIME VALIDATION */}
            {isModalOpen && selectedDistributor && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <PackagePlus className="h-5 w-5 text-emerald-400" />
                                <span>{editingProduct ? 'Update Product Details' : 'Add New Product'}</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {duplicateError && (
                            <div className="mb-4 p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                                <span>{duplicateError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Distributor</label>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800">
                                    {selectedDistributor.logo && (
                                        <img src={selectedDistributor.logo} alt={selectedDistributor.name} className="h-5 w-5 object-contain rounded" />
                                    )}
                                    <span className="text-xs font-bold text-emerald-300">{selectedDistributor.name}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Pep Reg 195ml PET/12"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                                        duplicateError ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-700 focus:border-emerald-500'
                                    }`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code (Auto if blank)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PEP-195-PET"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Price Settings */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Price (₱) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={purchasePrice}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            setPurchasePrice(val);
                                            setDefaultDealingPrice(val + defaultDiscount);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Default Discount (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={defaultDiscount}
                                        onChange={(e) => {
                                            const disc = parseFloat(e.target.value) || 0;
                                            setDefaultDiscount(disc);
                                            setDefaultDealingPrice(purchasePrice + disc);
                                        }}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Dealing Price (₱)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={defaultDealingPrice}
                                    onChange={(e) => setDefaultDealingPrice(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Default selling price used across transactions</p>
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !!duplicateError || !name.trim() || purchasePrice < 0}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition border border-emerald-400/30"
                                >
                                    {processing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>{processing ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Custom Styled Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Archive Product"
                message={`Are you sure you want to move product "${prodToDelete?.name}" to archive? It can be restored anytime.`}
                confirmText="Move to Archive"
                isLoading={isDeleting}
                onConfirm={handleExecuteDelete}
                onCancel={() => {
                    if (!isDeleting) {
                        setDeleteModalOpen(false);
                        setProdToDelete(null);
                    }
                }}
            />
        </MainLayout>
    );
}
