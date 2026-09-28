import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Truck, 
    Plus, 
    Star, 
    Phone, 
    Mail, 
    MapPin, 
    Edit2, 
    Trash2, 
    X,
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

interface Props {
    distributors: Distributor[];
    favorites: Distributor[];
    others: Distributor[];
}

export default function DistributorsIndex({ distributors, favorites, others }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);

    const [name, setName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);

    const openAddModal = () => {
        setEditingDistributor(null);
        setName('');
        setContactNumber('');
        setEmail('');
        setAddress('');
        setIsFavorite(favorites.length < 4); // default true if favorites < 4
        setIsModalOpen(true);
    };

    const openEditModal = (dist: Distributor) => {
        setEditingDistributor(dist);
        setName(dist.name);
        setContactNumber(dist.contact_number);
        setEmail(dist.email || '');
        setAddress(dist.address || '');
        setIsFavorite(dist.is_favorite);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            contact_number: contactNumber,
            email,
            address,
            is_favorite: isFavorite,
        };

        if (editingDistributor) {
            router.put(`/distributors/${editingDistributor.id}`, payload, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            router.post('/distributors', payload, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleToggleFavorite = (distId: number) => {
        router.post(`/distributors/${distId}/toggle-favorite`, {}, { preserveScroll: true });
    };

    const handleDelete = (distId: number, distName: string) => {
        if (confirm(`Are you sure you want to delete distributor "${distName}"? This will remove associated products.`)) {
            router.delete(`/distributors/${distId}`, { preserveScroll: true });
        }
    };

    return (
        <MainLayout title="Distributor Management">
            <Head title="Subsystem 2: Module 1 - Distributors" />

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                        <span>Subsystem 2</span>
                        <span>•</span>
                        <span>Module 1: Adding of Distributors</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Truck className="h-7 w-7 text-emerald-400" />
                        <span>Distributor Directory</span>
                    </h1>
                </div>

                <button
                    onClick={openAddModal}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition border border-emerald-400/30"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add New Distributor</span>
                </button>
            </div>

            {/* Distributor Grid */}
            <div className="space-y-8">
                {/* Favorite Section */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                        <h2 className="text-base font-bold text-white uppercase tracking-wider">Favorite Distributors</h2>
                        <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                            {favorites.length} Favorites
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {favorites.map((dist) => (
                            <div key={dist.id} className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-amber-500/60 transition">
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-950 text-emerald-300 font-bold text-lg flex items-center justify-center border border-emerald-500/40">
                                            {dist.name.charAt(0)}
                                        </div>
                                        <button
                                            onClick={() => handleToggleFavorite(dist.id)}
                                            className="p-1.5 text-amber-400 hover:scale-110 transition"
                                            title="Favorite"
                                        >
                                            <Star className="h-5 w-5 fill-amber-400" />
                                        </button>
                                    </div>

                                    <h3 className="text-base font-bold text-white">{dist.name}</h3>
                                    
                                    <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                                        <div className="flex items-center space-x-2 text-emerald-300 font-medium">
                                            <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                            <span>{dist.contact_number}</span>
                                        </div>
                                        {dist.email && (
                                            <div className="flex items-center space-x-2 text-slate-400">
                                                <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                                <span className="truncate">{dist.email}</span>
                                            </div>
                                        )}
                                        {dist.address && (
                                            <div className="flex items-start space-x-2 text-slate-400">
                                                <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{dist.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-mono">
                                        {dist.products_count || 0} Products registered
                                    </span>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => openEditModal(dist)}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                                            title="Edit Distributor"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dist.id, dist.name)}
                                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                                            title="Delete Distributor"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Distributors Section */}
                <div>
                    <div className="flex items-center space-x-2 mb-4">
                        <Building2 className="h-5 w-5 text-slate-400" />
                        <h2 className="text-base font-bold text-white uppercase tracking-wider">Other Distributors</h2>
                        <span className="text-xs text-slate-400">(Alphabetical)</span>
                    </div>

                    {others.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center text-slate-400 text-sm">
                            No other distributors. All distributors are in your Favorites section!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {others.map((dist) => (
                                <div key={dist.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="h-9 w-9 rounded-lg bg-slate-800 text-slate-300 font-bold text-sm flex items-center justify-center border border-slate-700">
                                                {dist.name.charAt(0)}
                                            </div>
                                            <button
                                                onClick={() => handleToggleFavorite(dist.id)}
                                                className="p-1.5 text-slate-500 hover:text-amber-400 hover:scale-110 transition"
                                                title="Mark as favorite"
                                            >
                                                <Star className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <h3 className="text-sm font-bold text-white">{dist.name}</h3>
                                        <div className="mt-2 space-y-1 text-xs text-slate-300">
                                            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{dist.contact_number}</span>
                                            </div>
                                            {dist.email && <div className="text-slate-400">{dist.email}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            {dist.products_count || 0} Items
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => openEditModal(dist)}
                                                className="p-1 text-slate-400 hover:text-white rounded"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dist.id, dist.name)}
                                                className="p-1 text-slate-400 hover:text-rose-400 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD / EDIT DISTRIBUTOR MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Truck className="h-5 w-5 text-emerald-400" />
                                <span>{editingDistributor ? 'Edit Distributor' : 'Add New Distributor'}</span>
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Name of Distributor *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. PEPSI COLA PRODUCTS PHILS"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Number *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. +63 917 123 4567"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Optional)</label>
                                <input
                                    type="email"
                                    placeholder="distributor@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Location (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="City or Warehouse Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="favCheck"
                                    checked={isFavorite}
                                    onChange={(e) => setIsFavorite(e.target.checked)}
                                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="favCheck" className="text-xs font-medium text-slate-300 cursor-pointer flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 text-amber-400" />
                                    <span>Mark as Favorite Distributor (Show in Favorites card grid)</span>
                                </label>
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
                                    {editingDistributor ? 'Update Distributor' : 'Add Distributor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
