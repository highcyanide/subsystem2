import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { compressImageToWebP } from '@/utils/imageProcess';
import {
    ArrowLeft,
    Package,
    Building2,
    Ruler,
    Boxes,
    Sparkles,
    Check,
    AlertCircle,
    ChevronRight,
    Loader2,
    Upload,
    Trash2,
    Search,
    CheckCircle2,
    Plus,
    X,
    Lock
} from 'lucide-react';

interface Distributor {
    id: number;
    name: string;
    contact_number?: string;
    logo?: string;
}

interface Unit {
    id: number;
    name: string;
    symbol: string;
    category: string;
}

interface VariantItem {
    flavor_id?: number;
    variant_type_id?: number;
    id?: number;
    name: string;
}

interface PackagingItem {
    packaging_id: number;
    name: string;
}

interface Props {
    distributors: Distributor[];
    categories: string[];
    units: Unit[];
    packagings?: PackagingItem[];
    variantsList?: VariantItem[];
    flavors?: VariantItem[];
    existingProducts?: any[];
}

interface DistributorConfig {
    distributor_id: number;
    purchase_price: number | '';
    default_discount: number | '';
    default_dealing_price: number | '';
    is_primary: boolean;
}

export default function ProductCreate({
    distributors = [],
    categories = [],
    units = [],
    packagings = [],
    variantsList,
    flavors = [],
    existingProducts = []
}: Props) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const isChecker = user?.role === 'checker';

    // Step state: 1. Master Details, 2. Measurement, 3. Opening Stock, 4. Distributors (Optional)
    const [currentStep, setCurrentStep] = useState<number>(1);

    // Form state
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');

    // --- EXISTING MASTER PRODUCT DETECTION (Adding variant to existing master) ---
    const [matchedMasterProduct, setMatchedMasterProduct] = useState<any>(null);
    const [isExistingProduct, setIsExistingProduct] = useState(false);

    const applyExistingMaster = (master: any) => {
        setName(master.name);
        setIsExistingProduct(true);
        setMatchedMasterProduct(master);
        const catName = master.categoryRelation?.name || master.category;
        if (catName) {
            setSelectedCategory(catName);
        }
        if (master.image) {
            setImage(master.image);
        }
        if (master.description) {
            setDescription(master.description);
        }
        setSelectedVariant(null);
        setIsVariantPicking(true);
    };

    // Auto-detect product from URL query params (e.g. /products/create?product=CHARMEE)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const queryProd = params.get('product') || params.get('master') || params.get('name');
            if (queryProd && existingProducts.length > 0) {
                const match = existingProducts.find(
                    p => p.name.trim().toLowerCase() === queryProd.trim().toLowerCase()
                );
                if (match) {
                    applyExistingMaster(match);
                } else {
                    setName(queryProd.toUpperCase());
                }
            }
        }
    }, [existingProducts]);

    const matchingExistingProducts = useMemo(() => {
        if (!name.trim() || isExistingProduct) return [];
        const q = name.trim().toLowerCase();
        return existingProducts.filter(p => p.name.toLowerCase().includes(q));
    }, [name, existingProducts, isExistingProduct]);

    // String similarity algorithm (Levenshtein + token overlap)
    const [dismissedSuggestion, setDismissedSuggestion] = useState<string | null>(null);

    const suggestedSimilarProduct = useMemo(() => {
        if (!name.trim() || isExistingProduct || name.trim().length < 3) return null;
        const inputNorm = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        let bestMatch: any = null;
        let highestScore = 0;

        for (const p of existingProducts) {
            if (dismissedSuggestion && dismissedSuggestion.toLowerCase() === p.name.toLowerCase()) {
                continue;
            }
            const pNorm = p.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (pNorm === inputNorm) {
                return p;
            }

            // Substring or inclusion check
            if (pNorm.includes(inputNorm) || inputNorm.includes(pNorm)) {
                const lenRatio = Math.min(inputNorm.length, pNorm.length) / Math.max(inputNorm.length, pNorm.length);
                if (lenRatio > 0.45 && lenRatio > highestScore) {
                    highestScore = lenRatio;
                    bestMatch = p;
                }
            }

            // Word overlap check (e.g. BEAR BRAND vs BEAR BRAND FORTIFIED)
            const inputWords = name.trim().toLowerCase().split(/\s+/).filter(Boolean);
            const pWords = p.name.trim().toLowerCase().split(/\s+/).filter(Boolean);
            const commonWords = inputWords.filter(w => pWords.includes(w));
            if (commonWords.length > 0) {
                const wordScore = (commonWords.length * 2) / (inputWords.length + pWords.length);
                if (wordScore > 0.5 && wordScore > highestScore) {
                    highestScore = wordScore;
                    bestMatch = p;
                }
            }

            // Levenshtein distance for typos (e.g. CHARME vs CHARMEE)
            if (Math.abs(inputNorm.length - pNorm.length) <= 3) {
                const m = inputNorm.length;
                const n = pNorm.length;
                const d: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
                for (let i = 0; i <= m; i++) d[i][0] = i;
                for (let j = 0; j <= n; j++) d[0][j] = j;
                for (let i = 1; i <= m; i++) {
                    for (let j = 1; j <= n; j++) {
                        const cost = inputNorm[i - 1] === pNorm[j - 1] ? 0 : 1;
                        d[i][j] = Math.min(
                            d[i - 1][j] + 1,
                            d[i][j - 1] + 1,
                            d[i - 1][j - 1] + cost
                        );
                    }
                }
                const dist = d[m][n];
                const sim = 1 - dist / Math.max(m, n);
                if (sim >= 0.65 && sim > highestScore) {
                    highestScore = sim;
                    bestMatch = p;
                }
            }
        }

        return highestScore >= 0.5 ? bestMatch : null;
    }, [name, existingProducts, isExistingProduct, dismissedSuggestion]);

    // --- 1. CATEGORY STATE (Real-time DB Search, NO native select dropdown) ---
    const [categorySearch, setCategorySearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || 'Beverages');
    const [isCategoryPicking, setIsCategoryPicking] = useState(false);
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');

    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return categories;
        const q = categorySearch.toLowerCase();
        return categories.filter(c => typeof c === 'string' && c.toLowerCase().includes(q));
    }, [categories, categorySearch]);

    // --- 2. Flavor STATE (Real-time DB Search, NO native select dropdown) ---
    const allVariants = variantsList && variantsList.length > 0 ? variantsList : flavors;
    const defaultVariant = allVariants.find(f => f.name.toLowerCase() === 'regular')
        || allVariants.find(f => f.name.toLowerCase() === 'original')
        || allVariants[0]
        || null;

    const [variantSearch, setVariantSearch] = useState('');
    const [selectedVariant, setSelectedVariant] = useState<VariantItem | null>(defaultVariant);
    const [isVariantPicking, setIsVariantPicking] = useState(false);
    const [isCustomVariant, setIsCustomVariant] = useState(false);
    const [customVariant, setCustomVariant] = useState('');

    const filteredVariants = useMemo(() => {
        if (!variantSearch.trim()) return allVariants;
        const q = variantSearch.toLowerCase();
        return allVariants.filter(f => f.name.toLowerCase().includes(q));
    }, [allVariants, variantSearch]);

    // --- 3. MEASUREMENT & PACKAGING (Real-time DB Search, NO native select dropdown) ---
    const [sizeValue, setSizeValue] = useState('');

    // Unit of measure
    const [unitSearch, setUnitSearch] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(units[0] || null);
    const [isUnitPicking, setIsUnitPicking] = useState(false);
    const [isCustomUnit, setIsCustomUnit] = useState(false);
    const [customUnitSymbol, setCustomUnitSymbol] = useState('');
    const [customUnitName, setCustomUnitName] = useState('');

    const filteredUnits = useMemo(() => {
        if (!unitSearch.trim()) return units;
        const q = unitSearch.toLowerCase();
        return units.filter(u => 
            u.symbol.toLowerCase().includes(q) || 
            u.name.toLowerCase().includes(q) || 
            (u.category && u.category.toLowerCase().includes(q))
        );
    }, [units, unitSearch]);

    // Packaging type
    const [packagingSearch, setPackagingSearch] = useState('');
    const [selectedPackaging, setSelectedPackaging] = useState<PackagingItem | null>(packagings[0] || null);
    const [isPackagingPicking, setIsPackagingPicking] = useState(false);
    const [isCustomPackaging, setIsCustomPackaging] = useState(false);
    const [customPackaging, setCustomPackaging] = useState('');

    const filteredPackagings = useMemo(() => {
        if (!packagingSearch.trim()) return packagings;
        const q = packagingSearch.toLowerCase();
        return packagings.filter(pk => pk.name.toLowerCase().includes(q));
    }, [packagings, packagingSearch]);

    // --- 4. DISTRIBUTOR SUBCATEGORY (Optional) ---
    const [selectedDistributors, setSelectedDistributors] = useState<DistributorConfig[]>([]);

    // --- 5. OPENING STOCK & THRESHOLD ---
    const [openingQuantity, setOpeningQuantity] = useState<number | ''>(0);
    const [reorderLevel, setReorderLevel] = useState<number | ''>(15);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Effective values for preview & submission
    const effectiveCategory = useMemo(() => {
        if (isCustomCategory) return customCategory.trim();
        return selectedCategory;
    }, [isCustomCategory, customCategory, selectedCategory]);

    const effectiveVariantName = useMemo(() => {
        if (isCustomVariant) return customVariant.trim();
        return selectedVariant ? selectedVariant.name : 'Regular';
    }, [isCustomVariant, customVariant, selectedVariant]);

    const effectiveUnitSymbol = useMemo(() => {
        if (isCustomUnit) return customUnitSymbol.trim();
        return selectedUnit ? selectedUnit.symbol : '';
    }, [isCustomUnit, customUnitSymbol, selectedUnit]);

    const effectivePackagingName = useMemo(() => {
        if (isCustomPackaging) return customPackaging.trim();
        return selectedPackaging ? selectedPackaging.name : '';
    }, [isCustomPackaging, customPackaging, selectedPackaging]);

    // Primary distributor (if any selected)
    const primaryDistributor = useMemo(() => {
        const primaryConfig = selectedDistributors.find(d => d.is_primary) || selectedDistributors[0];
        if (!primaryConfig) return null;
        return distributors.find(d => d.id === primaryConfig.distributor_id) || null;
    }, [selectedDistributors, distributors]);

    // Live Simulated SKU Preview
    const previewSku = useMemo(() => {
        const brandCode = (primaryDistributor?.name || name || 'WNZ').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'WNZ';
        const typeCode = (effectiveVariantName || 'REG').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'REG';
        const sizeCode = sizeValue 
            ? `${sizeValue}${effectiveUnitSymbol}`.toUpperCase().replace(/[^A-Z0-9]/g, '')
            : (effectiveUnitSymbol || 'STD');
        const packCode = (effectivePackagingName || 'EA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'EA';

        return `WNZ-${brandCode}-${typeCode}-${sizeCode}-${packCode}`;
    }, [primaryDistributor, name, effectiveVariantName, sizeValue, effectiveUnitSymbol, effectivePackagingName]);

    // Format currency
    const formatCurrency = (val: number | '') => {
        if (val === '' || isNaN(Number(val))) return '₱0.00';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(Number(val));
    };

    // Toggle a distributor in the multi-select list
    const handleToggleDistributor = (distId: number) => {
        const existingIdx = selectedDistributors.findIndex(d => d.distributor_id === distId);
        if (existingIdx !== -1) {
            const updated = selectedDistributors.filter(d => d.distributor_id !== distId);
            if (selectedDistributors[existingIdx].is_primary && updated.length > 0) {
                updated[0].is_primary = true;
            }
            setSelectedDistributors(updated);
        } else {
            setSelectedDistributors(prev => [
                ...prev,
                {
                    distributor_id: distId,
                    purchase_price: '',
                    default_discount: 0,
                    default_dealing_price: '',
                    is_primary: prev.length === 0,
                }
            ]);
        }
    };

    // Update pricing for a distributor
    const handleDistPriceChange = (distId: number, field: 'purchase_price' | 'default_discount' | 'default_dealing_price', value: string) => {
        const numVal = value === '' ? '' : parseFloat(value);
        setSelectedDistributors(prev => prev.map(d => {
            if (d.distributor_id !== distId) return d;
            const updated = { ...d, [field]: numVal };
            if (field === 'purchase_price' || field === 'default_discount') {
                const cost = field === 'purchase_price' ? (numVal === '' ? 0 : numVal) : (d.purchase_price === '' ? 0 : d.purchase_price);
                const disc = field === 'default_discount' ? (numVal === '' ? 0 : numVal) : (d.default_discount === '' ? 0 : d.default_discount);
                updated.default_dealing_price = cost + disc;
            }
            return updated;
        }));
    };

    // Mark primary distributor
    const handleSetPrimary = (distId: number) => {
        setSelectedDistributors(prev => prev.map(d => ({
            ...d,
            is_primary: d.distributor_id === distId,
        })));
    };

    // Form Submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!name.trim()) {
            setErrorMsg('Product name is required.');
            setCurrentStep(1);
            return;
        }

        if (!effectiveCategory) {
            setErrorMsg('Category is required.');
            setCurrentStep(1);
            return;
        }

        if (isCustomUnit && !customUnitSymbol.trim()) {
            setErrorMsg('Please specify a unit symbol for the custom unit of measure (e.g. cL, g, mL).');
            setCurrentStep(2);
            return;
        }

        if (isCustomPackaging && !customPackaging.trim()) {
            setErrorMsg('Please specify a packaging name for the custom packaging type.');
            setCurrentStep(2);
            return;
        }

        // Validate distributor prices only if distributors were added
        if (selectedDistributors.length > 0) {
            for (const dist of selectedDistributors) {
                const distInfo = distributors.find(d => d.id === dist.distributor_id);
                if (dist.purchase_price === '' || Number(dist.purchase_price) < 0) {
                    setErrorMsg(`Please specify a valid purchase cost for distributor "${distInfo?.name}".`);
                    setCurrentStep(4);
                    return;
                }
            }
        }

        const primaryDist = selectedDistributors.find(d => d.is_primary) || selectedDistributors[0];
        const primaryDistInfo = primaryDist ? distributors.find(d => d.id === primaryDist.distributor_id) : null;

        const payload: any = {
            name: name.trim(),
            brand: primaryDistInfo?.name || undefined,
            category: effectiveCategory,
            flavor_id: (!isCustomVariant && selectedVariant) ? selectedVariant.flavor_id : undefined,
            flavor_type: effectiveVariantName || undefined,
            description: description.trim() || undefined,
            size_value: sizeValue.trim() || undefined,
            unit_id: (!isCustomUnit && selectedUnit) ? selectedUnit.id : undefined,
            unit_symbol: isCustomUnit ? customUnitSymbol.trim() : undefined,
            unit_name: isCustomUnit ? (customUnitName.trim() || customUnitSymbol.trim()) : undefined,
            packaging_id: (!isCustomPackaging && selectedPackaging) ? (selectedPackaging.packaging_id || (selectedPackaging as any).id) : undefined,
            packaging: effectivePackagingName || undefined,
            image: image.trim() || undefined,
            sku: previewSku,
            opening_quantity: Number(openingQuantity) || 0,
            reorder_level: Number(reorderLevel) || 10,
        };

        if (primaryDist) {
            payload.distributor_id = primaryDist.distributor_id;
            payload.purchase_price = Number(primaryDist.purchase_price) || 0;
            payload.default_discount = Number(primaryDist.default_discount) || 0;
            payload.default_dealing_price = Number(primaryDist.default_dealing_price) || 0;
            payload.distributors = selectedDistributors.map(d => ({
                distributor_id: d.distributor_id,
                purchase_price: Number(d.purchase_price) || 0,
                default_discount: Number(d.default_discount) || 0,
                default_dealing_price: Number(d.default_dealing_price) || 0,
                is_primary: d.is_primary,
            }));
        } else {
            payload.purchase_price = 0;
            payload.default_discount = 0;
            payload.default_dealing_price = 0;
        }

        setIsSubmitting(true);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('winzelle_active_product_master', name.trim());
        }
        router.post('/products', payload, {
            onError: (errs) => {
                setIsSubmitting(false);
                const first = Object.values(errs)[0];
                setErrorMsg(typeof first === 'string' ? first : 'Validation error occurred.');
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <MainLayout title={isExistingProduct ? `Add Variant of: ${name}` : "Create Master Product"}>
            <Head title={isExistingProduct ? `Add Variant of: ${name} | Winzelle Inventory` : "Create Master Product | Winzelle Inventory"} />

            <div className="space-y-6 max-w-6xl mx-auto pb-16">
                
                {/* Header & Back Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition mb-2"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Back to Products Showcase</span>
                        </Link>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                            <Package className="h-6 w-6 text-emerald-400" />
                            <span>{isExistingProduct ? `Add Variant of: ${name}` : 'Create Master Product'}</span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            {isExistingProduct 
                                ? `Configure a new variant, measurement, and pricing for ${name}.` 
                                : 'Register master catalog product entity with real-time database search and opening stock.'}
                        </p>
                    </div>

                    {isExistingProduct && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Master Product: <strong className="text-white uppercase">{name}</strong></span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress Step Navigator */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-900 p-2 rounded-2xl border border-slate-800">
                    {[
                        { step: 1, label: isExistingProduct ? '1. Variant Details' : '1. Master Details', icon: Package },
                        { step: 2, label: '2. Measurement & Pack', icon: Ruler },
                        { step: 3, label: '3. Opening Stock', icon: Boxes },
                        { step: 4, label: '4. Distributors (Optional)', icon: Building2 },
                    ].map(s => {
                        const Icon = s.icon;
                        const isActive = currentStep === s.step;
                        const isDone = currentStep > s.step;
                        return (
                            <button
                                key={s.step}
                                type="button"
                                onClick={() => setCurrentStep(s.step)}
                                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition ${
                                    isActive
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                                        : isDone
                                        ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-slate-950/60 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{s.label}</span>
                                {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-400 ml-auto" />}
                            </button>
                        );
                    })}
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Main Content Layout: Form Left + Live Preview Right */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* FORM WIZARD (Left 2 Cols) */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">

                            {/* ==================================================== */}
                            {/* STEP 1: PRODUCT MASTER INFORMATION                   */}
                            {/* ==================================================== */}
                            {currentStep === 1 && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    <div className="border-b border-slate-800 pb-3">
                                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Package className="h-4 w-4 text-emerald-400" />
                                            <span>{isExistingProduct ? 'Step 1: Variant Information' : 'Step 1: Product Master Information'}</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {isExistingProduct 
                                                ? `Adding a new variant under existing product "${name}".` 
                                                : 'Master catalog entity with real-time database search for Category and Variant.'}
                                        </p>
                                    </div>

                                    {isExistingProduct && (
                                        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                                <span>Adding new variant to master product: <strong className="text-white uppercase">{name}</strong></span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsExistingProduct(false);
                                                    setMatchedMasterProduct(null);
                                                }}
                                                className="text-[11px] text-slate-400 hover:text-white underline ml-2 shrink-0"
                                            >
                                                Create New Master Instead
                                            </button>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Product Name * <span className="text-[11px] text-slate-500 font-normal">{isExistingProduct ? '(Locked to existing master product)' : '(e.g. Bear Brand Fortified Powdered Milk, Yakult)'}</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={name}
                                                readOnly={isExistingProduct}
                                                disabled={isExistingProduct}
                                                onChange={(e) => {
                                                    if (isExistingProduct) return;
                                                    const val = e.target.value.toUpperCase();
                                                    setName(val);
                                                    const match = existingProducts.find(p => p.name.trim().toLowerCase() === val.trim().toLowerCase());
                                                    if (match) {
                                                        applyExistingMaster(match);
                                                    } else if (isExistingProduct) {
                                                        setIsExistingProduct(false);
                                                        setMatchedMasterProduct(null);
                                                    }
                                                }}
                                                placeholder="Enter master product name..."
                                                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs uppercase placeholder-slate-500 transition ${
                                                    isExistingProduct 
                                                        ? 'bg-slate-900/90 border-slate-700/60 text-emerald-300 font-bold cursor-not-allowed select-none' 
                                                        : 'bg-slate-950 border-slate-700 text-white focus:outline-none focus:border-emerald-500'
                                                }`}
                                                required
                                            />
                                            {isExistingProduct && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30 pointer-events-none">
                                                    <Lock className="h-3 w-3" />
                                                    <span>Locked</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* "Did you mean __?" Similarity Notice */}
                                        {suggestedSimilarProduct && !isExistingProduct && (
                                            <div className="mt-2.5 p-3.5 bg-amber-950/60 border border-amber-500/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 animate-in fade-in slide-in-from-top-1 shadow-lg">
                                                <div className="flex items-start sm:items-center gap-2.5">
                                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                                                    <div>
                                                        <span>The system might already have this. Do you mean <strong className="text-white underline font-bold uppercase">{suggestedSimilarProduct.name}</strong>?</span>
                                                        <span className="block text-[11px] text-amber-400/80 mt-0.5">
                                                            Category: {suggestedSimilarProduct.categoryRelation?.name || suggestedSimilarProduct.category || 'General'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => applyExistingMaster(suggestedSimilarProduct)}
                                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition text-xs shadow-sm flex items-center gap-1 active:scale-95"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        <span>Yes, Add Variant to It</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDismissedSuggestion(suggestedSimilarProduct.name)}
                                                        className="px-2.5 py-1.5 text-slate-400 hover:text-white transition text-xs"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggestions for existing products */}
                                        {matchingExistingProducts.length > 0 && !isExistingProduct && (
                                            <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-xl space-y-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                                                    Existing Master Products Found:
                                                </span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                    {matchingExistingProducts.slice(0, 4).map(p => (
                                                        <div
                                                            key={p.id || p.product_id}
                                                            onClick={() => applyExistingMaster(p)}
                                                            className="p-2 rounded-lg bg-slate-900 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/30 cursor-pointer flex items-center justify-between text-xs transition"
                                                        >
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <span className="font-bold text-white uppercase truncate">{p.name}</span>
                                                                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/20 shrink-0">
                                                                    {p.categoryRelation?.name || p.category || 'General'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] font-semibold text-emerald-400 shrink-0 ml-1">
                                                                + Add Variant
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Picture Upload */}
                                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                                        <label className="block text-xs font-semibold text-slate-300">
                                            Product Master Picture
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="h-20 w-20 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                                {image ? (
                                                    <img src={image} alt="Preview" className="h-full w-full object-contain" />
                                                ) : (
                                                    <Package className="h-8 w-8 text-slate-600" />
                                                )}
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition inline-flex items-center gap-1.5 border border-slate-700">
                                                        <Upload className="h-3.5 w-3.5" />
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
                                                                        setImage(uri);
                                                                    } catch (err: any) {
                                                                        alert(err.message || 'Image processing error.');
                                                                    }
                                                                }
                                                            }} 
                                                        />
                                                    </label>
                                                    {image && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setImage('')}
                                                            className="p-2 text-rose-400 hover:bg-rose-950/50 rounded-xl transition border border-rose-500/20"
                                                            title="Remove image"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    Recommended: Clear product shot. Images automatically compress to fast-loading WebP format.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2-Column: Category & Variant (Pure Real-Time Autocomplete, NO native select dropdowns) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        
                                        {/* CATEGORY FIELD */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-300">
                                                Category *
                                            </label>

                                            {isCustomCategory ? (
                                                <div className="p-3 bg-slate-950 border border-emerald-500/50 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="font-bold text-emerald-400">+ New Custom Category</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsCustomCategory(false);
                                                                setCustomCategory('');
                                                            }}
                                                            className="text-slate-400 hover:text-white"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={customCategory}
                                                        onChange={(e) => setCustomCategory(e.target.value.toUpperCase())}
                                                        placeholder="Type new category name..."
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {selectedCategory && !isCategoryPicking ? (
                                                        <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                                                <span className="text-xs font-bold text-white">{selectedCategory}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsCategoryPicking(true);
                                                                    setCategorySearch('');
                                                                }}
                                                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-slate-900 transition"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                                                <input
                                                                    type="text"
                                                                    value={categorySearch}
                                                                    onChange={(e) => setCategorySearch(e.target.value)}
                                                                    placeholder="Real-time category search..."
                                                                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                                    autoFocus
                                                                />
                                                                {selectedCategory && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsCategoryPicking(false)}
                                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Real-time Matching List */}
                                                            <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-850 shadow-xl">
                                                                {filteredCategories.map(cat => (
                                                                    <div
                                                                        key={cat}
                                                                        onClick={() => {
                                                                            setSelectedCategory(cat);
                                                                            setIsCategoryPicking(false);
                                                                            setIsCustomCategory(false);
                                                                        }}
                                                                        className={`p-2.5 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-900 ${
                                                                            selectedCategory === cat ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                                        }`}
                                                                    >
                                                                        <span>{cat}</span>
                                                                        {selectedCategory === cat && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                                                    </div>
                                                                ))}
                                                                {/* Custom Category Button */}
                                                                <div
                                                                    onClick={() => {
                                                                        setIsCustomCategory(true);
                                                                        setCustomCategory(categorySearch.trim().toUpperCase());
                                                                        setIsCategoryPicking(false);
                                                                    }}
                                                                    className="p-2.5 text-xs text-emerald-400 font-bold hover:bg-emerald-950/30 cursor-pointer flex items-center gap-1.5 transition"
                                                                >
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        {categorySearch.trim() ? `Add Custom "${categorySearch.trim()}"` : '+ Add Custom Category...'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Variant FIELD */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-300">
                                                Variant *
                                            </label>

                                            {isCustomVariant ? (
                                                <div className="p-3 bg-slate-950 border border-emerald-500/50 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="font-bold text-emerald-400">+ New Custom Variant</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsCustomVariant(false);
                                                                setCustomVariant('');
                                                            }}
                                                            className="text-slate-400 hover:text-white"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={customVariant}
                                                        onChange={(e) => setCustomVariant(e.target.value.toUpperCase())}
                                                        placeholder="Type new Variant name..."
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {selectedVariant && !isVariantPicking ? (
                                                        <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                                                <span className="text-xs font-bold text-white">{selectedVariant.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsVariantPicking(true);
                                                                    setVariantSearch('');
                                                                }}
                                                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-slate-900 transition"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                                                <input
                                                                    type="text"
                                                                    value={variantSearch}
                                                                    onChange={(e) => setVariantSearch(e.target.value)}
                                                                    placeholder="Real-time Variant search..."
                                                                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                                    autoFocus
                                                                />
                                                                {selectedVariant && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsVariantPicking(false)}
                                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Real-time Matching List */}
                                                            <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-850 shadow-xl">
                                                                {filteredVariants.map(flv => (
                                                                    <div
                                                                        key={flv.flavor_id}
                                                                        onClick={() => {
                                                                            setSelectedVariant(flv);
                                                                            setIsVariantPicking(false);
                                                                            setIsCustomVariant(false);
                                                                        }}
                                                                        className={`p-2.5 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-900 ${
                                                                            selectedVariant?.flavor_id === flv.flavor_id ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                                        }`}
                                                                    >
                                                                        <span>{flv.name}</span>
                                                                        {selectedVariant?.flavor_id === flv.flavor_id && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                                                    </div>
                                                                ))}
                                                                {/* Custom Flavor Button */}
                                                                <div
                                                                    onClick={() => {
                                                                        setIsCustomVariant(true);
                                                                        setCustomVariant(variantSearch.trim().toUpperCase());
                                                                        setIsVariantPicking(false);
                                                                    }}
                                                                    className="p-2.5 text-xs text-emerald-400 font-bold hover:bg-emerald-950/30 cursor-pointer flex items-center gap-1.5 transition"
                                                                >
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        {variantSearch.trim() ? `Add Custom "${variantSearch.trim()}"` : '+ Add Custom Variant...'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Description / Notes <span className="text-[11px] text-slate-500 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Short description or notes..."
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
                                        >
                                            <span>Continue to Measurements</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ==================================================== */}
                            {/* STEP 2: SUBCATEGORY - MEASUREMENT & PACKAGING        */}
                            {/* ==================================================== */}
                            {currentStep === 2 && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    <div className="border-b border-slate-800 pb-3">
                                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Ruler className="h-4 w-4 text-emerald-400" />
                                            <span>Step 2: Subcategory — Measurement & Packaging</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Specify unit and packaging specs. Search in real-time or add custom unit / packaging on the fly.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                            Size / Net Content <span className="text-[11px] text-slate-500 font-normal">(e.g. 300, 1, 330)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={sizeValue}
                                            onChange={(e) => setSizeValue(e.target.value)}
                                            placeholder="e.g. 300"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    {/* 2-Column: Unit of Measure & Packaging Type (Pure Real-Time Autocomplete) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* UNIT OF MEASURE FIELD */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-300">
                                                Unit of Measure *
                                            </label>

                                            {isCustomUnit ? (
                                                <div className="p-3.5 bg-slate-950 border border-emerald-500/50 rounded-xl space-y-2.5">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="font-bold text-emerald-400">+ New Custom Unit of Measure</span>
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
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-[10px] text-slate-400 mb-1">Unit Symbol * (e.g. cL, can, tub)</label>
                                                            <input
                                                                type="text"
                                                                value={customUnitSymbol}
                                                                onChange={(e) => setCustomUnitSymbol(e.target.value.toUpperCase())}
                                                                placeholder="e.g. cL"
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] text-slate-400 mb-1">Unit Name (e.g. Centiliter)</label>
                                                            <input
                                                                type="text"
                                                                value={customUnitName}
                                                                onChange={(e) => setCustomUnitName(e.target.value.toUpperCase())}
                                                                placeholder="e.g. Centiliter"
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {selectedUnit && !isUnitPicking ? (
                                                        <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 text-[11px]">
                                                                    {selectedUnit.symbol}
                                                                </span>
                                                                <span className="text-xs text-white font-medium">{selectedUnit.name}</span>
                                                                <span className="text-[10px] text-slate-500">({selectedUnit.category})</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsUnitPicking(true);
                                                                    setUnitSearch('');
                                                                }}
                                                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-slate-900 transition"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                                                <input
                                                                    type="text"
                                                                    value={unitSearch}
                                                                    onChange={(e) => setUnitSearch(e.target.value)}
                                                                    placeholder="Real-time search unit (e.g. g, mL, pack)..."
                                                                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                                    autoFocus
                                                                />
                                                                {selectedUnit && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsUnitPicking(false)}
                                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Real-time Matching List */}
                                                            <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-850 shadow-xl">
                                                                {filteredUnits.map(u => (
                                                                    <div
                                                                        key={u.id}
                                                                        onClick={() => {
                                                                            setSelectedUnit(u);
                                                                            setIsUnitPicking(false);
                                                                            setIsCustomUnit(false);
                                                                        }}
                                                                        className={`p-2.5 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-900 ${
                                                                            selectedUnit?.id === u.id ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                                                                                {u.symbol}
                                                                            </span>
                                                                            <span>{u.name}</span>
                                                                            <span className="text-[10px] text-slate-500">({u.category})</span>
                                                                        </div>
                                                                        {selectedUnit?.id === u.id && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                                                    </div>
                                                                ))}
                                                                {/* Custom Unit Button */}
                                                                <div
                                                                    onClick={() => {
                                                                        setIsCustomUnit(true);
                                                                        setCustomUnitSymbol(unitSearch.trim().toUpperCase());
                                                                        setIsUnitPicking(false);
                                                                    }}
                                                                    className="p-2.5 text-xs text-emerald-400 font-bold hover:bg-emerald-950/30 cursor-pointer flex items-center gap-1.5 transition"
                                                                >
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        {unitSearch.trim() ? `Add Custom Unit "${unitSearch.trim()}"` : '+ Add Custom Unit of Measure...'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* PACKAGING TYPE FIELD */}
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-slate-300">
                                                Packaging Type
                                            </label>

                                            {isCustomPackaging ? (
                                                <div className="p-3.5 bg-slate-950 border border-emerald-500/50 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between text-[11px]">
                                                        <span className="font-bold text-emerald-400">+ New Custom Packaging Type</span>
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
                                                        placeholder="e.g. Keg, Dispenser Box, Tin Can..."
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                        autoFocus
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {selectedPackaging && !isPackagingPicking ? (
                                                        <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                                                <span className="text-xs font-bold text-white">{selectedPackaging.name}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsPackagingPicking(true);
                                                                    setPackagingSearch('');
                                                                }}
                                                                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded-lg hover:bg-slate-900 transition"
                                                            >
                                                                Change
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                                                                <input
                                                                    type="text"
                                                                    value={packagingSearch}
                                                                    onChange={(e) => setPackagingSearch(e.target.value)}
                                                                    placeholder="Real-time packaging search (e.g. Box, Can, Bottle)..."
                                                                    className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                                                    autoFocus
                                                                />
                                                                {selectedPackaging && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setIsPackagingPicking(false)}
                                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Real-time Matching List */}
                                                            <div className="bg-slate-950 border border-slate-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-855 shadow-xl">
                                                                {filteredPackagings.map(pk => {
                                                                    const pkId = pk.packaging_id || (pk as any).id;
                                                                    const isSel = selectedPackaging && (selectedPackaging.packaging_id === pkId || (selectedPackaging as any).id === pkId);
                                                                    return (
                                                                        <div
                                                                            key={pkId}
                                                                            onClick={() => {
                                                                                setSelectedPackaging(pk);
                                                                                setIsPackagingPicking(false);
                                                                                setIsCustomPackaging(false);
                                                                            }}
                                                                            className={`p-2.5 text-xs cursor-pointer flex items-center justify-between transition hover:bg-slate-900 ${
                                                                                isSel ? 'bg-emerald-950/40 text-emerald-300 font-bold' : 'text-slate-300'
                                                                            }`}
                                                                        >
                                                                            <span>{pk.name}</span>
                                                                            {isSel && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                                                                        </div>
                                                                    );
                                                                })}
                                                                {/* Custom Packaging Button */}
                                                                <div
                                                                    onClick={() => {
                                                                        setIsCustomPackaging(true);
                                                                        setCustomPackaging(packagingSearch.trim().toUpperCase());
                                                                        setIsPackagingPicking(false);
                                                                    }}
                                                                    className="p-2.5 text-xs text-emerald-400 font-bold hover:bg-emerald-950/30 cursor-pointer flex items-center gap-1.5 transition"
                                                                >
                                                                    <Plus className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        {packagingSearch.trim() ? `Add Custom "${packagingSearch.trim()}"` : '+ Add Custom Packaging Type...'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {/* Measurement Display Banner */}
                                    <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-400">Standardized Measurement:</span>
                                            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                                                {sizeValue || '0'} {effectiveUnitSymbol || 'units'}
                                                {effectivePackagingName ? ` (${effectivePackagingName})` : ''}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate-500 font-mono">
                                            {isCustomUnit ? 'Custom Unit Model' : `Unit FK #${selectedUnit?.id || 'none'}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(3)}
                                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
                                        >
                                            <span>Continue to Stock Entry</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ==================================================== */}
                            {/* STEP 3: OPENING STOCK & AUDIT INITIALIZATION         */}
                            {/* ==================================================== */}
                            {currentStep === 3 && (
                                <div className="space-y-5 animate-in fade-in duration-200">
                                    <div className="border-b border-slate-800 pb-3">
                                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                            <Boxes className="h-4 w-4 text-emerald-400" />
                                            <span>Step 3: Opening Stock & Safety Alert Threshold</span>
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Initialize warehouse inventory on-hand quantity and low stock reorder threshold.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Opening Stock Quantity <span className="text-[11px] text-slate-500 font-normal">(Initial inventory)</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={openingQuantity}
                                                onChange={(e) => setOpeningQuantity(e.target.value === '' ? '' : parseInt(e.target.value))}
                                                placeholder="0"
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 font-bold"
                                            />
                                            <span className="text-[11px] text-slate-500 mt-1 block">
                                                Automatically registers warehouse stock in <span className="text-emerald-400 font-mono">inventories</span> table.
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                                Safety Reorder Threshold <span className="text-[11px] text-slate-500 font-normal">(Low stock alert)</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={reorderLevel}
                                                onChange={(e) => setReorderLevel(e.target.value === '' ? '' : parseInt(e.target.value))}
                                                placeholder="15"
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-emerald-500 font-bold"
                                            />
                                            <span className="text-[11px] text-slate-500 mt-1 block">
                                                Triggers low-stock warnings when inventory is below this level.
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                                        <div className="font-bold flex items-center gap-1.5">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <span>Master Product & Initial Variant Ready</span>
                                        </div>
                                        <p className="text-[11px] text-slate-300">
                                            You can save this Master Product right now, or optionally proceed to link distributor suppliers and configure wholesale pricing.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(2)}
                                            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                                        >
                                            Back
                                        </button>
                                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(4)}
                                                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                                            >
                                                <span>Link Distributors (Optional)</span>
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || isChecker}
                                                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        <span>Saving Master Product...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 stroke-[3]" />
                                                        <span>{isExistingProduct ? 'Save Variant' : 'Save Master Product'}</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ==================================================== */}
                            {/* STEP 4: DISTRIBUTORS & PRICING (OPTIONAL)            */}
                            {/* ==================================================== */}
                            {currentStep === 4 && (
                                <div className="space-y-4 animate-in fade-in duration-200">
                                    <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-emerald-400" />
                                                <span>Step 4: Distributor Suppliers & Pricing (Optional)</span>
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-0.5">
                                                Optional: Assign distributor suppliers and purchase costs. Can also be configured later under Purchases.
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                                            {selectedDistributors.length} Linked
                                        </span>
                                    </div>

                                    {/* Multi-Select Distributor Cards Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                                        {distributors.map(d => {
                                            const isSelected = selectedDistributors.some(sd => sd.distributor_id === d.id);
                                            return (
                                                <div
                                                    key={d.id}
                                                    onClick={() => handleToggleDistributor(d.id)}
                                                    className={`p-3 rounded-xl border text-left cursor-pointer transition select-none flex items-center justify-between ${
                                                        isSelected
                                                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 truncate">
                                                        <div className={`h-4 w-4 rounded flex items-center justify-center border transition ${
                                                            isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                                                        }`}>
                                                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                                        </div>
                                                        <span className="text-xs font-bold truncate">{d.name}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Pricing Configuration for Checked Distributors */}
                                    {selectedDistributors.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                                Configure Pricing for Linked Distributors:
                                            </label>

                                            {selectedDistributors.map(dConfig => {
                                                const distInfo = distributors.find(d => d.id === dConfig.distributor_id);
                                                return (
                                                    <div key={dConfig.distributor_id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                                                                <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                                                                <span>{distInfo?.name || `Distributor #${dConfig.distributor_id}`}</span>
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetPrimary(dConfig.distributor_id)}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                                                    dConfig.is_primary
                                                                        ? 'bg-emerald-600 text-white border-emerald-500'
                                                                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                                                                }`}
                                                            >
                                                                {dConfig.is_primary ? '★ Primary Supplier' : 'Set as Primary'}
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2.5">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 mb-1">Purchase Cost (₱) *</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    value={dConfig.purchase_price}
                                                                    onChange={(e) => handleDistPriceChange(dConfig.distributor_id, 'purchase_price', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                                                                    required
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 mb-1">Discount Margin (₱)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    value={dConfig.default_discount}
                                                                    onChange={(e) => handleDistPriceChange(dConfig.distributor_id, 'default_discount', e.target.value)}
                                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 mb-1">Dealing Price (₱)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    readOnly
                                                                    placeholder="0.00"
                                                                    value={dConfig.default_dealing_price}
                                                                    className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold font-mono cursor-not-allowed select-all focus:outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(3)}
                                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || isChecker}
                                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-95"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Registering Product...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 stroke-[3]" />
                                                    <span>{isExistingProduct ? 'Save New Variant' : 'Save Master Product'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </form>
                    </div>

                    {/* LIVE NORMALIZED PREVIEW CARD (Right 1 Col) */}
                    <div className="space-y-4">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl sticky top-6 space-y-4">
                            
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Product Preview</span>
                                </h4>
                            </div>

                            {/* Product Picture in Live Preview Card */}
                            {image && (
                                <div className="w-full h-40 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                                    <img src={image} alt="Preview" className="max-h-full max-w-full object-contain drop-shadow" />
                                </div>
                            )}

                            {/* Simulated Auto-Generated SKU */}
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                                    Standardized SKU Code
                                </span>
                                <span className="text-sm font-black font-mono text-emerald-400 tracking-wider">
                                    {previewSku}
                                </span>
                            </div>

                            {/* Normalized Hierarchy Structure */}
                            <div className="space-y-2.5 text-xs">
                                
                                {/* 1. Master Entity */}
                                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                        📦 Product Information
                                    </span>
                                    <span className="font-bold text-white text-sm block">
                                        {name.trim() || 'Untitled Product'}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                            {effectiveCategory || 'Uncategorized'}
                                        </span>
                                        {effectiveVariantName && (
                                            <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 font-medium">
                                                {effectiveVariantName}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Subcategory: Measurement */}
                                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                        📏 Initial Variant & Measurement
                                    </span>
                                    <span className="font-mono font-bold text-emerald-400">
                                        {sizeValue ? `${sizeValue}${effectiveUnitSymbol}` : (effectiveUnitSymbol || 'Standard')}
                                        {effectivePackagingName ? ` • ${effectivePackagingName}` : ''}
                                    </span>
                                </div>

                                {/* 3. Subcategory: Multiple Distributors */}
                                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">
                                        🏢 Linked Distributors ({selectedDistributors.length})
                                    </span>
                                    {selectedDistributors.length === 0 ? (
                                        <span className="text-[11px] text-slate-500 italic block">
                                            Optional (Can be linked later)
                                        </span>
                                    ) : (
                                        <div className="space-y-1">
                                            {selectedDistributors.map(sd => {
                                                const dInfo = distributors.find(d => d.id === sd.distributor_id);
                                                return (
                                                    <div key={sd.distributor_id} className="flex items-center justify-between text-[11px] bg-slate-900 px-2 py-1 rounded">
                                                        <span className="font-semibold text-slate-200 truncate">
                                                            {dInfo?.name} {sd.is_primary && '★'}
                                                        </span>
                                                        <span className="font-mono text-emerald-300 font-bold">
                                                            {formatCurrency(sd.purchase_price)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* 4. Warehouse Stock */}
                                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                            📊 Initial Stock
                                        </span>
                                        <span className="font-mono font-bold text-white text-base">
                                            {Number(openingQuantity || 0).toLocaleString()} <span className="text-xs text-slate-400 font-sans">units</span>
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                                            Safety Alert
                                        </span>
                                        <span className="font-mono font-bold text-amber-400 text-sm">
                                            &lt; {reorderLevel || 15}
                                        </span>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>

            </div>
        </MainLayout>
    );
}
