import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    PackagePlus, 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Building2,
    DollarSign,
    Tag,
    CheckCircle2
} from 'lucide-react';

interface Distributor {
    id: number;
    name: string;
    contact_number: string;
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

interface Props {
    distributors: Distributor[];
    selectedDistributor: Distributor | null;
    products: Product[];
}

export default function ProductsIndex({ distributors, selectedDistributor, products }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [category, setCategory] = useState('Carbonated');
    const [purchasePrice, setPurchasePrice] = useState<number>(0);
    const [defaultDiscount, setDefaultDiscount] = useState<number>(0);
    const [defaultDealingPrice, setDefaultDealingPrice] = useState<number>(0);

    const handleDistributorChange = (distId: number) => {
        router.get('/products', { distributor_id: distId }, { preserveState: true });
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setName('');
        setSku('');
        setCategory('Carbonated');
        setPurchasePrice(100);
        setDefaultDiscount(5);
        setDefaultDealingPrice(105);
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
        if (!selectedDistributor) return;

        const payload = {
            distributor_id: selectedDistributor.id,
            name,
            sku,
            category,
            purchase_price: purchasePrice,
            default_discount: defaultDiscount,
            default_dealing_price: defaultDealingPrice || (purchasePrice + defaultDiscount),
        };

        if (editingProduct) {
            router.put(`/products/${editingProduct.id}`, payload, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/products', payload, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (prodId: number, prodName: string) => {
        if (confirm(`Are you sure you want to delete product "${prodName}"?`)) {
            router.delete(`/products/${prodId}`, { preserveScroll: true });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    return (
        <MainLayout title="Distributor Items">
            <Head title="Subsystem 2: Module 2 - Adding & Updating Items" />

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                        <span>Subsystem 2</span>
                        <span>•</span>
                        <span>Module 2: Adding and Updating of Items of Each Distributor</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <PackagePlus className="h-7 w-7 text-emerald-400" />
                        <span>Distributor Product Catalog</span>
                    </h1>
                </div>

                {selectedDistributor && (
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition border border-emerald-400/30"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Product for {selectedDistributor.name}</span>
                    </button>
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
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 border ${
                                    isSelected
                                        ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/60 shadow-md'
                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Building2 className="h-3.5 w-3.5" />
                                <span>{d.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Products Table */}
            {selectedDistributor ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-850 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>Products of</span>
                                <span className="text-emerald-400 font-extrabold">{selectedDistributor.name}</span>
                            </h2>
                            <p className="text-xs text-slate-400">Configure item names, base purchase prices, and dealing margins.</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                            {products.length} Items Listed
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                                    <th className="py-3.5 px-4">SKU Code</th>
                                    <th className="py-3.5 px-4">Product Name (Adjustable)</th>
                                    <th className="py-3.5 px-4">Category</th>
                                    <th className="py-3.5 px-4 text-right">Base Purchase Price</th>
                                    <th className="py-3.5 px-4 text-right">Default Discount</th>
                                    <th className="py-3.5 px-4 text-right">Default Dealing Price</th>
                                    <th className="py-3.5 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-500">
                                            No products found for this distributor yet. Click <strong className="text-emerald-400">"Add Product"</strong> to register products!
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-850/80 transition-colors">
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                                                {p.sku || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-white">
                                                {p.name}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
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
                                                <button
                                                    onClick={() => openEditModal(p)}
                                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                                                    title="Adjust Name or Price"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id, p.name)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    Please select or add a distributor above.
                </div>
            )}

            {/* ADD / EDIT PRODUCT MODAL */}
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Distributor</label>
                                <input
                                    type="text"
                                    disabled
                                    value={selectedDistributor.name}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-emerald-300"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Adjust Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Pep Reg 195ml PET/12"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. PEP-195-PET"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Price Settings */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Set Purchase Price (₱) *</label>
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
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
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
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md"
                                >
                                    {editingProduct ? 'Save Product Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
