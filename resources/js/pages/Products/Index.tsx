import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ConfirmModal from '@/Components/ConfirmModal';
import { compressImageToWebP, getOptimizedProductImage } from '@/utils/imageProcess';
import {
    Lock,
    Package, 
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
    Archive,
    ChevronLeft,
    ChevronRight,
    CheckSquare,
    Check,
    Search,
    Image as ImageIcon,
    Upload,
    Camera,
    Eye,
    Boxes,
    Ruler,
    Layers,
    Sparkles,
    RefreshCw
} from 'lucide-react';

/**
 * SmartProductImage Component
 * Automatically detects and eliminates harsh, stark-white rectangular backgrounds in dark mode
 * using client-side edge flood-fill so all product packages float consistently.
 */
function SmartProductImage({ 
    src, 
    alt, 
    className = "" 
}: { 
    src?: string | null; 
    alt: string; 
    className?: string; 
}) {
    const [displaySrc, setDisplaySrc] = useState<string>(src || '');

    useEffect(() => {
        if (!src) {
            setDisplaySrc('');
            return;
        }

        let isMounted = true;
        getOptimizedProductImage(src).then((opt) => {
            if (isMounted) setDisplaySrc(opt);
        });

        return () => { isMounted = false; };
    }, [src]);

    if (!displaySrc) return null;

    return (
        <img
            src={displaySrc}
            alt={alt}
            className={className}
            loading="lazy"
        />
    );
}

interface Distributor {
    id: number;
    name: string;
    contact_number?: string;
    logo?: string;
    products_count?: number;
    pivot?: {
        purchase_price?: number;
        default_discount?: number;
        default_dealing_price?: number;
        is_primary?: boolean | number;
    };
}

interface VariantLookupItem {
    id?: number;
    flavor_id?: number;
    variant_type_id?: number;
    name: string;
}

interface Product {
    id: number;
    variant_id?: number;
    distributor_id: number;
    name: string;
    sku?: string;
    category: string;
    brand?: string;
    variant_type?: string;
    flavor_type?: string;
    size_value?: string;
    packaging?: string;
    image?: string | null;
    unit?: { id: number; symbol: string; name: string } | null;
    distributors?: Distributor[];
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
    selectedDistributors?: Distributor[];
    selectedDistributorIds?: number[];
    products: Product[];
    categories?: string[];
    units?: { id: number; name: string; symbol: string }[];
    packagings?: { packaging_id?: number; id?: number; name: string }[];
    variantsList?: VariantLookupItem[];
    flavors?: VariantLookupItem[];
    archivedCount?: number;
    showArchived?: boolean;
    filters?: { search: string; archived?: boolean; distributor_id?: number };
}

