import React, { useState, useMemo } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import TablePagination from '@/Components/TablePagination';
import SortableHeader from '@/Components/SortableHeader';
import { useTablePaginationAndSort } from '@/hooks/useTablePaginationAndSort';
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
    CheckCircle2,
    Image as ImageIcon,
    Upload,
    AlertCircle,
    Loader2,
    LayoutGrid,
    List,
    Search,
    Package,
    ExternalLink,
    RotateCcw,
    Archive
} from 'lucide-react';

interface Distributor {
    id: number;
    name: string;
    contact_number: string;
    email?: string;
    address?: string;
    logo?: string;
    is_favorite: boolean;
    products_count?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}

interface Props {
    distributors: Distributor[];
    favorites: Distributor[];
    others: Distributor[];
    archivedCount?: number;
    showArchived?: boolean;
    filters?: { search: string; archived?: boolean };
}

export default function DistributorsIndex({ 
    distributors, 
    favorites, 
    others, 
    archivedCount = 0, 
    showArchived = false, 
    filters 
}: Props) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role || 'guest';
    const canManage = userRole === 'admin' || userRole === 'owner';
    const canDelete = userRole === 'admin';

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [distToDelete, setDistToDelete] = useState<{ id: number; name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingDistributor, setViewingDistributor] = useState<Distributor | null>(null);
    const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
    const [returnToViewAfterEdit, setReturnToViewAfterEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const [name, setName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [logo, setLogo] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    // Real-time validation: duplicate name check
    const duplicateError = useMemo(() => {
        const trimmed = name.trim().toLowerCase();
        if (!trimmed) return '';
        const found = distributors.find(
            d => d.name.trim().toLowerCase() === trimmed && (!editingDistributor || d.id !== editingDistributor.id)
        );
        return found ? `Distributor "${found.name}" already exists!` : '';
    }, [name, distributors, editingDistributor]);

    // Live debounced search
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            router.get('/distributors', { 
                search: value || undefined,
                archived: showArchived ? 1 : undefined 
            }, { preserveState: true, preserveScroll: true });
        }, 300);
    };

    const toggleArchived = (archived: boolean) => {
        router.get('/distributors', {
            archived: archived ? 1 : undefined,
            search: searchQuery || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleRestore = (distId: number) => {
        router.post(`/distributors/${distId}/restore`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                if (viewingDistributor && viewingDistributor.id === distId) {
                    setViewingDistributor(null);
                }
            }
        });
    };

    // Table sorting and pagination for all distributors
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
    } = useTablePaginationAndSort<Distributor>({
        data: distributors,
        initialSortKey: 'name',
        initialSortDirection: 'asc',
        initialPageSize: 12,
    });

    const openAddModal = () => {
        setEditingDistributor(null);
        setName('');
        setContactNumber('');
        setEmail('');
        setAddress('');
        setLogo('');
        setIsFavorite(favorites.length < 4);
        setIsModalOpen(true);
    };

    const openEditModal = (dist: Distributor) => {
        setEditingDistributor(dist);
        setName(dist.name);
        setContactNumber(dist.contact_number);
        setEmail(dist.email || '');
        setAddress(dist.address || '');
        setLogo(dist.logo || '');
        setIsFavorite(dist.is_favorite);
        setIsModalOpen(true);
    };

    const openViewModal = (dist: Distributor) => {
        setViewingDistributor(dist);
    };

    const closeViewModal = () => {
        setViewingDistributor(null);
        setReturnToViewAfterEdit(false);
    };

    const handleEditFromView = () => {
        const dist = viewingDistributor;
        if (dist) {
            setReturnToViewAfterEdit(true);
            openEditModal(dist);
        }
    };

    const handleDeleteFromView = () => {
        const dist = viewingDistributor;
        setViewingDistributor(null);
        if (dist) confirmDelete(dist.id, dist.name);
    };

    const handleToggleFavoriteFromView = (id: number) => {
        handleToggleFavorite(id);
        setViewingDistributor(prev => prev && prev.id === id ? { ...prev, is_favorite: !prev.is_favorite } : prev);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            alert('Image size exceeds 8MB limit.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDimension = 400;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Convert to WEBP format for optimal fast website loading
                    try {
                        const webpUri = canvas.toDataURL('image/webp', 0.85);
                        setLogo(webpUri);
                    } catch (err) {
                        setLogo(canvas.toDataURL('image/png', 0.85));
                    }
                } else {
                    setLogo(event.target?.result as string);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (processing || duplicateError || !name.trim() || !contactNumber.trim()) return;

        setProcessing(true);
        const payload = {
            name: name.trim(),
            contact_number: contactNumber.trim(),
            email: email.trim() || null,
            address: address.trim() || null,
            logo: logo.trim() || null,
            is_favorite: isFavorite,
        };

        if (editingDistributor) {
            router.put(`/distributors/${editingDistributor.id}`, payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsModalOpen(false);
                    if (returnToViewAfterEdit && viewingDistributor) {
                        setViewingDistributor(prev => prev ? {
                            ...prev,
                            ...payload,
                        } : null);
                        setReturnToViewAfterEdit(false);
                    }
                },
                onFinish: () => setProcessing(false),
            });
        } else {
            router.post('/distributors', payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setIsModalOpen(false),
                onFinish: () => setProcessing(false),
            });
        }
    };

    const handleToggleFavorite = (distId: number) => {
        router.post(`/distributors/${distId}/toggle-favorite`, {}, { preserveScroll: true, preserveState: true });
    };

    const confirmDelete = (distId: number, distName: string) => {
        setDistToDelete({ id: distId, name: distName });
        setDeleteModalOpen(true);
    };

    const handleExecuteDelete = () => {
        if (!distToDelete) return;
        setIsDeleting(true);
        router.delete(`/distributors/${distToDelete.id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteModalOpen(false);
                setDistToDelete(null);
            }
        });
    };

    return (
        <MainLayout title="Distributors">
            <Head title="Distributors" />

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Truck className="h-7 w-7 text-emerald-400" />
                        <span>Distributors</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Active vs Archived Toggle Pills */}
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

                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode('cards')}
                            title="Cards View"
                            className={`p-1.5 rounded-lg transition ${viewMode === 'cards' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            title="Table View"
                            className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Live Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search distributors..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-48 lg:w-60 bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                        />
                    </div>
                    {canManage && !showArchived && (
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition border border-emerald-400/30"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Add Distributor</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Archive Notice Banner */}
            {showArchived && (
                <div className="mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs">
                    <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>You are viewing archived distributors. These records are preserved safely and can be restored back to your active directory at any time.</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => toggleArchived(false)}
                        className="text-amber-400 hover:underline font-bold whitespace-nowrap"
                    >
                        View Active Distributors &rarr;
                    </button>
                </div>
            )}

            {viewMode === 'cards' ? (
                /* Distributor Cards Grid */
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {favorites.map((dist) => (
                                <div
                                    key={dist.id}
                                    onClick={() => openViewModal(dist)}
                                    className="group relative bg-slate-900 border border-amber-500/35 hover:border-amber-500/70 rounded-2xl p-5 shadow-lg hover:shadow-emerald-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between text-center cursor-pointer h-72 select-none"
                                >
                                    {/* Top row: Favorite indicator & Star button */}
                                    <div className="w-full flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                            <Star className="h-3 w-3 fill-amber-400" />
                                            <span>Favorite</span>
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleFavorite(dist.id);
                                            }}
                                            className="p-1.5 text-amber-400 hover:scale-110 transition rounded-lg"
                                            title="Unmark favorite"
                                        >
                                            <Star className="h-4 w-4 fill-amber-400" />
                                        </button>
                                    </div>

                                    {/* Center: BIGGER LOGO & NAME */}
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full my-1">
                                        <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/5 border border-slate-700/60 p-2.5 shadow-inner flex items-center justify-center group-hover:scale-105 group-hover:border-amber-400/60 transition-all duration-300">
                                            {dist.logo ? (
                                                <img
                                                    src={dist.logo}
                                                    alt={dist.name}
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <div className="h-full w-full rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-950 text-amber-300 font-black text-3xl sm:text-4xl flex items-center justify-center border border-amber-500/40 shadow-md">
                                                    {dist.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 px-1 text-center">
                                            {dist.name}
                                        </h3>
                                    </div>

                                    {/* Bottom row: Product count and details hint */}
                                    <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                        <Link
                                            href={`/products?distributor_id=${dist.id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[11px] text-slate-300 hover:text-emerald-300 font-mono bg-slate-800/80 hover:bg-slate-700/80 px-2 py-0.5 rounded-md border border-slate-700 transition"
                                            title="View products directly"
                                        >
                                            {dist.products_count || 0} Products
                                        </Link>
                                        <span className="text-[11px] font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                            Details &rarr;
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* All / Other Distributors Section */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <Building2 className="h-5 w-5 text-slate-400" />
                            <h2 className="text-base font-bold text-white uppercase tracking-wider">Other Distributors</h2>
                            <span className="text-xs text-slate-400">({others.length} companies)</span>
                        </div>

                        {others.length === 0 ? (
                            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center text-slate-400 text-sm">
                                No other distributors. All distributors are in your Favorites section!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {others.map((dist) => (
                                    <div
                                        key={dist.id}
                                        onClick={() => openViewModal(dist)}
                                        className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg hover:shadow-emerald-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between text-center cursor-pointer h-72 select-none"
                                    >
                                        {/* Top row: Status indicator & Star button */}
                                        <div className="w-full flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                Distributor
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleFavorite(dist.id);
                                                }}
                                                className="p-1.5 text-slate-500 hover:text-amber-400 hover:scale-110 transition rounded-lg"
                                                title="Mark as favorite"
                                            >
                                                <Star className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Center: BIGGER LOGO & NAME */}
                                        <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full my-1">
                                            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/5 border border-slate-700/60 p-2.5 shadow-inner flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-400/60 transition-all duration-300">
                                                {dist.logo ? (
                                                    <img
                                                        src={dist.logo}
                                                        alt={dist.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full rounded-xl bg-slate-800 text-slate-300 font-bold text-3xl sm:text-4xl flex items-center justify-center border border-slate-700 shadow-md">
                                                        {dist.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 px-1 text-center">
                                                {dist.name}
                                            </h3>
                                        </div>

                                        {/* Bottom row: Product count and details hint */}
                                        <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                            <Link
                                                href={`/products?distributor_id=${dist.id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[11px] text-slate-300 hover:text-emerald-300 font-mono bg-slate-800/80 hover:bg-slate-700/80 px-2 py-0.5 rounded-md border border-slate-700 transition"
                                                title="View products directly"
                                            >
                                                {dist.products_count || 0} Products
                                            </Link>
                                            <span className="text-[11px] font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                                Details &rarr;
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Directory Table View with Full Sorting and Pagination */
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                                    <th className="py-3 px-3 w-14 text-center font-bold uppercase tracking-wider text-[11px]">Logo</th>
                                    <SortableHeader label="Company Name" sortKey="name" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                                    <SortableHeader label="Products Count" sortKey="products_count" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} align="center" />
                                    <SortableHeader label="Contact Number" sortKey="contact_number" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                                    <SortableHeader label="Email Address" sortKey="email" currentSortKey={sortKey} currentDirection={sortDirection} onSort={handleSort} />
                                    <th className="py-3 px-3 font-bold uppercase tracking-wider text-[11px]">Address</th>
                                    <th className="py-3 px-3 text-center font-bold uppercase tracking-wider text-[11px]">Favorite</th>
                                    <th className="py-3 px-3 text-center font-bold uppercase tracking-wider text-[11px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate-500">
                                            No distributors found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((dist) => (
                                        <tr key={dist.id} className="hover:bg-slate-850/80 transition-colors">
                                            <td className="py-2.5 px-3 text-center">
                                                {dist.logo ? (
                                                    <img
                                                        src={dist.logo}
                                                        alt={dist.name}
                                                        className="h-8 w-8 rounded-lg object-contain bg-slate-950/80 p-0.5 border border-slate-700 mx-auto"
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-lg bg-emerald-950 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/40 mx-auto">
                                                        {dist.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold text-white cursor-pointer hover:text-emerald-400 transition" onClick={() => openViewModal(dist)}>
                                                {dist.name}
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-mono font-semibold text-emerald-400">
                                                <Link
                                                    href={`/products?distributor_id=${dist.id}`}
                                                    className="hover:underline"
                                                    title="View products"
                                                >
                                                    {dist.products_count || 0}
                                                </Link>
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-300 font-mono">
                                                {dist.contact_number}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-400">
                                                {dist.email || '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                                                {dist.address || '—'}
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <button
                                                    onClick={() => handleToggleFavorite(dist.id)}
                                                    className="p-1 hover:scale-110 transition"
                                                >
                                                    <Star className={`h-4 w-4 ${dist.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                                                </button>
                                            </td>
                                            <td className="py-2.5 px-3 text-center space-x-1">
                                                <Link
                                                    href={`/products?distributor_id=${dist.id}`}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition inline-flex items-center"
                                                    title="Manage Products"
                                                >
                                                    <Package className="h-4 w-4" />
                                                </Link>
                                                {showArchived ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRestore(dist.id)}
                                                        className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-lg transition inline-flex items-center gap-1 font-bold text-xs shadow-sm"
                                                        title="Restore Distributor"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        <span>Restore</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        {canManage && (
                                                            <button
                                                                onClick={() => openEditModal(dist)}
                                                                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
                                                                title="Edit Distributor"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => confirmDelete(dist.id, dist.name)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                                                                title="Delete Distributor"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
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
            )}

            {/* ADD / EDIT DISTRIBUTOR MODAL WITH LOGO UPLOAD & REAL-TIME VALIDATION */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Truck className="h-5 w-5 text-emerald-400" />
                                <span>{editingDistributor ? 'Edit Distributor' : 'Add New Distributor'}</span>
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
                            {/* Logo Upload Section */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                                    <ImageIcon className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Distributor Company Logo</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {logo ? (
                                        <div className="relative group">
                                            <img
                                                src={logo}
                                                alt="Logo preview"
                                                className="h-16 w-16 object-contain rounded-xl bg-slate-950 border border-emerald-500/50 p-1 shadow-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setLogo('')}
                                                className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-500 transition shadow"
                                                title="Remove Logo"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 flex items-center justify-center text-slate-500">
                                            <Building2 className="h-6 w-6 opacity-40" />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-1.5">
                                        <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer transition border border-slate-700 shadow-sm">
                                            <Upload className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>Upload Logo (PNG, JPG, WEBP)</span>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-[10px] text-emerald-500 font-medium">✓ Uploads are automatically converted to WEBP format for optimal speed</p>
                                        <input
                                            type="text"
                                            placeholder="Or paste image URL (https://...)"
                                            value={logo}
                                            onChange={(e) => setLogo(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Name of Distributor *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. PEPSI COLA PRODUCTS PHILS"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition ${
                                        duplicateError ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-700 focus:border-emerald-500'
                                    }`}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Number *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. +63 917 123 4567"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address (Optional)</label>
                                    <input
                                        type="email"
                                        placeholder="distributor@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Warehouse Location (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="City or Warehouse Address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="favCheck"
                                    checked={isFavorite}
                                    onChange={(e) => setIsFavorite(e.target.checked)}
                                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
                                />
                                <label htmlFor="favCheck" className="text-xs font-medium text-slate-300 cursor-pointer flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 text-amber-400" />
                                    <span>Mark as Favorite Distributor (Show in Favorites card grid)</span>
                                </label>
                            </div>

                            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !!duplicateError || !name.trim() || !contactNumber.trim()}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg transition border border-emerald-400/30"
                                >
                                    {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    <span>{processing ? 'Saving...' : editingDistributor ? 'Update Distributor' : 'Add Distributor'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DISTRIBUTOR FULL DETAILS MODAL */}
            {viewingDistributor && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
                            <div className="flex items-center space-x-4">
                                <div className="h-20 w-20 rounded-2xl bg-white/5 border border-slate-700/80 p-2 shadow-inner flex items-center justify-center shrink-0">
                                    {viewingDistributor.logo ? (
                                        <img
                                            src={viewingDistributor.logo}
                                            alt={viewingDistributor.name}
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="h-full w-full rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
                                            {viewingDistributor.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold text-white">{viewingDistributor.name}</h2>
                                        {viewingDistributor.is_favorite && (
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                                            {viewingDistributor.products_count || 0} Registered Products
                                        </span>
                                        {viewingDistributor.is_favorite ? (
                                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                                                ★ Pinned Favorite
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={closeViewModal}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Details Body */}
                        <div className="space-y-4 text-sm">
                            {/* Contact Details */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Contact Information</span>
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Phone / Contact:</span>
                                        <a
                                            href={`tel:${viewingDistributor.contact_number}`}
                                            className="font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                                        >
                                            {viewingDistributor.contact_number}
                                        </a>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Email Address:</span>
                                        {viewingDistributor.email ? (
                                            <a
                                                href={`mailto:${viewingDistributor.email}`}
                                                className="font-medium text-slate-200 hover:text-emerald-400 hover:underline truncate max-w-[240px]"
                                            >
                                                {viewingDistributor.email}
                                            </a>
                                        ) : (
                                            <span className="text-slate-500 italic">Not provided</span>
                                        )}
                                    </div>
                                    <div className="flex items-start justify-between gap-4 pt-1.5 border-t border-slate-800/80">
                                        <span className="text-slate-400 shrink-0">Address / Location:</span>
                                        <span className="text-slate-200 text-right">
                                            {viewingDistributor.address || <span className="text-slate-500 italic">No address specified</span>}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Operations & Products Navigation */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Package className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Inventory & Operations</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-2 pt-1">
                                    <Link
                                        href={`/products?distributor_id=${viewingDistributor.id}`}
                                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center justify-center gap-1 text-center"
                                    >
                                        <span>View Products ({viewingDistributor.products_count || 0})</span>
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                    </Link>
                                    <Link
                                        href={`/sales-purchase?distributor_id=${viewingDistributor.id}`}
                                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center justify-center gap-1 text-center"
                                    >
                                        <span>Transactions &rarr;</span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions Footer */}
                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                            <button
                                onClick={() => handleToggleFavoriteFromView(viewingDistributor.id)}
                                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5"
                            >
                                <Star className={`h-4 w-4 ${viewingDistributor.is_favorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                                <span>{viewingDistributor.is_favorite ? 'Favorited' : 'Add to Favorites'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {showArchived ? (
                                    <button
                                        type="button"
                                        onClick={() => handleRestore(viewingDistributor.id)}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        <span>Restore to Directory</span>
                                    </button>
                                ) : (
                                    <>
                                        {canManage && (
                                            <button
                                                onClick={handleEditFromView}
                                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                                            >
                                                <Edit2 className="h-3.5 w-3.5 text-slate-300" />
                                                <span>Edit</span>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={handleDeleteFromView}
                                                className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/60 transition flex items-center gap-1.5"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span>Archive</span>
                                            </button>
                                        )}
                                    </>
                                )}
                                <button
                                    onClick={closeViewModal}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Custom Styled Delete/Archive Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Archive Distributor"
                message={`Are you sure you want to move distributor "${distToDelete?.name}" to the archive? All records will be preserved safely and can be restored anytime.`}
                confirmText="Move to Archive"
                isLoading={isDeleting}
                onConfirm={handleExecuteDelete}
                onCancel={() => {
                    if (!isDeleting) {
                        setDeleteModalOpen(false);
                        setDistToDelete(null);
                    }
                }}
            />
        </MainLayout>
    );
}