export default function ProductsIndex({ 
    distributors = [], 
    selectedDistributor, 
    selectedDistributors = [],
    selectedDistributorIds,
    products = [], 
    categories = [], 
    units = [],
    packagings = [],
    variantsList = [],
    flavors = [],
    archivedCount = 0, 
    showArchived = false, 
    filters 
}: Props) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role || 'guest';
    const canManage = userRole === 'admin' || userRole === 'owner';
    const canArchive = userRole === 'admin' || userRole === 'owner';

    // Active distributor filter from query params (if any)
    const initialDistIds = useMemo(() => {
        if (selectedDistributorIds && selectedDistributorIds.length > 0) {
            return selectedDistributorIds;
        }
        if (selectedDistributors && selectedDistributors.length > 0) {
            return selectedDistributors.map(d => d.id);
        }
        return selectedDistributor ? [selectedDistributor.id] : [];
    }, [selectedDistributorIds, selectedDistributors, selectedDistributor]);

    const [selectedDistIds, setSelectedDistIds] = useState<number[]>(initialDistIds);
    const allVariantsList = useMemo(() => {
        return (variantsList && variantsList.length > 0) ? variantsList : flavors;
    }, [variantsList, flavors]);

    // CAROUSEL & MASTER PRODUCT GROUPING
    const carouselRef = useRef<HTMLDivElement>(null);

    // Group products by Master Name (e.g., 'Gatorade' groups 500mL & 350mL; 'Fresca Tuna' groups Flakes in Oil & Hot & Spicy)
    const allMasterGroups = useMemo(() => {
        const map = new Map<string, { name: string; category: string; variants: any[] }>();
        products.forEach(p => {
            const pVariants = (p as any).variants && (p as any).variants.length > 0
                ? (p as any).variants.map((v: any) => ({
                    ...p,
                    id: v.variant_id || v.id,
                    variant_id: v.variant_id || v.id,
                    variant_name: v.variant_name,
                    master_product_id: p.id,
                    sku: v.sku || p.sku,
                    image: v.image || ((p as any).variants && (p as any).variants.length === 1 ? p.image : null),
                    size_value: v.size_value || p.size_value,
                    packaging: v.packaging || (v.packaging_relation ? v.packaging_relation.name : p.packaging),
                    packaging_id: v.packaging_id,
                    unit: v.unit || p.unit,
                    unit_id: v.unit_id || v.unit?.unit_id || v.unit?.id || (p as any).unit_id,
                    variant_type: v.flavor?.name || (p as any).variant_type || (p as any).flavor_type || '',
                    flavor_type: v.flavor?.name || (p as any).variant_type || (p as any).flavor_type || '',
                    purchase_price: typeof v.purchase_price !== 'undefined' ? v.purchase_price : p.purchase_price,
                    default_discount: typeof v.default_discount !== 'undefined' ? v.default_discount : p.default_discount,
                    default_dealing_price: typeof v.default_dealing_price !== 'undefined' ? v.default_dealing_price : p.default_dealing_price,
                    distributors: (v.distributors && v.distributors.length > 0)
                        ? v.distributors
                        : (p.distributors ? p.distributors.filter((d: any) => d.pivot?.variant_id === v.variant_id) : []),
                }))
                : [{
                    ...p,
                    master_product_id: p.id,
                }];

            const existing = map.get(p.name);
            if (existing) {
                existing.variants.push(...pVariants);
            } else {
                map.set(p.name, {
                    name: p.name,
                    category: p.category,
                    variants: pVariants,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    // REAL-TIME SEARCH STATE & ACTIVE MASTER SELECTION PERSISTENCE
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedMasterName, setSelectedMasterName] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const p = params.get('product') || params.get('search');
            if (p) return p;
            try {
                const saved = sessionStorage.getItem('winzelle_active_product_master');
                if (saved) return saved;
            } catch {}
        }
        return '';
    });

    // Filtered Master Groups matching search query (always browsing, no idle blank screen)
    const matchingGroups = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            return allMasterGroups;
        }
        return allMasterGroups.filter(g => {
            const matchName = g.name.toLowerCase().includes(q);
            const matchCategory = g.category ? g.category.toLowerCase().includes(q) : false;
            const matchVariant = g.variants.some(v => 
                (v.sku && v.sku.toLowerCase().includes(q)) ||
                (v.flavor_type && v.flavor_type.toLowerCase().includes(q)) ||
                (v.packaging && v.packaging.toLowerCase().includes(q)) ||
                (v.size_value && v.size_value.toLowerCase().includes(q))
            );
            return matchName || matchCategory || matchVariant;
        });
    }, [allMasterGroups, searchQuery]);

    // Currently active master group
    const activeMasterGroup = useMemo(() => {
        if (matchingGroups.length === 0) return null;
        if (selectedMasterName) {
            const found = matchingGroups.find(g => g.name.toLowerCase() === selectedMasterName.toLowerCase());
            if (found) return found;
        }
        return matchingGroups[0];
    }, [matchingGroups, selectedMasterName]);

    // Keep selectedMasterName synced and persisted
    useEffect(() => {
        if (activeMasterGroup && activeMasterGroup.name !== selectedMasterName) {
            setSelectedMasterName(activeMasterGroup.name);
            try {
                sessionStorage.setItem('winzelle_active_product_master', activeMasterGroup.name);
            } catch {}
        }
    }, [activeMasterGroup]);

    const handleSelectMaster = (name: string) => {
        setSelectedMasterName(name);
        try {
            sessionStorage.setItem('winzelle_active_product_master', name);
            if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('product', name);
                window.history.replaceState({}, '', url.toString());
            }
        } catch {}
    };

    // Flat list of matching products for count stats
    const matchingProducts = useMemo(() => {
        return matchingGroups.flatMap(g => g.variants);
    }, [matchingGroups]);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const offset = direction === 'left' ? -300 : 300;
            carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    // Keep active carousel pill in view without shifting page scroll
    useEffect(() => {
        if (selectedMasterName && carouselRef.current) {
            const activePill = carouselRef.current.querySelector('[data-active="true"]') as HTMLElement;
            if (activePill) {
                activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedMasterName]);



    interface EditDistributorConfig {
        distributor_id: number;
        purchase_price: string;
        default_discount: string;
        default_dealing_price: string;
        is_primary: boolean;
    }

    // Edit Product Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editSizeValue, setEditSizeValue] = useState('');
    const [editImage, setEditImage] = useState('');
    const [editDistributors, setEditDistributors] = useState<EditDistributorConfig[]>([]);
    const [isAddingDist, setIsAddingDist] = useState(false);
    const [addDistSearch, setAddDistSearch] = useState('');
    const [changingDistId, setChangingDistId] = useState<number | null>(null);
    const [changeDistSearch, setChangeDistSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

    // Primary distributor and available distributors for adding or changing
    const primaryEditDist = useMemo(() => {
        return editDistributors.find(d => d.is_primary) || editDistributors[0] || null;
    }, [editDistributors]);

    const effectiveDistributor = useMemo(() => {
        if (!primaryEditDist) return null;
        return distributors.find(d => Number(d.id || (d as any).distributor_id) === Number(primaryEditDist.distributor_id)) || null;
    }, [distributors, primaryEditDist]);

    const availableDistributorsToAdd = useMemo(() => {
        const existingIds = new Set(editDistributors.map(d => Number(d.distributor_id)));
        const unselected = distributors.filter(d => !existingIds.has(Number(d.id || (d as any).distributor_id)));
        if (!addDistSearch.trim()) return unselected;
        const q = addDistSearch.toLowerCase();
        return unselected.filter(d => d.name.toLowerCase().includes(q));
    }, [distributors, editDistributors, addDistSearch]);

    const availableDistributorsToChange = useMemo(() => {
        const existingIds = new Set(editDistributors.filter(d => Number(d.distributor_id) !== Number(changingDistId)).map(d => Number(d.distributor_id)));
        const unselected = distributors.filter(d => !existingIds.has(Number(d.id || (d as any).distributor_id)));
        if (!changeDistSearch.trim()) return unselected;
        const q = changeDistSearch.toLowerCase();
        return unselected.filter(d => d.name.toLowerCase().includes(q));
    }, [distributors, editDistributors, changingDistId, changeDistSearch]);

    const handleAddDistributor = (distId: number) => {
        setEditDistributors(prev => [
            ...prev,
            {
                distributor_id: Number(distId),
                purchase_price: '',
                default_discount: '',
                default_dealing_price: '0.00',
                is_primary: prev.length === 0,
            }
        ]);
        setIsAddingDist(false);
        setAddDistSearch('');
    };

    const handleRemoveDistributor = (distId: number) => {
        setEditDistributors(prev => {
            const filtered = prev.filter(d => Number(d.distributor_id) !== Number(distId));
            if (filtered.length > 0 && !filtered.some(d => d.is_primary)) {
                filtered[0].is_primary = true;
            }
            return filtered;
        });
    };

    const handleSetPrimaryDist = (distId: number) => {
        setEditDistributors(prev => prev.map(d => ({
            ...d,
            is_primary: Number(d.distributor_id) === Number(distId),
        })));
    };

    const handleChangeDistributor = (oldDistId: number, newDistId: number) => {
        setEditDistributors(prev => prev.map(d => {
            if (Number(d.distributor_id) === Number(oldDistId)) {
                return { ...d, distributor_id: Number(newDistId) };
            }
            return d;
        }));
        setChangingDistId(null);
        setChangeDistSearch('');
    };

    const handleEditDistPriceChange = (distId: number, field: 'purchase_price' | 'default_discount', value: string) => {
        setEditDistributors(prev => prev.map(d => {
            if (Number(d.distributor_id) !== Number(distId)) return d;
            const updated = { ...d, [field]: value };
            const c = parseFloat(field === 'purchase_price' ? value : updated.purchase_price) || 0;
            const disc = parseFloat(field === 'default_discount' ? value : updated.default_discount) || 0;
            updated.default_dealing_price = (c + disc).toFixed(2).replace(/\.00$/, '');
            return updated;
        }));
    };

    // Category Autocomplete + Custom (Real-time DB search, NO dropdown)
    const [editCategory, setEditCategory] = useState('');
    const [isCategoryPicking, setIsCategoryPicking] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return categories;
        const q = categorySearch.toLowerCase();
        return categories.filter(c => typeof c === 'string' && c.toLowerCase().includes(q));
    }, [categories, categorySearch]);

    // Measurement Unit Autocomplete + Custom (Real-time DB search, NO dropdown)
    const [editUnitId, setEditUnitId] = useState<number | ''>('');
    const [isUnitPicking, setIsUnitPicking] = useState(false);
    const [unitSearch, setUnitSearch] = useState('');
    const [isCustomUnit, setIsCustomUnit] = useState(false);
    const [customUnitSymbol, setCustomUnitSymbol] = useState('');
    const [customUnitName, setCustomUnitName] = useState('');
    const filteredUnits = useMemo(() => {
        if (!unitSearch.trim()) return units;
        const q = unitSearch.toLowerCase();
        return units.filter(u => u.name.toLowerCase().includes(q) || u.symbol.toLowerCase().includes(q));
    }, [units, unitSearch]);

    // Packaging Autocomplete + Custom (Real-time DB search, NO dropdown)
    const [editPackagingId, setEditPackagingId] = useState<number | ''>('');
    const [editPackaging, setEditPackaging] = useState('');
    const [isPackagingPicking, setIsPackagingPicking] = useState(false);
    const [packagingSearch, setPackagingSearch] = useState('');
    const [isCustomPackaging, setIsCustomPackaging] = useState(false);
    const [customPackaging, setCustomPackaging] = useState('');
    const filteredPackagings = useMemo(() => {
        if (!packagingSearch.trim()) return packagings;
        const q = packagingSearch.toLowerCase();
        return packagings.filter(p => p.name.toLowerCase().includes(q));
    }, [packagings, packagingSearch]);

    // Variant Autocomplete + Custom (Renamed from Flavor, Real-time DB search, NO dropdown)
    const [editVariantType, setEditVariantType] = useState('');
    const [isVariantPicking, setIsVariantPicking] = useState(false);
    const [variantSearch, setVariantSearch] = useState('');
    const [isCustomVariant, setIsCustomVariant] = useState(false);
    const [customVariant, setCustomVariant] = useState('');
    const filteredVariants = useMemo(() => {
        if (!variantSearch.trim()) return allVariantsList;
        const q = variantSearch.toLowerCase();
        return allVariantsList.filter(v => v.name.toLowerCase().includes(q));
    }, [allVariantsList, variantSearch]);
    // Effective values for dynamically adaptive fixed-format SKU

    const effectiveUnit = useMemo(() => {
        if (!editUnitId) return null;
        return units.find(unit => (unit.id === editUnitId || (unit as any).unit_id === editUnitId)) || null;
    }, [units, editUnitId]);

    const effectiveUnitSymbol = useMemo(() => {
        if (isCustomUnit) return customUnitSymbol.trim();
        return effectiveUnit?.symbol || '';
    }, [isCustomUnit, customUnitSymbol, effectiveUnit]);

    const effectivePackagingName = useMemo(() => {
        if (isCustomPackaging) return customPackaging.trim();
        if (editPackagingId) {
            const p = packagings.find(pk => (pk.packaging_id === editPackagingId || (pk as any).id === editPackagingId));
            if (p) return p.name;
        }
        return editPackaging || '';
    }, [isCustomPackaging, customPackaging, editPackagingId, editPackaging, packagings]);

    const effectiveVariantName = useMemo(() => {
        if (isCustomVariant) return customVariant.trim();
        return editVariantType.trim() || 'REG';
    }, [isCustomVariant, customVariant, editVariantType]);

    // Live Dynamically Adaptive Fixed-Format SKU:
    // SKU CANNOT BE EDITED, BUT IT CAN ADAPT TO CHANGES BECAUSE IT HAS ITS OWN FIXED FORMAT:
    // WNZ-{BRAND_3}-{VARIANT_3}-{SIZE_VALUE}{UNIT_SYMBOL}-{PACK_3}
    const adaptedSku = useMemo(() => {
        const brandStr = editingProduct?.brand || effectiveDistributor?.name || editName || 'WNZ';
        const brandCode = brandStr.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'WNZ';
        const variantCode = (effectiveVariantName || 'REG').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'REG';
        const sizeClean = (editSizeValue || '').replace(/[^A-Za-z0-9]/g, '');
        const unitClean = (effectiveUnitSymbol || '').replace(/[^A-Za-z0-9]/g, '');
        const sizeCode = (sizeClean + unitClean).toUpperCase() || 'STD';
        const packCode = (effectivePackagingName || 'EA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'EA';

        return 'WNZ-' + brandCode + '-' + variantCode + '-' + sizeCode + '-' + packCode;
    }, [editingProduct, effectiveDistributor, editName, effectiveVariantName, editSizeValue, effectiveUnitSymbol, effectivePackagingName]);

    // High-Resolution Picture Preview Modal
    const [viewingProductImage, setViewingProductImage] = useState<any | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Delete / Archive confirmation modal
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [productToArchive, setProductToArchive] = useState<Product | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);

    const formatCurrency = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        if (isNaN(num)) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(num);
    };


    // Real-Time Search input handler
    const handleSearchInput = (val: string) => {
        setSearchQuery(val);
    };

    // Execute Search Submit (also syncs with URL)
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get('/products', { 
                search: searchQuery.trim(),
                distributor_ids: selectedDistIds.length > 0 ? selectedDistIds.join(',') : undefined,
                archived: showArchived ? 1 : undefined
            }, { preserveState: true, preserveScroll: true, replace: true });
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    // Direct Image Upload for Product Card / Modal (with automatic dark-mode transparency)
    const handleImageProcessAndUpload = async (product: any, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingImage(true);
        try {
            const webpUri = await compressImageToWebP(file);
            const prodId = product.master_product_id || product.product_id || product.id;
            const variantId = product.variant_id || product.id;
            const masterName = product.name || (activeMasterGroup ? activeMasterGroup.name : '');
            if (masterName) {
                setSelectedMasterName(masterName);
                try {
                    sessionStorage.setItem('winzelle_active_product_master', masterName);
                } catch {}
            }
            router.put(`/products/${prodId}`, {
                image: webpUri,
                variant_id: variantId
            }, {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setIsUploadingImage(false);
                    setTimeout(() => {
                        const el = document.getElementById(`variant-card-${variantId}`);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }, 150);
                },
            });
        } catch (err: any) {
            setIsUploadingImage(false);
            alert(err.message || 'Image processing failed.');
        }
    };

    // Open Edit Modal
    const openEditModal = (p: Product) => {
        setEditingProduct(p);
        setEditingVariantId(p.variant_id || (p as any).id || null);
        setEditName(p.name);
        setEditCategory(p.category || (categories[0] || 'General'));
        const vName = p.variant_type || p.flavor_type || 'Regular';
        setEditVariantType(vName);
        setEditSizeValue(p.size_value || '');
        const matchedUnitId = (p as any).unit_id || (p.unit as any)?.unit_id || p.unit?.id || '';
        setEditUnitId(matchedUnitId);
        setEditPackagingId((p as any).packaging_id || '');
        setEditPackaging(p.packaging || '');
        setEditImage(p.image || '');

        // Populate editDistributors from p.distributors
        const linked = (p.distributors || []).filter(Boolean);
        if (linked.length > 0) {
            const initialDists: EditDistributorConfig[] = linked.map((d, index) => {
                const pv = (d as any).pivot;
                const cost = pv?.purchase_price ?? p.purchase_price ?? 0;
                const disc = pv?.default_discount ?? p.default_discount ?? 0;
                const deal = pv?.default_dealing_price ?? p.default_dealing_price ?? (cost + disc);
                const isPrim = pv?.is_primary !== undefined ? Boolean(pv.is_primary) : (index === 0);
                return {
                    distributor_id: d.id || (d as any).distributor_id,
                    purchase_price: cost ? cost.toString() : '0',
                    default_discount: disc ? disc.toString() : '0',
                    default_dealing_price: deal ? deal.toString() : '0',
                    is_primary: isPrim,
                };
            });
            if (!initialDists.some(d => d.is_primary) && initialDists.length > 0) {
                initialDists[0].is_primary = true;
            }
            setEditDistributors(initialDists);
        } else {
            setEditDistributors([]);
        }

        setIsAddingDist(false);
        setAddDistSearch('');
        setChangingDistId(null);
        setChangeDistSearch('');

        // Reset all picking and custom autocomplete states
        setIsCategoryPicking(false);
        setCategorySearch('');
        setIsCustomCategory(false);
        setCustomCategory('');
        setIsUnitPicking(false);
        setUnitSearch('');
        setIsCustomUnit(false);
        setCustomUnitSymbol('');
        setCustomUnitName('');
        setIsPackagingPicking(false);
        setPackagingSearch('');
        setIsCustomPackaging(false);
        setCustomPackaging('');
        setIsVariantPicking(false);
        setVariantSearch('');
        setIsCustomVariant(false);
        setCustomVariant('');

        setEditErrorMsg(null);
        setIsEditModalOpen(true);
    };

    const handleSaveEditProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setEditErrorMsg(null);
        setIsSaving(true);

        const effCategory = isCustomCategory ? customCategory.trim() : editCategory;
        const effVariant = isCustomVariant ? customVariant.trim() : editVariantType.trim();

        const primary = editDistributors.find(d => d.is_primary) || editDistributors[0];
        const primaryCost = primary ? (parseFloat(primary.purchase_price) || 0) : 0;
        const primaryDisc = primary ? (parseFloat(primary.default_discount) || 0) : 0;
        const primaryDeal = primary ? (parseFloat(primary.default_dealing_price) || (primaryCost + primaryDisc)) : 0;

        const payload = {
            name: editName.trim(),
            sku: adaptedSku,
            category: effCategory || 'General',
            variant_type: effVariant || undefined,
            flavor_type: effVariant || undefined,
            custom_variant: isCustomVariant ? customVariant.trim() : undefined,
            size_value: editSizeValue.trim() || undefined,
            unit_id: (!isCustomUnit && editUnitId) ? Number(editUnitId) : undefined,
            custom_unit_symbol: isCustomUnit ? customUnitSymbol.trim() : undefined,
            custom_unit_name: isCustomUnit ? customUnitName.trim() : undefined,
            packaging_id: (!isCustomPackaging && editPackagingId) ? Number(editPackagingId) : undefined,
            packaging: effectivePackagingName || undefined,
            custom_packaging: isCustomPackaging ? customPackaging.trim() : undefined,
            variant_id: editingVariantId || undefined,
            image: editImage.trim() || null,
            distributor_id: primary?.distributor_id || null,
            purchase_price: primaryCost,
            default_discount: primaryDisc,
            default_dealing_price: primaryDeal,
            distributors: editDistributors.map(d => {
                const c = parseFloat(d.purchase_price) || 0;
                const disc = parseFloat(d.default_discount) || 0;
                return {
                    distributor_id: d.distributor_id,
                    purchase_price: c,
                    default_discount: disc,
                    default_dealing_price: parseFloat(d.default_dealing_price) || (c + disc),
                    is_primary: d.is_primary,
                };
            }),
        };

        const targetVariantId = editingVariantId;
        const targetMasterName = editName.trim() || editingProduct.name;
        const targetMasterId = (editingProduct as any).master_product_id || editingProduct.id;

        router.put(`/products/${targetMasterId}`, payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                if (targetMasterName) {
                    setSelectedMasterName(targetMasterName);
                    try {
                        sessionStorage.setItem('winzelle_active_product_master', targetMasterName);
                        if (typeof window !== 'undefined') {
                            const url = new URL(window.location.href);
                            url.searchParams.set('product', targetMasterName);
                            window.history.replaceState({}, '', url.toString());
                        }
                    } catch {}
                }
                setTimeout(() => {
                    if (targetVariantId) {
                        const el = document.getElementById(`variant-card-${targetVariantId}`);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                }, 150);
            },
            onError: (errs) => {
                const first = Object.values(errs)[0];
                setEditErrorMsg(typeof first === 'string' ? first : 'Validation error.');
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const handleArchiveConfirm = () => {
        if (!productToArchive) return;
        setIsArchiving(true);
        const targetId = (productToArchive as any).master_product_id || productToArchive.id;
        router.delete(`/products/${targetId}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setConfirmModalOpen(false);
                setProductToArchive(null);
            },
            onFinish: () => setIsArchiving(false),
        });
    };

    const handleRestore = (productId: number) => {
        router.post(`/products/${productId}/restore`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <MainLayout title="Product Management">
            <Head title="Product Showcase & Management | Winzelle Inventory" />

            {/* TOP HEADER & ACTION BAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
                        <Package className="h-6 w-6 text-emerald-400" />
                        <span>Products Showcase</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Search-first catalog view: Real-time search by product name or SKU code without visual clutter.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Archive Filter Toggle */}
                    <button
                        type="button"
                        onClick={() => router.get('/products', { 
                            archived: showArchived ? undefined : 1,
                            distributor_ids: selectedDistIds.length > 0 ? selectedDistIds.join(',') : undefined,
                            search: searchQuery || undefined
                        }, { preserveState: false, preserveScroll: true })}
                        className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                            showArchived 
                                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                    >
                        <Archive className="h-4 w-4" />
                        <span>{showArchived ? 'Active Products' : `Archive (${archivedCount})`}</span>
                    </button>

                    {/* Dedicated Independent Creation Page Button */}
                    {canManage && !showArchived && (
                        <Link
                            href="/products/create"
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition border border-emerald-400/30 active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Create Master Product</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Active Distributor Filter Indicator (if filtered via query params) */}
            {selectedDistIds.length > 0 && (
                <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xl">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[11px]">Filtered by Distributor:</span>
                            <span className="font-bold text-white">
                                {selectedDistributors && selectedDistributors.length > 0
                                    ? selectedDistributors.map(d => d.name).join(', ')
                                    : `${selectedDistIds.length} Distributor(s) Active`}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href="/distributors"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                        >
                            Distributors Directory &rarr;
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.get('/products', { archived: showArchived ? 1 : undefined })}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition flex items-center gap-1.5"
                        >
                            <X className="h-3.5 w-3.5" />
                            <span>Show All Master Products</span>
                        </button>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* REAL-TIME SEARCH BAR (Matching User Sketch: [search input] [search button]) */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 shadow-xl">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                        <input
                            type="text"
                            placeholder="Type product name (e.g. Yakult, Bear Brand) or SKU code..."
                            value={searchQuery}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner font-sans font-medium"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                title="Clear Search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
                    >
                        <Search className="h-4 w-4" />
                        <span>Search</span>
                    </button>

                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition shrink-0"
                        >
                            Reset
                        </button>
                    )}
                </form>

                {/* Real-time search status indicator */}
                {searchQuery.trim() && (
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                        <span>
                            Real-time matches for <strong className="text-emerald-400">"{searchQuery}"</strong>: <span className="font-bold text-white">{matchingProducts.length} product(s)</span>
                        </span>
                        {matchingProducts.length > 0 && (
                            <span className="text-emerald-400 font-mono">Live Sync Active</span>
                        )}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* PRODUCT SHOWCASE: ALWAYS ACCESSIBLE, REAL-TIME FILTERED   */}
            {/* ======================================================== */}
            <div className="space-y-6">

                {matchingProducts.length === 0 ? (
                    /* NO RESULTS MATCHED SEARCH */
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-xl">
                        <div className="h-16 w-16 mx-auto mb-4 rounded-3xl bg-slate-850 border border-slate-700 flex items-center justify-center text-slate-500">
                            <Package className="h-8 w-8" />
                        </div>
                        <h3 className="text-base font-bold text-white">No Product Found</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
                            No product matched "{searchQuery}". Try typing another product name, brand, or SKU code.
                        </p>
                        {canManage && (
                            <Link
                                href="/products/create"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-950/50"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create Master Product</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    /* MASTER PRODUCT GROUP WITH STACKED VARIANT CARDS */
                    <div className="space-y-6">
                        {/* -------------------------------------------------- */}
                        {/* TOP HORIZONTAL CAROUSEL OF PRODUCTS                */}
                        {/* Scrollable pill bar with < and > buttons           */}
                        {/* -------------------------------------------------- */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-xl flex items-center gap-2">
                            {/* Scroll Left Button */}
                            <button
                                type="button"
                                onClick={() => scrollCarousel('left')}
                                className="h-9 w-9 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition active:scale-95"
                                title="Scroll left"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Carousel Scroll Container */}
                            <div 
                                ref={carouselRef}
                                className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {(searchQuery.trim() ? matchingGroups : allMasterGroups).map(g => {
                                    const isSelected = activeMasterGroup?.name === g.name;
                                    return (
                                        <button
                                            key={g.name}
                                            type="button"
                                            data-active={isSelected ? 'true' : 'false'}
                                            onClick={() => handleSelectMaster(g.name)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400'
                                                    : 'bg-slate-950 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
                                            }`}
                                        >
                                            <span>{g.name}</span>
                                            {g.variants.length > 1 && (
                                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                    {g.variants.length}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Scroll Right Button */}
                            <button
                                type="button"
                                onClick={() => scrollCarousel('right')}
                                className="h-9 w-9 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition active:scale-95"
                                title="Scroll right"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* -------------------------------------------------- */}
                        {/* STACKED VARIANT CARDS UNDER SELECTED MASTER        */}
                        {/* -------------------------------------------------- */}
                        {activeMasterGroup && (
                            <div className="space-y-6">
                                {activeMasterGroup.variants.map((p) => {
                                    const rawDistributors = p.distributors && p.distributors.length > 0 
                                        ? p.distributors 
                                        : (p.distributor_id ? distributors.filter(d => d.id === p.distributor_id) : []);

                                    // Filter strictly by this variant's ID if pivot has variant_id
                                    const linkedDistributors = rawDistributors.filter((d: any) => 
                                        !d.pivot?.variant_id || d.pivot?.variant_id === p.id || d.pivot?.variant_id === (p as any).variant_id
                                    );

                                    const primaryDist = linkedDistributors.find((d: any) => (d as any).pivot?.is_primary) || linkedDistributors[0] || null;

                                    const measurementStr = p.size_value 
                                        ? `${p.size_value}${p.unit?.symbol || ''}`
                                        : (p.unit?.symbol || 'Standard');

                                    const variantBadgeText = p.flavor_type && p.flavor_type !== 'Regular'
                                        ? `${p.flavor_type} • ${measurementStr}`
                                        : measurementStr;

                                    return (
                                        <div key={p.id} id={`variant-card-${p.variant_id || p.id}`} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition hover:border-slate-700/80">
                                            <div className="flex flex-col md:flex-row items-stretch gap-8">
                                                
                                                {/* LEFT: PRODUCT PICTURE CARD WITH STUDIO VIGNETTE & SMART DARK MODE */}
                                                <div className="w-full md:w-80 shrink-0">
                                                    <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-900/90 border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner group">
                                                        
                                                        {/* Soft radial studio lighting vignette for dark mode consistency */}
                                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none" />

                                                        {p.image ? (
                                                            <SmartProductImage 
                                                                src={p.image} 
                                                                alt={p.name} 
                                                                className="w-full h-full object-contain rounded-xl transition duration-300 group-hover:scale-105 drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] relative z-10"
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10">
                                                                <div className="h-24 w-24 rounded-3xl bg-slate-850 border border-slate-700/80 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition">
                                                                    <Package className="h-12 w-12 text-emerald-400 stroke-[1.5]" />
                                                                </div>
                                                                <div>
                                                                    <span className="text-sm font-black text-white tracking-wider uppercase block">
                                                                        {p.name}
                                                                    </span>
                                                                    <span className="text-[11px] text-emerald-400 font-mono font-bold mt-1 inline-block bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                                                        {variantBadgeText} {p.packaging ? `(${p.packaging})` : ''}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Picture Hover Action Overlay */}
                                                        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                                                            {p.image ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setViewingProductImage(p)}
                                                                        className="w-40 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-600 shadow-xl active:scale-95"
                                                                    >
                                                                        <Eye className="h-4 w-4 text-emerald-400" />
                                                                        <span>View Picture</span>
                                                                    </button>

                                                                    {canManage && (
                                                                        <label className="w-40 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95">
                                                                            <Camera className="h-4 w-4" />
                                                                            <span>Change Picture</span>
                                                                            <input 
                                                                                type="file" 
                                                                                accept="image/*" 
                                                                                className="hidden" 
                                                                                onChange={(e) => handleImageProcessAndUpload(p, e)} 
                                                                            />
                                                                        </label>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                canManage && (
                                                                    <label className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xl cursor-pointer active:scale-95">
                                                                        <Upload className="h-4 w-4" />
                                                                        <span>Upload Picture</span>
                                                                        <input 
                                                                            type="file" 
                                                                            accept="image/*" 
                                                                            className="hidden" 
                                                                            onChange={(e) => handleImageProcessAndUpload(p, e)} 
                                                                        />
                                                                    </label>
                                                                )
                                                            )}
                                                        </div>

                                                        {/* Measurement Tag bottom right */}
                                                        <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-slate-300 pointer-events-none">
                                                            {p.size_value ? `${p.size_value}${p.unit?.symbol || ''}` : (p.flavor_type || 'Standard')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* RIGHT: PRODUCT DETAILS */}
                                                <div className="flex-1 flex flex-col justify-between">
                                                    
                                                    <div>
                                                        {/* PRODUCT NAME (Large, bold title with optional variant highlight) */}
                                                        <div className="flex items-start justify-between gap-4 mb-4">
                                                            <div>
                                                                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                                                                    {p.name}
                                                                </h2>
                                                                {p.flavor_type && p.flavor_type !== 'Regular' && (
                                                                    <span className="text-sm font-semibold text-emerald-400 mt-0.5 inline-block">
                                                                        Variant: {p.variant_type || p.flavor_type}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {showArchived && (
                                                                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-bold uppercase shrink-0">
                                                                    Archived
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Details list matching user's drawing */}
                                                        <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-xs">
                                                            
                                                            {/* SKU: */}
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-slate-400 font-semibold w-28 shrink-0">SKU:</span>
                                                                <span className="font-mono font-bold text-emerald-400 text-sm">
                                                                    {p.sku || 'N/A'}
                                                                </span>
                                                            </div>

                                                            {/* Category: */}
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-slate-400 font-semibold w-28 shrink-0">Category:</span>
                                                                <span className="bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-lg border border-slate-700 font-medium">
                                                                    {p.category}
                                                                </span>
                                                            </div>

                                                            {/* Measurement: */}
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-slate-400 font-semibold w-28 shrink-0">Measurement:</span>
                                                                <span className="font-mono font-bold text-emerald-300">
                                                                    {measurementStr} {p.packaging ? `(${p.packaging})` : ''}
                                                                </span>
                                                            </div>

                                                            {/* DISTRIBUTOR PRICING BREAKDOWN (Divided per distributor when multiple exist) */}
                                                            {linkedDistributors.length > 1 ? (
                                                                <div className="pt-2">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                                                                            Divided Pricing by Distributor ({linkedDistributors.length} Distributors):
                                                                        </span>
                                                                        <span className="text-[10px] text-emerald-400 font-medium">Distinct supplier costs</span>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {linkedDistributors.map((d: any) => {
                                                                            const pv = (d as any).pivot;
                                                                            const cost = pv?.purchase_price ?? p.purchase_price;
                                                                            const disc = pv?.default_discount ?? p.default_discount;
                                                                            const deal = pv?.default_dealing_price ?? p.default_dealing_price;
                                                                            const isPrimary = pv?.is_primary || d.id === primaryDist?.id;

                                                                            return (
                                                                                <div 
                                                                                    key={d.id} 
                                                                                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                                                                        isPrimary 
                                                                                            ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm' 
                                                                                            : 'bg-slate-950/70 border-slate-800'
                                                                                    }`}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Building2 className={`h-3.5 w-3.5 ${isPrimary ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                                                        <span className="font-bold text-white text-xs">{d.name}</span>
                                                                                        {isPrimary && (
                                                                                            <span className="text-[9px] bg-emerald-800 text-emerald-100 px-1.5 py-0.2 rounded font-bold uppercase">
                                                                                                Primary
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="grid grid-cols-3 gap-3 text-right">
                                                                                        <div>
                                                                                            <span className="block text-[10px] text-slate-400 font-medium">Cost Price</span>
                                                                                            <span className="font-mono font-bold text-slate-200 text-xs">{formatCurrency(cost)}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="block text-[10px] text-slate-400 font-medium">Discount</span>
                                                                                            <span className="font-mono font-bold text-emerald-400 text-xs">{formatCurrency(disc)}</span>
                                                                                        </div>
                                                                                        <div>
                                                                                            <span className="block text-[10px] text-slate-400 font-medium">Dealing Price</span>
                                                                                            <span className="font-mono font-black text-emerald-300 text-xs">{formatCurrency(deal)}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Single Distributor Pricing */}
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-slate-400 font-semibold w-28 shrink-0">Cost price:</span>
                                                                        <span className="font-mono font-bold text-slate-200">
                                                                            {formatCurrency(p.purchase_price)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-slate-400 font-semibold w-28 shrink-0">Discount:</span>
                                                                        <span className="font-mono font-bold text-emerald-400">
                                                                            {formatCurrency(p.default_discount)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <span className="text-slate-400 font-semibold w-28 shrink-0">Dealing Price:</span>
                                                                        <span className="font-mono font-black text-emerald-300 text-base">
                                                                            {formatCurrency(p.default_dealing_price)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-start gap-3 pt-1">
                                                                        <span className="text-slate-400 font-semibold w-28 shrink-0 pt-0.5">Distributor:</span>
                                                                        <div className="flex flex-wrap gap-1.5 flex-1">
                                                                            {linkedDistributors.length > 0 ? (
                                                                                linkedDistributors.map((d: any) => (
                                                                                    <span 
                                                                                        key={d.id} 
                                                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl"
                                                                                    >
                                                                                        <Building2 className="h-3 w-3 text-emerald-400" />
                                                                                        <span>{d.name}</span>
                                                                                        <span className="text-[9px] bg-emerald-800 text-emerald-100 px-1 py-0.2 rounded font-bold">Primary</span>
                                                                                    </span>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-xs text-slate-500 italic">None linked yet</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                        </div>
                                                    </div>

                                                    {/* ACTION BUTTONS */}
                                                    <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                                                        {showArchived ? (
                                                            canManage && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRestore(p.id)}
                                                                    className="px-4 py-2 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                                                                >
                                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                                    <span>Restore Product</span>
                                                                </button>
                                                            )
                                                        ) : (
                                                            <>
                                                                {canManage && (
                                                                    <>
                                                                        <Link
                                                                            href={`/products/create?product=${encodeURIComponent(p.name)}`}
                                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                                                                        >
                                                                            <Plus className="h-3.5 w-3.5" />
                                                                            <span>Add Variant</span>
                                                                        </Link>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openEditModal(p)}
                                                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                                                                        >
                                                                            <Edit2 className="h-3.5 w-3.5 text-emerald-400" />
                                                                            <span>Edit Product</span>
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {/* Archive Button */}
                                                                {canArchive && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setProductToArchive(p);
                                                                            setConfirmModalOpen(true);
                                                                        }}
                                                                        className="px-3.5 py-2 bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                                                                        <span>Archive</span>
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

            </div>



            {/* QUICK EDIT PRODUCT MODAL */}
            {isEditModalOpen && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setIsEditModalOpen(false); }}
                    className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                            <div>
                                <h3 className="text-base font-bold text-white">Edit Product Details</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Real-time database autocomplete, custom measurements & adaptive locked SKU</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {editErrorMsg && (
                            <div className="p-3 mb-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300">
                                {editErrorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSaveEditProduct} className="space-y-4">
                            {/* Product Picture Upload Section */}
                            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                                    <span>Product Picture</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                        {editImage ? (
                                            <>
                                                <SmartProductImage src={editImage} alt="Preview" className="h-full w-full object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setEditImage('')}
                                                    className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                                    title="Remove Picture"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <Package className="h-8 w-8 text-slate-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer border border-slate-600 active:scale-95">
                                            <Upload className="h-3.5 w-3.5 text-emerald-400" />
                                            <span>Upload Picture (PNG, JPG, WEBP)</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={async (e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) {
                                                        try {
                                                            const uri = await compressImageToWebP(f);
                                                            setEditImage(uri);
                                                        } catch (err: any) {
                                                            alert(err.message || 'Image processing error.');
                                                        }
                                                    }
                                                }} 
                                            />
                                        </label>
                                        <p className="text-[11px] text-slate-400">
                                            Recommended: Square or transparent PNG/WEBP under 8MB. Automatically resized and compressed.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 2-Column: Product Name & Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value.toUpperCase())}
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                {/* CATEGORY FIELD */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Category *
                                    </label>
                                    {isCustomCategory ? (
                                        <div className="p-2 bg-slate-950 border border-emerald-500/50 rounded-xl space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="font-bold text-emerald-400">+ New Custom Category</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomCategory(false);
                                                        setCustomCategory('');
                                                    }}
                                                    className="text-slate-400 hover:text-white text-[10px]"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value.toUpperCase())}
                                                placeholder="Type new category..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                autoFocus
                                            />
                                        </div>
                                    ) : !isCategoryPicking ? (
                                        <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
                                                <span className="text-xs font-bold text-white truncate">
                                                    {editCategory || 'Select Category'}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCategoryPicking(true);
                                                    setCategorySearch('');
                                                }}
                                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-slate-900 transition shrink-0"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={categorySearch}
                                                    onChange={(e) => setCategorySearch(e.target.value)}
                                                    placeholder="Real-time category search..."
                                                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsCategoryPicking(false)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-850 shadow-xl">
                                                {filteredCategories.map(cat => (
                                                    <div
                                                        key={cat}
                                                        onClick={() => {
                                                            setEditCategory(cat);
                                                            setIsCategoryPicking(false);
                                                            setIsCustomCategory(false);
                                                        }}
                                                        className={'p-2 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-900 ' + (
                                                            editCategory === cat ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                        )}
                                                    >
                                                        <span>{cat}</span>
                                                        {editCategory === cat && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomCategory(true);
                                                        setCustomCategory(categorySearch.trim().toUpperCase());
                                                        setIsCategoryPicking(false);
                                                    }}
                                                    className="w-full p-2 text-left text-xs font-semibold text-emerald-400 hover:bg-slate-900 flex items-center gap-1.5 transition"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    <span>{categorySearch.trim() ? ('Add Custom "' + categorySearch.trim() + '"') : '+ Add Custom Category...'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subcategory Measurements: Size Value, Measurement Unit, and Packaging */}
                            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                                    <Ruler className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Subcategory Measurements & Packaging</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* SIZE / VALUE */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">Size / Value</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 1.5, 330, 250"
                                            value={editSizeValue}
                                            onChange={(e) => setEditSizeValue(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                                        />
                                    </div>

                                    {/* MEASUREMENT UNIT (Pure Real-Time Autocomplete + Custom Unit, NO dropdown) */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-emerald-400 mb-1">Measurement Unit</label>
                                        {isCustomUnit ? (
                                            <div className="p-2 bg-slate-900 border border-emerald-500/50 rounded-xl space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="font-bold text-emerald-400">+ Custom Unit</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsCustomUnit(false);
                                                            setCustomUnitSymbol('');
                                                            setCustomUnitName('');
                                                        }}
                                                        className="text-slate-400 hover:text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <input
                                                        type="text"
                                                        value={customUnitSymbol}
                                                        onChange={(e) => setCustomUnitSymbol(e.target.value.toUpperCase())}
                                                        placeholder="Symbol (e.g. cL)"
                                                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                                                        autoFocus
                                                    />
                                                    <input
                                                        type="text"
                                                        value={customUnitName}
                                                        onChange={(e) => setCustomUnitName(e.target.value.toUpperCase())}
                                                        placeholder="Name (e.g. Centiliter)"
                                                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                    />
                                                </div>
                                            </div>
                                        ) : !isUnitPicking ? (
                                            <div className="flex items-center justify-between p-2 bg-slate-900 border border-emerald-500/40 rounded-xl">
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    {effectiveUnit ? (
                                                        <>
                                                            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                                                                {effectiveUnit.symbol}
                                                            </span>
                                                            <span className="text-xs text-white truncate">{effectiveUnit.name}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-- No Unit --</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsUnitPicking(true);
                                                        setUnitSearch('');
                                                    }}
                                                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 rounded hover:bg-slate-800 transition shrink-0"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        value={unitSearch}
                                                        onChange={(e) => setUnitSearch(e.target.value)}
                                                        placeholder="Search units..."
                                                        className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg pl-7 pr-6 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsUnitPicking(false)}
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="bg-slate-900 border border-slate-700 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-800 shadow-xl">
                                                    <div
                                                        onClick={() => {
                                                            setEditUnitId('');
                                                            setIsUnitPicking(false);
                                                            setIsCustomUnit(false);
                                                        }}
                                                        className="p-1.5 text-xs text-slate-400 cursor-pointer hover:bg-slate-800"
                                                    >
                                                        -- No Unit --
                                                    </div>
                                                    {filteredUnits.map(u => {
                                                        const uId = (u as any).unit_id || u.id;
                                                        const isSelected = editUnitId === uId;
                                                        return (
                                                            <div
                                                                key={uId}
                                                                onClick={() => {
                                                                    setEditUnitId(uId);
                                                                    setIsUnitPicking(false);
                                                                    setIsCustomUnit(false);
                                                                }}
                                                                className={'p-1.5 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-800 ' + (
                                                                    isSelected ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                                )}
                                                            >
                                                                <span className="font-mono text-emerald-400 font-bold mr-1">[{u.symbol}]</span>
                                                                <span className="truncate flex-1">{u.name}</span>
                                                                {isSelected && <Check className="h-3 w-3 text-emerald-400 shrink-0 ml-1" />}
                                                            </div>
                                                        );
                                                    })}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsCustomUnit(true);
                                                            setCustomUnitSymbol(unitSearch.trim().toUpperCase());
                                                            setIsUnitPicking(false);
                                                        }}
                                                        className="w-full p-1.5 text-left text-[11px] font-semibold text-emerald-400 hover:bg-slate-800 flex items-center gap-1 transition"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        <span>{unitSearch.trim() ? ('Add Custom "' + unitSearch.trim() + '"') : '+ Add Custom Unit...'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* PACKAGING (Pure Real-Time Autocomplete + Custom Packaging, NO dropdown) */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-emerald-400 mb-1">Packaging</label>
                                        {isCustomPackaging ? (
                                            <div className="p-2 bg-slate-900 border border-emerald-500/50 rounded-xl space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="font-bold text-emerald-400">+ Custom Packaging</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsCustomPackaging(false);
                                                            setCustomPackaging('');
                                                        }}
                                                        className="text-slate-400 hover:text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={customPackaging}
                                                    onChange={(e) => setCustomPackaging(e.target.value.toUpperCase())}
                                                    placeholder="e.g. 12-Pack PET, Keg, Box"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                    autoFocus
                                                />
                                            </div>
                                        ) : !isPackagingPicking ? (
                                            <div className="flex items-center justify-between p-2 bg-slate-900 border border-emerald-500/40 rounded-xl">
                                                <span className="text-xs text-white truncate">
                                                    {effectivePackagingName || '-- Select Packaging --'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsPackagingPicking(true);
                                                        setPackagingSearch('');
                                                    }}
                                                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-1.5 py-0.5 rounded hover:bg-slate-800 transition shrink-0"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                <div className="relative">
                                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                                                    <input
                                                        type="text"
                                                        value={packagingSearch}
                                                        onChange={(e) => setPackagingSearch(e.target.value)}
                                                        placeholder="Search packaging..."
                                                        className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg pl-7 pr-6 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsPackagingPicking(false)}
                                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <div className="bg-slate-900 border border-slate-700 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-800 shadow-xl">
                                                    {filteredPackagings.map(pk => {
                                                        const pkId = pk.packaging_id || (pk as any).id;
                                                        const isSelected = editPackagingId === pkId;
                                                        return (
                                                            <div
                                                                key={pkId}
                                                                onClick={() => {
                                                                    setEditPackagingId(pkId);
                                                                    setEditPackaging(pk.name);
                                                                    setIsPackagingPicking(false);
                                                                    setIsCustomPackaging(false);
                                                                }}
                                                                className={'p-1.5 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-800 ' + (
                                                                    isSelected ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                                )}
                                                            >
                                                                <span className="truncate">{pk.name}</span>
                                                                {isSelected && <Check className="h-3 w-3 text-emerald-400 shrink-0 ml-1" />}
                                                            </div>
                                                        );
                                                    })}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsCustomPackaging(true);
                                                            setCustomPackaging(packagingSearch.trim().toUpperCase());
                                                            setIsPackagingPicking(false);
                                                        }}
                                                        className="w-full p-1.5 text-left text-[11px] font-semibold text-emerald-400 hover:bg-slate-800 flex items-center gap-1 transition"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        <span>{packagingSearch.trim() ? ('Add Custom "' + packagingSearch.trim() + '"') : '+ Add Custom Packaging...'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Row: Variant & Adaptive Non-Editable SKU */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                {/* VARIANT FIELD (Renamed from Flavor / Variant, Real-Time Autocomplete, NO native dropdown) */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        Variant *
                                    </label>
                                    {isCustomVariant ? (
                                        <div className="p-2 bg-slate-950 border border-emerald-500/50 rounded-xl space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="font-bold text-emerald-400">+ New Custom Variant</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomVariant(false);
                                                        setCustomVariant('');
                                                    }}
                                                    className="text-slate-400 hover:text-white text-[10px]"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={customVariant}
                                                onChange={(e) => setCustomVariant(e.target.value.toUpperCase())}
                                                placeholder="Type new variant name..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                autoFocus
                                            />
                                        </div>
                                    ) : !isVariantPicking ? (
                                        <div className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-xl">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
                                                <span className="text-xs font-bold text-white truncate">
                                                    {editVariantType || 'Regular'}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsVariantPicking(true);
                                                    setVariantSearch('');
                                                }}
                                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-slate-900 transition shrink-0"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <div className="relative">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                                <input
                                                    type="text"
                                                    value={variantSearch}
                                                    onChange={(e) => setVariantSearch(e.target.value)}
                                                    placeholder="Real-time variant search..."
                                                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                    autoFocus
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setIsVariantPicking(false)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-850 shadow-xl">
                                                {filteredVariants.map(v => (
                                                    <div
                                                        key={v.flavor_id || v.id}
                                                        onClick={() => {
                                                            setEditVariantType(v.name);
                                                            setIsVariantPicking(false);
                                                            setIsCustomVariant(false);
                                                        }}
                                                        className={'p-2 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-900 ' + (
                                                            editVariantType === v.name ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                        )}
                                                    >
                                                        <span>{v.name}</span>
                                                        {editVariantType === v.name && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsCustomVariant(true);
                                                        setCustomVariant(variantSearch.trim().toUpperCase());
                                                        setIsVariantPicking(false);
                                                    }}
                                                    className="w-full p-2 text-left text-xs font-semibold text-emerald-400 hover:bg-slate-900 flex items-center gap-1.5 transition"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    <span>{variantSearch.trim() ? ('Add Custom "' + variantSearch.trim() + '"') : '+ Add Custom Variant...'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SKU CODE */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                                        SKU Code (Auto-Structured)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={adaptedSku}
                                            className="w-full bg-slate-950/90 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold cursor-not-allowed select-all focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* DISTRIBUTORS & PRICING */}
                            <div className="space-y-3 pt-2 border-t border-slate-800">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                                        <span>Distributors & Pricing</span>
                                    </label>
                                    {availableDistributorsToAdd.length > 0 && !isAddingDist && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingDist(true);
                                                setAddDistSearch('');
                                            }}
                                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>{editDistributors.length === 0 ? 'Add Distributor' : 'Add Another Distributor'}</span>
                                        </button>
                                    )}
                                </div>

                                {/* Autocomplete picker to add another distributor */}
                                {isAddingDist && (
                                    <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-emerald-400">Select Distributor to Add</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsAddingDist(false);
                                                    setAddDistSearch('');
                                                }}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                            <input
                                                type="text"
                                                value={addDistSearch}
                                                onChange={(e) => setAddDistSearch(e.target.value)}
                                                placeholder="Search available distributors..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="max-h-36 overflow-y-auto divide-y divide-slate-800 rounded-lg bg-slate-900 border border-slate-800">
                                            {availableDistributorsToAdd.map(d => (
                                                <div
                                                    key={d.id}
                                                    onClick={() => handleAddDistributor(d.id)}
                                                    className="p-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-emerald-300 cursor-pointer flex items-center justify-between transition"
                                                >
                                                    <span>{d.name}</span>
                                                    <Plus className="h-3.5 w-3.5 text-emerald-400" />
                                                </div>
                                            ))}
                                            {availableDistributorsToAdd.length === 0 && (
                                                <div className="p-2 text-[11px] text-slate-500 text-center">
                                                    No more distributors available
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Zero distributors placeholder */}
                                {editDistributors.length === 0 && !isAddingDist && (
                                    <div className="p-5 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2.5">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-300">No distributor linked yet</div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">This product has no assigned distributors. You can link one anytime.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingDist(true);
                                                setAddDistSearch('');
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Add Distributor</span>
                                        </button>
                                    </div>
                                )}

                                {/* List of Distributor Cards */}
                                <div className="space-y-3">
                                    {editDistributors.map((distConfig) => {
                                        const dist = distributors.find(d => Number(d.id || (d as any).distributor_id) === Number(distConfig.distributor_id));
                                        const isChangingThis = Number(changingDistId) === Number(distConfig.distributor_id);

                                        return (
                                            <div 
                                                key={distConfig.distributor_id}
                                                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2.5 transition"
                                            >
                                                {/* Distributor Header row */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
                                                        <span className="text-xs font-bold text-white">
                                                            {dist?.name || `Distributor #${distConfig.distributor_id}`}
                                                        </span>
                                                        {distConfig.is_primary ? (
                                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                                                                Primary
                                                            </span>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetPrimaryDist(distConfig.distributor_id)}
                                                                className="text-[10px] text-slate-400 hover:text-emerald-300 hover:underline transition"
                                                            >
                                                                Set as Primary
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {!isChangingThis && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setChangingDistId(distConfig.distributor_id);
                                                                    setChangeDistSearch('');
                                                                }}
                                                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-slate-900 transition"
                                                            >
                                                                Change
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveDistributor(distConfig.distributor_id)}
                                                            title="Unlink this distributor"
                                                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Autocomplete when changing this distributor */}
                                                {isChangingThis && (
                                                    <div className="p-2.5 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-1.5">
                                                        <div className="flex items-center justify-between text-[11px]">
                                                            <span className="font-bold text-emerald-400">Change Distributor To:</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setChangingDistId(null);
                                                                    setChangeDistSearch('');
                                                                }}
                                                                className="text-slate-400 hover:text-white"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <div className="relative">
                                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                                                            <input
                                                                type="text"
                                                                value={changeDistSearch}
                                                                onChange={(e) => setChangeDistSearch(e.target.value)}
                                                                placeholder="Search distributor to swap..."
                                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="max-h-32 overflow-y-auto divide-y divide-slate-850 rounded-lg bg-slate-950 border border-slate-800">
                                                            {availableDistributorsToChange.map(d => (
                                                                <div
                                                                    key={d.id}
                                                                    onClick={() => handleChangeDistributor(distConfig.distributor_id, d.id)}
                                                                    className="p-2 text-xs text-slate-200 hover:bg-slate-900 hover:text-emerald-300 cursor-pointer flex items-center justify-between transition"
                                                                >
                                                                    <span>{d.name}</span>
                                                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                                                </div>
                                                            ))}
                                                            {availableDistributorsToChange.length === 0 && (
                                                                <div className="p-2 text-[11px] text-slate-500 text-center">
                                                                    No matching distributors
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 3-Column Pricing Grid for this Distributor */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                            Cost Price (₱) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={distConfig.purchase_price}
                                                            onChange={(e) => handleEditDistPriceChange(distConfig.distributor_id, 'purchase_price', e.target.value)}
                                                            required
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                            Discount (₱)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={distConfig.default_discount}
                                                            onChange={(e) => handleEditDistPriceChange(distConfig.distributor_id, 'default_discount', e.target.value)}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                            Dealing Price (₱)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            readOnly
                                                            value={distConfig.default_dealing_price}
                                                            title="Dealing Price is automatically computed (Cost Price + Discount) and cannot be edited"
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold cursor-not-allowed select-all focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
                                >
                                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* HIGH-RES PICTURE VIEWING MODAL */}
            {viewingProductImage && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setViewingProductImage(null); }}
                    className="fixed inset-0 z-[75] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
                >
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button
                            type="button"
                            onClick={() => setViewingProductImage(null)}
                            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="mb-4">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                                {viewingProductImage.sku || 'SKU N/A'}
                            </span>
                            <h3 className="text-xl font-black text-white">
                                {viewingProductImage.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {viewingProductImage.flavor_type ? `${viewingProductImage.flavor_type} • ` : ''}
                                {viewingProductImage.size_value ? `${viewingProductImage.size_value}${viewingProductImage.unit?.symbol || ''} ` : ''}
                                {viewingProductImage.packaging ? `(${viewingProductImage.packaging})` : ''}
                            </p>
                        </div>

                        <div className="w-full h-80 sm:h-96 rounded-2xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-center overflow-hidden mb-5">
                            <SmartProductImage 
                                src={viewingProductImage.image} 
                                alt={viewingProductImage.name} 
                                className="max-h-full max-w-full object-contain drop-shadow-2xl"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            {canManage && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to remove this product picture?')) {
                                            const prodId = viewingProductImage.master_product_id || viewingProductImage.product_id || viewingProductImage.id;
                                            router.put(`/products/${prodId}`, {
                                                image: null,
                                                variant_id: viewingProductImage.variant_id
                                            }, {
                                                preserveScroll: true,
                                                preserveState: true,
                                                onSuccess: () => setViewingProductImage(null)
                                            });
                                        }
                                    }}
                                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 font-semibold"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Remove Picture</span>
                                </button>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                                {canManage && (
                                    <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95">
                                        <Camera className="h-3.5 w-3.5" />
                                        <span>Replace Picture</span>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={(e) => {
                                                handleImageProcessAndUpload(viewingProductImage, e);
                                                setViewingProductImage(null);
                                            }} 
                                        />
                                    </label>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setViewingProductImage(null)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM ARCHIVE MODAL */}
            <ConfirmModal
                isOpen={confirmModalOpen}
                title="Archive Product"
                message={`Are you sure you want to archive "${productToArchive?.name}"? You can restore it later.`}
                confirmText="Archive Product"
                isLoading={isArchiving}
                onConfirm={handleArchiveConfirm}
                onCancel={() => {
                    if (!isArchiving) {
                        setConfirmModalOpen(false);
                        setProductToArchive(null);
                    }
                }}
            />

        </MainLayout>
    );
}
