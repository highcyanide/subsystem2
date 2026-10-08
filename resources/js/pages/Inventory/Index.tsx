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
    Check,
    X,
    Layers,
    Download,
    FileSpreadsheet,
    Building2,
    Tag,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    SlidersHorizontal,
    Plus,
    Minus,
    ArrowDownRight,
    ArrowUpRight,
    Sliders,
    Scale,
    ShieldAlert,
    PieChart as PieIcon,
    BarChart3,
    LineChart as LineIcon,
    Flame,
    Sparkles,
    ExternalLink,
    Maximize2,
    Truck
} from 'lucide-react';
import { useTablePaginationAndSort } from '@/hooks/useTablePaginationAndSort';
import TablePagination from '@/Components/TablePagination';
import SortableHeader from '@/Components/SortableHeader';
import { exportInventoryExcel, exportInventoryCSV } from '@/utils/exportTemplateExcel';

interface Unit {
    id: number;
    name: string;
    symbol: string;
    category: string;
}

interface ProductOption {
    id: number;
    name: string;
    sku: string;
    category: string;
    purchase_price: number;
    default_dealing_price: number;
}

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
    unit_id?: number | null;
    unit?: Unit | null;
    product?: {
        id: number;
        name: string;
        size_value?: string;
        packaging?: string;
        unit?: Unit | null;
    } | null;
    updated_at: string;
    total_valuation?: number;
    stock_status?: string;
    image?: string | null;
}

interface StockMovement {
    id: number;
    product?: { name: string; sku: string };
    user?: { name: string };
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    balance_before: number;
    balance_after: number;
    reason: string;
    created_at: string;
}

interface Summary {
    total_products: number;
    total_items: number;
    total_valuation: number;
    low_stock_count?: number;
}

interface Props {
    inventories: InventoryItem[];
    allInventories?: InventoryItem[];
    topMovingProducts?: InventoryItem[];
    categories: string[];
    distributors: string[];
    units?: Unit[];
    productList?: ProductOption[];
    recentMovements?: StockMovement[];
    lowStockItems?: InventoryItem[];
    summary: Summary;
    filters: {
        search?: string;
        categories?: string[];
        distributors?: string[];
    };
    lowStockThreshold?: number;
}

function ProductThumbnail({ 
    src, 
    alt, 
    className = "", 
    fallbackIconSize = "h-8 w-8" 
}: { 
    src?: string | null; 
    alt: string; 
    className?: string; 
    fallbackIconSize?: string;
}) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="flex items-center justify-center w-full h-full text-slate-600">
                <Boxes className={fallbackIconSize} />
            </div>
        );
    }

    return (
        <img 
            src={src} 
            alt={alt} 
            className={className} 
            loading="lazy" 
            onError={() => setHasError(true)} 
        />
    );
}

export default function InventoryIndex({
    inventories = [],
    allInventories = [],
    topMovingProducts = [],
    categories = [],
    distributors = [],
    units = [],
    productList = [],
    recentMovements = [],
    lowStockItems = [],
    summary = { total_products: 0, total_items: 0, total_valuation: 0, low_stock_count: 0 },
    filters,
    lowStockThreshold = 15
}: Props) {
    const { props } = usePage<any>();
    const companyName = props?.companyName || props?.settings?.company_name || 'WINZELLE';

    const userRole = props?.auth?.user?.role || 'guest';
    const canManageStock = userRole === 'admin' || userRole === 'owner' || userRole === 'checker';
    const isOwnerOrAdmin = userRole === 'admin' || userRole === 'owner';

    // Toggle full table vs 1-3 rows snapshot
    const [isTableExpanded, setIsTableExpanded] = useState<boolean>(Boolean(filters?.search));
    const [isFullTableModalOpen, setIsFullTableModalOpen] = useState(false);

    // Stock details popup modal & row highlight
    const [selectedStockDetail, setSelectedStockDetail] = useState<InventoryItem | null>(null);
    const [highlightedRowId, setHighlightedRowId] = useState<number | null>(null);

    // Search and filters
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedDistributors, setSelectedDistributors] = useState<string[]>(filters?.distributors || []);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(filters?.categories || []);

    // Stock Movement Modals
    const [stockModalType, setStockModalType] = useState<'in' | 'out' | 'adjust' | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
    const [modalProductSearch, setModalProductSearch] = useState('');
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [movementQuantity, setMovementQuantity] = useState<number>(1);
    const [movementReason, setMovementReason] = useState<string>('Stock In / Delivery');
    const [movementRemarks, setMovementRemarks] = useState<string>('');
    const [isSubmittingMovement, setIsSubmittingMovement] = useState(false);
    const [movementError, setMovementError] = useState<string | null>(null);
    const [unitError, setUnitError] = useState<string | null>(null);

    const selectedProductInventory = useMemo(() => {
        if (selectedInventoryId) {
            const match = inventories.find(i => i.id === Number(selectedInventoryId))
                || (allInventories && allInventories.find(i => i.id === Number(selectedInventoryId)));
            if (match) return match;
        }
        if (selectedProductId) {
            return inventories.find(i => i.product_id === Number(selectedProductId))
                || (allInventories && allInventories.find(i => i.product_id === Number(selectedProductId)))
                || null;
        }
        return null;
    }, [inventories, allInventories, selectedInventoryId, selectedProductId]);

    const selectedProductObj = useMemo(() => {
        if (selectedProductInventory) {
            return {
                id: selectedProductInventory.product_id,
                name: selectedProductInventory.product_name,
                sku: selectedProductInventory.sku,
                category: selectedProductInventory.category,
            };
        }
        return productList.find(p => p.id === Number(selectedProductId)) || null;
    }, [selectedProductInventory, productList, selectedProductId]);

    const inventoryOptions = useMemo(() => {
        const source = (allInventories && allInventories.length > 0) ? allInventories : inventories;
        if (source.length > 0) {
            return source.map(item => ({
                id: item.product_id,
                inventory_id: item.id,
                name: item.product_name,
                sku: item.sku || 'N/A',
                category: item.category || 'General',
                quantity: item.quantity,
            }));
        }
        return productList.map(p => ({
            id: p.id,
            inventory_id: null,
            name: p.name,
            sku: p.sku || 'N/A',
            category: p.category || 'General',
            quantity: 0,
        }));
    }, [allInventories, inventories, productList]);

    const filteredModalProducts = useMemo(() => {
        if (!modalProductSearch.trim()) return inventoryOptions;
        const q = modalProductSearch.toLowerCase();
        return inventoryOptions.filter(p => 
            (p.name && p.name.toLowerCase().includes(q)) || 
            (p.sku && p.sku.toLowerCase().includes(q)) || 
            (p.category && p.category.toLowerCase().includes(q))
        );
    }, [inventoryOptions, modalProductSearch]);

    // Units subcategories modal
    const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
    const [analysisModalGraph, setAnalysisModalGraph] = useState<'sku' | 'stock' | 'valuation' | null>(null);
    const [newUnitName, setNewUnitName] = useState('');
    const [newUnitSymbol, setNewUnitSymbol] = useState('');
    const [newUnitCategory, setNewUnitCategory] = useState<'volume' | 'weight' | 'package' | 'count'>('volume');
    const [isSubmittingUnit, setIsSubmittingUnit] = useState(false);

    // Search debounce
    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Whole-warehouse inventory dataset for graphs and KPI summaries (never collapsed by table searches)
    const warehouseInventories = useMemo(() => {
        const source = allInventories && allInventories.length > 0 ? allInventories : inventories;
        return source.map(item => {
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
    }, [allInventories, inventories, lowStockThreshold]);

    // Pre-calculate valuations and status for the catalog table
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
        startIndex,
        endIndex,
    } = useTablePaginationAndSort({
        data: enrichedInventories,
        defaultSortKey: 'quantity',
        defaultDirection: 'asc',
        defaultPageSize: 10,
    });

    // 1-3 Rows Snapshot dataset when collapsed and no search
    const displayedData = useMemo(() => {
        if (!isTableExpanded && !searchQuery.trim()) {
            return sortedData.slice(0, 3);
        }
        return paginatedData;
    }, [isTableExpanded, searchQuery, sortedData, paginatedData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    // =========================================================
    // GRAPH 1 DATA: TOTAL PRODUCT SKUs (BAR GRAPH BY CATEGORY)
    // =========================================================
    const skuBarData = useMemo(() => {
        const counts: Record<string, number> = {};
        warehouseInventories.forEach(item => {
            const cat = item.category || 'General';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        const entries = Object.entries(counts).map(([name, count]) => ({ name, count }));
        entries.sort((a, b) => b.count - a.count);
        const maxCount = Math.max(...entries.map(e => e.count), 1);
        return { entries: entries.slice(0, 5), maxCount };
    }, [warehouseInventories]);

    // =========================================================
    // GRAPH 2 DATA: TOTAL UNITS IN STOCK (PIE / DONUT GRAPH)
    // =========================================================
    const stockDonutData = useMemo(() => {
        const distMap: Record<string, number> = {};
        warehouseInventories.forEach(item => {
            const dist = item.distributor_name || 'Direct';
            distMap[dist] = (distMap[dist] || 0) + (Number(item.quantity) || 0);
        });

        const sorted = Object.entries(distMap)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

        const totalStock = sorted.reduce((sum, item) => sum + item.total, 0) || 1;
        const top4 = sorted.slice(0, 4);
        const remaining = sorted.slice(4).reduce((sum, item) => sum + item.total, 0);
        if (remaining > 0) {
            top4.push({ name: 'Others', total: remaining });
        }

        const colors = ['#10B981', '#34D399', '#06B6D4', '#F59E0B', '#8B5CF6'];
        const circumference = 2 * Math.PI * 46; // radius = 46, circumference ~ 289.02
        let accumulatedDashOffset = 0;

        const slices = top4.map((item, index) => {
            const fraction = item.total / totalStock;
            const strokeDash = fraction * circumference;
            const offset = accumulatedDashOffset;
            accumulatedDashOffset += strokeDash;
            return {
                ...item,
                percentage: Math.round(fraction * 100),
                strokeDasharray: `${strokeDash} ${circumference}`,
                strokeDashoffset: -offset,
                color: colors[index % colors.length]
            };
        });

        return { slices, totalStock, circumference };
    }, [warehouseInventories]);

    // =========================================================
    // GRAPH 3 DATA: TOTAL VALUATION (LINE / SMOOTH AREA GRAPH)
    // =========================================================
    const valuationLineData = useMemo(() => {
        const catMap: Record<string, number> = {};
        warehouseInventories.forEach(item => {
            const cat = item.category || 'General';
            catMap[cat] = (catMap[cat] || 0) + (item.total_valuation || 0);
        });

        const entries = Object.entries(catMap)
            .map(([name, val]) => ({ name, val }))
            .sort((a, b) => b.val - a.val)
            .slice(0, 5);

        const maxVal = Math.max(...entries.map(e => e.val), 1000);
        const width = 320;
        const height = 110;
        const padding = 20;

        const points = entries.map((entry, index) => {
            const x = entries.length > 1 
                ? padding + (index / (entries.length - 1)) * (width - 2 * padding)
                : width / 2;
            const y = height - padding - (entry.val / maxVal) * (height - 2 * padding);
            return { x, y, ...entry };
        });

        // Path generator
        let pathD = '';
        let areaD = '';
        if (points.length > 0) {
            pathD = `M ${points[0].x} ${points[0].y}`;
            points.slice(1).forEach(p => {
                pathD += ` L ${p.x} ${p.y}`;
            });
            areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
        }

        return { points, maxVal, pathD, areaD, width, height };
    }, [enrichedInventories]);


    // =========================================================
    // REAL-TIME GRAPH INTERPRETATION & EXECUTIVE TEXT ANALYSIS
    // =========================================================
    const liveAnalysis = useMemo(() => {
        if (summary.total_products === 0) {
            return {
                skuInsight: 'No products currently cataloged.',
                stockInsight: 'Warehouse is currently empty.',
                valuationInsight: 'Total inventory valuation is ₱0.00.',
                healthVerdict: 'Action Required: Add initial product catalog and opening stock.',
                lowCount: 0
            };
        }

        // 1. Bar Graph Interpretation (SKU Catalog Diversity)
        const topSkuCat = skuBarData.entries[0];
        const topSkuPct = topSkuCat ? Math.round((topSkuCat.count / summary.total_products) * 100) : 0;
        const skuInsight = topSkuCat 
            ? `${topSkuCat.name} leads catalog diversity with ${topSkuCat.count} of ${summary.total_products} SKUs (${topSkuPct}% of all product lines).`
            : `Catalog is distributed across ${categories.length} categories.`;

        // 2. Pie/Donut Graph Interpretation (Stock Volume Distribution)
        const topDistSlice = stockDonutData.slices[0];
        const lowCount = lowStockItems.length;
        const stockInsight = topDistSlice 
            ? `${topDistSlice.name} holds the largest warehouse volume with ${topDistSlice.total.toLocaleString()} units (${topDistSlice.percentage}% of on-hand inventory).`
            : `Total stock volume is ${summary.total_items.toLocaleString()} units.`;

        // 3. Line Graph Interpretation (Capital Concentration)
        const topValPoint = valuationLineData.points[0];
        const topValPct = (topValPoint && summary.total_valuation > 0)
            ? Math.round((topValPoint.val / summary.total_valuation) * 100)
            : 0;
        const valuationInsight = topValPoint
            ? `Capital is concentrated in ${topValPoint.name} at ${formatCurrency(topValPoint.val)} (${topValPct}% of total warehouse assets).`
            : `Total asset valuation stands at ${formatCurrency(summary.total_valuation)}.`;

        // 4. Concise Health Verdict
        const healthVerdict = lowCount > 0
            ? `${lowCount} product line${lowCount > 1 ? 's are' : ' is'} below minimum threshold (≤ ${lowStockThreshold} units). Prompt replenishment recommended.`
            : 'All inventory lines maintain healthy stock thresholds with 100% order readiness.';

        return { skuInsight, stockInsight, valuationInsight, healthVerdict, lowCount };
    }, [summary, skuBarData, stockDonutData, valuationLineData, lowStockItems, lowStockThreshold, categories]);


    // Real-Time Graph Interpretation Calculations
    const realTimeAnalysis = useMemo(() => {
        const topCat = skuBarData.entries[0] || { name: 'General', count: 0 };
        const topCatPct = summary.total_products > 0 
            ? Math.round((topCat.count / summary.total_products) * 100) 
            : 0;

        const topDistSlice = stockDonutData.slices[0] || { name: 'Direct', total: 0, percentage: 0 };

        const topValuationCat = valuationLineData.points[0] || { name: 'General', val: 0 };
        const topValuationPct = summary.total_valuation > 0 
            ? Math.round((topValuationCat.val / summary.total_valuation) * 100) 
            : 0;

        const lowStockCount = summary.low_stock_count || 0;
        const lowStockPct = summary.total_products > 0 
            ? Math.round((lowStockCount / summary.total_products) * 100) 
            : 0;

        return {
            topCat,
            topCatPct,
            topDistSlice,
            topValuationCat,
            topValuationPct,
            lowStockCount,
            lowStockPct,
        };
    }, [skuBarData, stockDonutData, valuationLineData, summary]);

    // Top Selling / Highest Moving Stock Leaders (Top 3 Highlights)
    const topVolumeProducts = useMemo(() => {
        if (topMovingProducts && topMovingProducts.length > 0) {
            return topMovingProducts.slice(0, 3);
        }
        return [...warehouseInventories]
            .sort((a, b) => Number(b.quantity) - Number(a.quantity))
            .slice(0, 3);
    }, [topMovingProducts, warehouseInventories]);

    // Critical Low Stock Highlights (Top 3 Depleted Items)
    const criticalLowStockItems = useMemo(() => {
        return [...lowStockItems]
            .sort((a, b) => Number(a.quantity) - Number(b.quantity))
            .slice(0, 3);
    }, [lowStockItems]);

    // Filter Trigger
    const triggerBackendFilter = (
        searchVal: string, 
        dists: string[] = selectedDistributors, 
        cats: string[] = selectedCategories
    ) => {
        router.get('/inventory', {
            search: searchVal || undefined,
            distributors: dists.length > 0 ? dists : undefined,
            categories: cats.length > 0 ? cats : undefined,
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (value.trim().length > 0) {
            setIsTableExpanded(true);
        }
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            triggerBackendFilter(value, selectedDistributors, selectedCategories);
        }, 300);
    };

    const handleViewStockDetail = (item: InventoryItem) => {
        setSelectedStockDetail(item);
    };

    const handleLocateInTable = (item: InventoryItem) => {
        setSelectedStockDetail(null);
        setIsTableExpanded(true);
        // Find which page in sortedData contains this item
        const itemIdx = sortedData.findIndex(d => d.id === item.id);
        if (itemIdx !== -1) {
            const targetPage = Math.floor(itemIdx / pageSize) + 1;
            setPage(targetPage);
        }
        setHighlightedRowId(item.id);
        setTimeout(() => {
            const rowEl = document.getElementById(`inventory-row-${item.id}`);
            if (rowEl) {
                rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const tableEl = document.getElementById('inventory-catalog-table');
                if (tableEl) {
                    tableEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }, 200);
        setTimeout(() => setHighlightedRowId(null), 3500);
    };

    const openStockModal = (type: 'in' | 'out' | 'adjust', itemOrId?: InventoryItem | number) => {
        setStockModalType(type);
        setMovementError(null);
        if (itemOrId && typeof itemOrId === 'object') {
            setSelectedInventoryId(itemOrId.id);
            setSelectedProductId(itemOrId.product_id);
        } else if (itemOrId && typeof itemOrId === 'number') {
            const match = inventories.find(i => i.id === itemOrId || i.product_id === itemOrId);
            setSelectedInventoryId(match ? match.id : null);
            setSelectedProductId(match ? match.product_id : itemOrId);
        } else {
            const first = inventories[0] || (allInventories && allInventories[0]);
            setSelectedInventoryId(first ? first.id : null);
            setSelectedProductId(first ? first.product_id : (productList[0]?.id ?? ''));
        }
        setModalProductSearch('');
        setIsProductDropdownOpen(false);
        setMovementQuantity(type === 'adjust' ? 0 : 1);
        setMovementReason(
            type === 'in' ? 'Purchase Arrival / Delivery' :
            type === 'out' ? 'Customer Dispatch / Sales' : 'Physical Audit Correction'
        );
        setMovementRemarks('');
    };

    const handleSubmitMovement = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || !stockModalType) {
            setMovementError('Please select a product.');
            return;
        }

        setMovementError(null);
        setIsSubmittingMovement(true);

        const url = 
            stockModalType === 'in' ? '/inventory/stock-in' :
            stockModalType === 'out' ? '/inventory/stock-out' : '/inventory/adjust';

        const payload = stockModalType === 'adjust'
            ? {
                inventory_id: selectedInventoryId ? Number(selectedInventoryId) : undefined,
                product_id: Number(selectedProductId),
                new_quantity: movementQuantity,
                reason: movementReason,
                remarks: movementRemarks
            }
            : {
                inventory_id: selectedInventoryId ? Number(selectedInventoryId) : undefined,
                product_id: Number(selectedProductId),
                quantity: movementQuantity,
                reason: movementReason,
                remarks: movementRemarks
            };

        router.post(url, payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmittingMovement(false);
                const flashError = (page.props as any)?.flash?.error;
                if (flashError) {
                    setMovementError(flashError);
                } else {
                    setStockModalType(null);
                }
            },
            onError: (errs) => {
                setIsSubmittingMovement(false);
                const first = Object.values(errs)[0];
                setMovementError(typeof first === 'string' ? first : 'Failed to record movement.');
            }
        });
    };

    const handleCreateUnit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUnitName.trim() || !newUnitSymbol.trim()) return;

        setUnitError(null);
        setIsSubmittingUnit(true);
        router.post('/units', {
            name: newUnitName.trim(),
            symbol: newUnitSymbol.trim(),
            category: newUnitCategory
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmittingUnit(false);
                const flashError = (page.props as any)?.flash?.error;
                if (flashError) {
                    setUnitError(flashError);
                } else {
                    setNewUnitName('');
                    setNewUnitSymbol('');
                }
            },
            onError: (errs) => {
                setIsSubmittingUnit(false);
                const first = Object.values(errs)[0];
                setUnitError(typeof first === 'string' ? first : 'Failed to create measurement unit.');
            }
        });
    };

    return (
        <MainLayout>
            <Head title="Inventory" />

            {/* Header section */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Boxes className="h-7 w-7 text-emerald-400" />
                        <span>Inventory</span>
                    </h1>
                </div>

                {/* Quick Movement Buttons */}
                <div className="flex items-center flex-wrap gap-2.5">
                    {canManageStock && (
                        <>
                            <button
                                type="button"
                                onClick={() => openStockModal('in')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition active:scale-95"
                            >
                                <ArrowDownRight className="h-4 w-4" />
                                <span>+ Stock In</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => openStockModal('out')}
                                className="bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-950/40 transition active:scale-95"
                            >
                                <ArrowUpRight className="h-4 w-4" />
                                <span>- Stock Out</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => openStockModal('adjust')}
                                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                            >
                                <Sliders className="h-4 w-4 text-amber-400" />
                                <span>Physical Audit</span>
                            </button>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsUnitsModalOpen(true)}
                        className="bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                    >
                        <Tag className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Measurements ({units.length})</span>
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* THREE DASHBOARD GRAPHS (BAR, PIE/DONUT, LINE)            */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                
                {/* 1. BAR GRAPH: Total Product SKUs by Category */}
                <div 
                    onClick={() => setAnalysisModalGraph('sku')}
                    className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-950/40 hover:-translate-y-0.5 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden cursor-pointer group transition-all duration-200 select-none"
                    title="Click to view full SKU catalog analysis"
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <BarChart3 className="h-4 w-4 text-emerald-400" />
                                <span>Total Product SKUs</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    {summary.total_products} SKUs
                                </span>
                                <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition-colors">
                                    Inspect ↗
                                </span>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-3">
                            {summary.total_products} <span className="text-xs font-normal text-slate-400">active items</span>
                        </div>
                    </div>

                    {/* SVG Bar Chart */}
                    <div className="space-y-2 mt-1">
                        {skuBarData.entries.map(cat => {
                            const pct = Math.round((cat.count / skuBarData.maxCount) * 100);
                            return (
                                <div key={cat.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-300 font-medium truncate max-w-[140px]">{cat.name}</span>
                                        <span className="font-bold text-emerald-400 font-mono">{cat.count} SKUs</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div 
                                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                                            style={{ width: `${Math.max(pct, 8)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Category Breakdown</span>
                        <span className="text-emerald-400 font-medium">{categories.length} Categories Total</span>
                    </div>
                </div>

                {/* 2. PIE / DONUT GRAPH: Total Units in Stock Share */}
                <div 
                    onClick={() => setAnalysisModalGraph('stock')}
                    className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-950/40 hover:-translate-y-0.5 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden cursor-pointer group transition-all duration-200 select-none"
                    title="Click to view warehouse stock share & health analysis"
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <PieIcon className="h-4 w-4 text-cyan-400" />
                                <span>Total Units in Stock</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                                    {summary.total_items.toLocaleString()} Units
                                </span>
                                <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 transition-colors">
                                    Inspect ↗
                                </span>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-cyan-300 mb-2">
                            {summary.total_items.toLocaleString()} <span className="text-xs font-normal text-slate-400">in warehouse</span>
                        </div>
                    </div>

                    {/* Donut Chart with Centered Metric */}
                    <div className="flex items-center justify-between gap-3 my-1">
                        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                {/* Base track */}
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="46"
                                    fill="none"
                                    stroke="#0f172a"
                                    strokeWidth="15"
                                />
                                {stockDonutData.slices.map((slice, i) => (
                                    <circle
                                        key={slice.name}
                                        cx="60"
                                        cy="60"
                                        r="46"
                                        fill="none"
                                        stroke={slice.color}
                                        strokeWidth="15"
                                        strokeDasharray={slice.strokeDasharray}
                                        strokeDashoffset={slice.strokeDashoffset}
                                        className="transition-all duration-700 hover:opacity-80"
                                    />
                                ))}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className="text-xs font-black text-white">{summary.total_items}</span>
                                <span className="text-[9px] text-slate-400 uppercase font-semibold">Units</span>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                            {stockDonutData.slices.map(slice => (
                                <div key={slice.name} className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 truncate max-w-[105px]">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                                        <span className="text-slate-300 truncate">{slice.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-200 font-mono">{slice.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Stock Composition</span>
                        <span className="text-cyan-400 font-medium">Distributor Share</span>
                    </div>
                </div>

                {/* 3. LINE / AREA GRAPH: Total Inventory Valuation */}
                <div 
                    onClick={() => setAnalysisModalGraph('valuation')}
                    className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-950/40 hover:-translate-y-0.5 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden cursor-pointer group transition-all duration-200 select-none"
                    title="Click to view capital valuation & asset exposure analysis"
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <LineIcon className="h-4 w-4 text-emerald-400" />
                                <span>Total Inventory Valuation</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                    Asset Value
                                </span>
                                <span className="text-[10px] text-slate-500 group-hover:text-amber-400 transition-colors">
                                    Inspect ↗
                                </span>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-300 mb-2">
                            {formatCurrency(summary.total_valuation)}
                        </div>
                    </div>

                    {/* SVG Line / Area Graph */}
                    <div className="relative h-28 w-full">
                        <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${valuationLineData.width} ${valuationLineData.height}`}>
                            <defs>
                                <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {/* Area Fill */}
                            {valuationLineData.areaD && (
                                <path d={valuationLineData.areaD} fill="url(#valGrad)" />
                            )}
                            {/* Line */}
                            {valuationLineData.pathD && (
                                <path 
                                    d={valuationLineData.pathD} 
                                    fill="none" 
                                    stroke="#10B981" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                            )}
                            {/* Glowing Data Dots */}
                            {valuationLineData.points.map((p, i) => (
                                <g key={i}>
                                    <circle cx={p.x} cy={p.y} r="4" fill="#047857" stroke="#34D399" strokeWidth="2" />
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Dynamic Valuation Curve</span>
                        <span className="text-emerald-400 font-mono">Σ (Qty × Cost)</span>
                    </div>
                </div>

            </div>

            {/* ======================================================== */}
            {/* DECISION-MAKING ROW: TOP MOVING SKUs & OWNER LOW STOCK   */}
            {/* ======================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                
                {/* Widget A: Top Moving Products / High Volume Stock */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Flame className="h-4 w-4 text-amber-400" />
                                <span>Top Moving Products / High Volume Stock</span>
                            </h2>
                        </div>

                        {topVolumeProducts.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                                <Boxes className="h-8 w-8 text-slate-600" />
                                <span>No inventory records found.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {topVolumeProducts.map((item, idx) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleViewStockDetail(item)}
                                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/60 hover:bg-slate-950/90 transition-all cursor-pointer group shadow-sm flex flex-col justify-between hover:-translate-y-0.5"
                                        title={`Click to view ${item.product_name} details`}
                                    >
                                        <div>
                                            {/* Picture Frame */}
                                            <div className="relative w-full h-28 sm:h-32 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-center p-2 overflow-hidden mb-2.5 group-hover:border-emerald-500/30 transition">
                                                <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold">
                                                    #{idx + 1}
                                                </span>
                                                <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-emerald-400 font-mono text-[10px] font-bold">
                                                    {item.quantity} {item.unit?.symbol || 'units'}
                                                </span>
                                                <ProductThumbnail 
                                                    src={item.image} 
                                                    alt={item.product_name} 
                                                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                                                    fallbackIconSize="h-10 w-10"
                                                />
                                            </div>

                                            {/* Product Name */}
                                            <div className="text-xs font-bold text-white text-center line-clamp-2 group-hover:text-emerald-300 transition min-h-[2rem] flex items-center justify-center" title={item.product_name}>
                                                {item.product_name}
                                            </div>
                                        </div>

                                        {/* View Stock Option */}
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewStockDetail(item);
                                            }}
                                            className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform"
                                        >
                                            <span>View Stock</span>
                                            <ArrowDownRight className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Widget B: Critical Low Stock Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert className="h-4 w-4 text-rose-500" />
                                <span>Critical Low Stock Alerts ({lowStockItems.length})</span>
                            </h2>
                            <span className="text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full">
                                Threshold: ≤ {lowStockThreshold}
                            </span>
                        </div>

                        {lowStockItems.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                                <CheckCircle className="h-8 w-8 text-emerald-400" />
                                <span>All items meet or exceed required stock levels. Zero stockout risk!</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {criticalLowStockItems.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => handleViewStockDetail(item)}
                                        className="p-3 rounded-xl bg-slate-950 border-2 border-rose-900/60 hover:border-rose-500 hover:bg-slate-950/90 transition-all cursor-pointer group shadow-sm flex flex-col justify-between hover:-translate-y-0.5"
                                        title={`Click to view ${item.product_name} details`}
                                    >
                                        <div>
                                            {/* Picture Frame */}
                                            <div className="relative w-full h-28 sm:h-32 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-center p-2 overflow-hidden mb-2.5 group-hover:border-rose-500/40 transition">
                                                <span className="absolute top-1.5 right-1.5 z-10 px-2 py-0.5 rounded bg-rose-950/90 border border-rose-700/60 text-rose-400 font-mono text-[11px] font-black">
                                                    {item.quantity} {item.unit?.symbol || 'units'}
                                                </span>
                                                <ProductThumbnail 
                                                    src={item.image} 
                                                    alt={item.product_name} 
                                                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-200"
                                                    fallbackIconSize="h-10 w-10"
                                                />
                                            </div>

                                            {/* Product Name */}
                                            <div className="text-xs font-bold text-white text-center line-clamp-2 group-hover:text-rose-300 transition min-h-[2rem] flex items-center justify-center" title={item.product_name}>
                                                {item.product_name}
                                            </div>
                                        </div>

                                        {/* View Stock Option */}
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewStockDetail(item);
                                            }}
                                            className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[11px] text-rose-400 font-semibold group-hover:translate-x-0.5 transition-transform"
                                        >
                                            <span>View Stock</span>
                                            <ArrowDownRight className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ======================================================== */}
            {/* SEARCH-FIRST FILTER CONSOLE                              */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl mb-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                        <input
                            type="text"
                            placeholder="Search product name, SKU code (e.g. WNZ-PEP-REG), or category..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition shadow-inner font-sans"
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

                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => handleSearchChange('')}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition shrink-0"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Clear Search</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* INVENTORY TABLE: 1-3 ROWS SNAPSHOT OR EXPANDED FULL TABLE*/}
            {/* ======================================================== */}
            <div id="inventory-catalog-table" className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8 scroll-mt-6">
                
                {/* Table Header Bar */}
                <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/40">
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <span>Warehouse Inventory Catalog</span>
                            <span className="text-xs bg-slate-800 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                                {sortedData.length} Total SKUs
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {!isTableExpanded && !searchQuery.trim() 
                                ? 'Displaying 1-3 quick snapshot rows. Click "View All & Search" to view the complete catalog.' 
                                : `Viewing records (${paginatedData.length} items on page ${currentPage} of ${totalPages || 1})`}
                        </p>
                    </div>

                    {/* Toggle Button: View All vs Snapshot */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setIsTableExpanded(prev => !prev)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm"
                        >
                            {isTableExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    <span>Switch to Search-First View</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    <span>Browse All Records ({sortedData.length} items)</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                                <SortableHeader label="SKU Code" sortKey="sku" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap pl-4" />
                                <SortableHeader label="Category" sortKey="category" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Product Name" sortKey="product_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} />
                                <SortableHeader label="Distributor" sortKey="distributor_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                <SortableHeader label="Purchase Price" sortKey="purchase_price" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                <SortableHeader label="Stock & Unit" sortKey="quantity" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="center" className="whitespace-nowrap" />
                                <SortableHeader label="Stock Status" sortKey="stock_status" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="center" className="whitespace-nowrap" />
                                <SortableHeader label="Total Valuation" sortKey="total_valuation" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                <th className="py-3 px-3 text-center whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                            {displayedData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-500">
                                        No inventory records matched your search query.
                                    </td>
                                </tr>
                            ) : (
                                displayedData.map((item) => {
                                    const isLowStock = item.quantity <= lowStockThreshold;
                                    const unitSymbol = item.unit?.symbol || (item.sku?.split('-')[3] || 'units');

                                    return (
                                        <tr 
                                            key={item.id} 
                                            id={`inventory-row-${item.id}`}
                                            className={`transition-colors duration-500 ${
                                                highlightedRowId === item.id 
                                                    ? 'bg-emerald-950/70 border-y-2 border-emerald-500' 
                                                    : 'hover:bg-slate-850/80'
                                            }`}
                                        >
                                            <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                                {item.sku}
                                            </td>
                                            <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700 whitespace-nowrap">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-white">
                                                {item.product_name}
                                            </td>
                                            <td className="py-3 px-3 text-slate-300">
                                                {item.distributor_name}
                                            </td>
                                            <td className="py-3 px-3 text-right text-slate-300 font-mono">
                                                {formatCurrency(item.purchase_price)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className={`inline-flex items-center gap-1.5 font-bold font-mono text-xs px-2.5 py-1 rounded-full ${
                                                        isLowStock ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                                                    }`}>
                                                        <span className="text-sm font-black">{item.quantity.toLocaleString()}</span>
                                                        <span className="text-[11px] text-slate-300 font-sans font-semibold">
                                                            {item.product?.size_value 
                                                                ? `${item.product.size_value}${item.product?.unit?.symbol || item.unit?.symbol || ''}` 
                                                                : (item.product?.unit?.symbol || item.unit?.symbol || 'units')}
                                                            {item.product?.packaging ? ` (${item.product.packaging})` : ''}
                                                        </span>
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5 font-sans">
                                                        Total Stock
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                                    isLowStock ? 'text-rose-400 bg-rose-950/40' : 'text-emerald-400 bg-emerald-950/40'
                                                }`}>
                                                    {item.stock_status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono font-bold text-emerald-300">
                                                {formatCurrency(item.total_valuation || 0)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                {canManageStock ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openStockModal('in', item.product_id)}
                                                            className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/50 rounded-lg text-[10px] font-bold transition"
                                                            title="Add Stock In"
                                                        >
                                                            + In
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openStockModal('out', item.product_id)}
                                                            className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-700/50 rounded-lg text-[10px] font-bold transition"
                                                            title="Stock Out / Sales"
                                                        >
                                                            - Out
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openStockModal('adjust', item.product_id)}
                                                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] transition"
                                                            title="Audit / Adjust"
                                                        >
                                                            Adjust
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-slate-500 italic">View Only</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TEASER FOOTER (When collapsed to 3 rows) */}
                {!isTableExpanded && !searchQuery.trim() && sortedData.length > 3 ? (
                    <div className="relative overflow-hidden border-t border-slate-800 bg-gradient-to-b from-slate-950/80 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-slate-300 font-medium">
                                Teaser preview: Showing <strong className="text-white font-bold">top 3</strong> of <strong className="text-emerald-400 font-mono font-bold">{sortedData.length}</strong> catalog items
                            </span>
                            <span className="hidden md:inline-block text-[11px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700">
                                +{sortedData.length - 3} more records available
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setIsFullTableModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-95"
                            >
                                <Maximize2 className="h-3.5 w-3.5" />
                                <span>View Full Table in Modal ({sortedData.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsTableExpanded(true)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                                <span>Expand Inline</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* PAGINATION BAR (When expanded or searched) */
                    <div className="border-t border-slate-800 bg-slate-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-300">
                                Viewing all records inline ({sortedData.length} items)
                            </span>
                            {!searchQuery.trim() && (
                                <button
                                    type="button"
                                    onClick={() => setIsTableExpanded(false)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-semibold transition"
                                >
                                    <ChevronUp className="h-3 w-3" />
                                    <span>Collapse to Teaser (3 rows)</span>
                                </button>
                            )}
                        </div>
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* STOCK MOVEMENT MODAL (IN / OUT / ADJUST)                 */}
            {/* ======================================================== */}
            {stockModalType && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setStockModalType(null); }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
                >
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                        <button
                            type="button"
                            onClick={() => setStockModalType(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            {stockModalType === 'in' ? (
                                <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                    <ArrowDownRight className="h-5 w-5" />
                                </div>
                            ) : stockModalType === 'out' ? (
                                <div className="h-10 w-10 rounded-xl bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-400">
                                    <ArrowUpRight className="h-5 w-5" />
                                </div>
                            ) : (
                                <div className="h-10 w-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
                                    <Sliders className="h-5 w-5" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-base font-bold text-white">
                                    {stockModalType === 'in' ? 'Record Stock In (Delivery / Restock)' :
                                     stockModalType === 'out' ? 'Record Stock Out (Dispatch / Sales)' : 'Physical Inventory Adjustment'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {stockModalType === 'adjust' ? 'Update physical counted quantity with audit justification' : 'Logs movement into warehouse records'}
                                </p>
                            </div>
                        </div>

                        {movementError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                                <span>{movementError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmitMovement} className="space-y-4">
                            {/* REAL-TIME SEARCHABLE PRODUCT COMBOBOX */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                                    <span>Select Product (Real-Time Search) *</span>
                                    {selectedProductObj && (
                                        <span className="text-[11px] font-mono text-emerald-400">
                                            {selectedProductInventory ? `${selectedProductInventory.quantity} units on-hand` : '0 in warehouse'}
                                        </span>
                                    )}
                                </label>

                                {/* Selected Product Summary Card / Active Trigger */}
                                {!isProductDropdownOpen && selectedProductObj ? (
                                    <div className="p-3 bg-slate-950 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3 group hover:border-emerald-500/50 transition">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-bold text-white truncate">
                                                    {selectedProductObj.name}
                                                </span>
                                                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded border border-slate-700 shrink-0">
                                                    {selectedProductObj.category}
                                                </span>
                                            </div>
                                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                                                <span>SKU:</span>
                                                <span className="font-mono font-bold text-emerald-400">
                                                    {selectedProductObj.sku || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsProductDropdownOpen(true);
                                                setModalProductSearch('');
                                            }}
                                            className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition border border-slate-700 shrink-0 flex items-center gap-1.5 active:scale-95"
                                        >
                                            <Search className="h-3 w-3 text-emerald-400" />
                                            <span>Change</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 border border-emerald-500/50 bg-slate-950 p-2.5 rounded-xl shadow-lg">
                                        {/* Search Input Box */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                                            <input
                                                type="text"
                                                autoFocus
                                                value={modalProductSearch}
                                                onChange={(e) => setModalProductSearch(e.target.value)}
                                                placeholder="Search by SKU, product name, or category..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                                            />
                                            {modalProductSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setModalProductSearch('')}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Filtered Dropdown Results List */}
                                        <div className="max-h-52 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-850">
                                            {filteredModalProducts.length === 0 ? (
                                                <div className="py-4 text-center text-xs text-slate-500">
                                                    No products found matching "{modalProductSearch}"
                                                </div>
                                            ) : (
                                                filteredModalProducts.map(p => {
                                                    const isSelected = selectedInventoryId 
                                                        ? selectedInventoryId === p.inventory_id 
                                                        : selectedProductId === p.id;
                                                    return (
                                                        <div
                                                            key={p.inventory_id ? `inv-${p.inventory_id}` : `prod-${p.id}`}
                                                            onClick={() => {
                                                                setSelectedInventoryId(p.inventory_id);
                                                                setSelectedProductId(p.id);
                                                                setIsProductDropdownOpen(false);
                                                                setModalProductSearch('');
                                                            }}
                                                            className={`p-2 rounded-lg cursor-pointer transition flex items-center justify-between gap-2 ${
                                                                isSelected 
                                                                    ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' 
                                                                    : 'hover:bg-slate-850 text-slate-300 hover:text-white'
                                                            }`}
                                                        >
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-xs truncate">
                                                                        {p.name}
                                                                    </span>
                                                                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                                                                        {p.category}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                                                                    {p.sku}
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded text-slate-300 block">
                                                                    {p.quantity} on-hand
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>

                                        {selectedProductObj && (
                                            <div className="pt-1.5 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsProductDropdownOpen(false)}
                                                    className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                                                >
                                                    Done / Keep current selection
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                    {stockModalType === 'adjust' ? 'Verified Physical Count Quantity' : 'Quantity Units'}
                                </label>
                                <input
                                    type="number"
                                    min={stockModalType === 'adjust' ? 0 : 1}
                                    value={movementQuantity}
                                    onChange={(e) => setMovementQuantity(Number(e.target.value))}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Movement Reason</label>
                                <input
                                    type="text"
                                    value={movementReason}
                                    onChange={(e) => setMovementReason(e.target.value)}
                                    placeholder="e.g. Purchase Arrival, Order Dispatch, Spillage Correction"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Remarks / Invoice Ref (Optional)</label>
                                <input
                                    type="text"
                                    value={movementRemarks}
                                    onChange={(e) => setMovementRemarks(e.target.value)}
                                    placeholder="e.g. PO-8921 or Delivery Receipt #441"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setStockModalType(null)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingMovement}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                                >
                                    {isSubmittingMovement ? 'Recording...' : 'Confirm Movement'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MEASUREMENTS / SUBCATEGORIES MODAL                       */}
            {/* ======================================================== */}
            {isUnitsModalOpen && (
                <div 
                    onClick={(e) => { if (e.target === e.currentTarget) setIsUnitsModalOpen(false); }}
                    className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
                >
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                        <button
                            type="button"
                            onClick={() => setIsUnitsModalOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white">Measurement Units & Subcategories</h3>
                                <p className="text-xs text-slate-400">Standardized units for product size, packaging & volume</p>
                            </div>
                        </div>

                        {/* Existing Units List */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-slate-300 mb-2">Available Measurement Units ({units.length})</label>
                            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                                {units.map(u => (
                                    <span key={u.id} className="inline-flex items-center gap-1 text-xs bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-slate-200">
                                        <span className="font-bold text-emerald-400">{u.symbol}</span>
                                        <span className="text-slate-400 text-[11px]">({u.name})</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Add Unit Form */}
                        {isOwnerOrAdmin && (
                            <form onSubmit={handleCreateUnit} className="pt-3 border-t border-slate-800 space-y-3">
                                {unitError && (
                                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                                        <span>{unitError}</span>
                                    </div>
                                )}
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Add New Measurement Unit</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] text-slate-400 mb-1">Unit Name</label>
                                        <input
                                            type="text"
                                            value={newUnitName}
                                            onChange={(e) => setNewUnitName(e.target.value.toUpperCase())}
                                            placeholder="e.g. CENTILITER"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] text-slate-400 mb-1">Symbol / Code</label>
                                        <input
                                            type="text"
                                            value={newUnitSymbol}
                                            onChange={(e) => setNewUnitSymbol(e.target.value.toUpperCase())}
                                            placeholder="e.g. CL"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <select
                                        value={newUnitCategory}
                                        onChange={(e: any) => setNewUnitCategory(e.target.value)}
                                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                    >
                                        <option value="volume">Volume (mL, L, oz)</option>
                                        <option value="weight">Weight (g, kg)</option>
                                        <option value="package">Package (PET, RGB, Case)</option>
                                        <option value="count">Count (Piece, Box)</option>
                                    </select>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingUnit}
                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                                    >
                                        {isSubmittingUnit ? 'Saving...' : '+ Add Unit'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}


            {/* ======================================================== */}
            {/* GRAPH DEEP-DIVE ANALYSIS MODAL                           */}
            {/* ======================================================== */}
            {analysisModalGraph && (
                <div 
                    className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={() => setAnalysisModalGraph(null)}
                >
                    <div 
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[88vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setAnalysisModalGraph(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                            {analysisModalGraph === 'sku' ? (
                                <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                            ) : analysisModalGraph === 'stock' ? (
                                <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                                    <PieIcon className="h-5 w-5" />
                                </div>
                            ) : (
                                <div className="h-10 w-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
                                    <LineIcon className="h-5 w-5" />
                                </div>
                            )}
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>
                                        {analysisModalGraph === 'sku' ? 'SKU Catalog Diversity & Concentration Analysis' :
                                         analysisModalGraph === 'stock' ? 'Physical Stock Volume & Health Share Analysis' :
                                         'Working Capital & Inventory Valuation Analysis'}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>Real-Time Graph Interpretation</span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-mono">Live Database Query</span>
                                </p>
                            </div>
                        </div>

                        {/* Modal Content Body */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            
                            {/* Summary Interpretation Callout */}
                            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs text-slate-300 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>Executive Interpretation:</span>
                                </div>
                                <p className="leading-relaxed">
                                    {analysisModalGraph === 'sku' ? (
                                        <>
                                            The warehouse currently maintains <strong className="text-white">{summary.total_products} unique product SKUs</strong> cataloged across <strong className="text-white">{categories.length} categories</strong>. The leading segment is <strong className="text-emerald-400">{realTimeAnalysis.topCat.name}</strong> with <strong className="text-white">{realTimeAnalysis.topCat.count} SKUs ({realTimeAnalysis.topCatPct}% of all product lines)</strong>, demonstrating strong product assortment depth.
                                        </>
                                    ) : analysisModalGraph === 'stock' ? (
                                        <>
                                            Total physical stock stands at <strong className="text-white">{summary.total_items.toLocaleString()} units</strong>. <strong className="text-cyan-400">{realTimeAnalysis.topDistSlice.name}</strong> accounts for the largest warehouse space with <strong className="text-white">{realTimeAnalysis.topDistSlice.total.toLocaleString()} units ({realTimeAnalysis.topDistSlice.percentage}%)</strong>.
                                            {realTimeAnalysis.lowStockCount > 0 ? (
                                                <span className="text-rose-400 block mt-1">
                                                    ⚠️ Warning: {realTimeAnalysis.lowStockCount} items ({realTimeAnalysis.lowStockPct}%) have reached or dropped below the minimum safety threshold (≤ {lowStockThreshold}).
                                                </span>
                                            ) : (
                                                <span className="text-emerald-400 block mt-1">
                                                    ✓ Stock Health: 100% of SKUs meet or exceed required safety stock levels.
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            Total capital allocated across warehouse stock is <strong className="text-emerald-300">{formatCurrency(summary.total_valuation)}</strong>. The highest monetary investment is in <strong className="text-white">{realTimeAnalysis.topValuationCat.name}</strong> at <strong className="text-white">{formatCurrency(realTimeAnalysis.topValuationCat.val || 0)} ({realTimeAnalysis.topValuationPct}%)</strong> of valuation.
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Detailed Breakdown Table */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                                    {analysisModalGraph === 'sku' ? 'Category SKU Breakdown Table' :
                                     analysisModalGraph === 'stock' ? 'Distributor On-Hand Volume Share Table' :
                                     'Valuation Breakdown by Category Table'}
                                </h4>

                                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="bg-slate-900/90 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                                                <th className="py-2.5 px-3">Segment Name</th>
                                                <th className="py-2.5 px-3 text-right">
                                                    {analysisModalGraph === 'sku' ? 'SKUs' :
                                                     analysisModalGraph === 'stock' ? 'Units in Stock' : 'Asset Valuation'}
                                                </th>
                                                <th className="py-2.5 px-3 text-right">Share (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/80 font-mono">
                                            {analysisModalGraph === 'sku' ? (
                                                skuBarData.entries.map(e => (
                                                    <tr key={e.name} className="hover:bg-slate-900/50">
                                                        <td className="py-2 px-3 text-slate-200 font-sans font-medium">{e.name}</td>
                                                        <td className="py-2 px-3 text-right text-emerald-400 font-bold">{e.count}</td>
                                                        <td className="py-2 px-3 text-right text-slate-400">
                                                            {summary.total_products > 0 ? Math.round((e.count / summary.total_products) * 100) : 0}%
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : analysisModalGraph === 'stock' ? (
                                                stockDonutData.slices.map(s => (
                                                    <tr key={s.name} className="hover:bg-slate-900/50">
                                                        <td className="py-2 px-3 text-slate-200 font-sans font-medium flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                                            <span>{s.name}</span>
                                                        </td>
                                                        <td className="py-2 px-3 text-right text-cyan-400 font-bold">{s.total.toLocaleString()}</td>
                                                        <td className="py-2 px-3 text-right text-slate-400">{s.percentage}%</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                valuationLineData.points.map(p => (
                                                    <tr key={p.name} className="hover:bg-slate-900/50">
                                                        <td className="py-2 px-3 text-slate-200 font-sans font-medium">{p.name}</td>
                                                        <td className="py-2 px-3 text-right text-emerald-300 font-bold">{formatCurrency(p.val || 0)}</td>
                                                        <td className="py-2 px-3 text-right text-slate-400">
                                                            {summary.total_valuation > 0 ? Math.round(((p.val || 0) / summary.total_valuation) * 100) : 0}%
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Strategic Recommendation */}
                            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                                <strong className="text-slate-200 font-bold">Actionable Recommendation: </strong>
                                {analysisModalGraph === 'sku' ? (
                                    <span>Expand offerings in lower-SKU categories to balance catalog breadth while maintaining high turnover in {realTimeAnalysis.topCat.name}.</span>
                                ) : analysisModalGraph === 'stock' ? (
                                    <span>Ensure safety stock levels are prioritized for fast-moving items, and reorder from {realTimeAnalysis.topDistSlice.name} on planned delivery schedules.</span>
                                ) : (
                                    <span>Audit pricing margins and payment terms with vendors in {realTimeAnalysis.topValuationCat.name} to optimize capital turnover.</span>
                                )}
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setAnalysisModalGraph(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                            >
                                Close Inspection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* STOCK DETAILS MODAL (NON-DESTRUCTIVE VIEW)               */}
            {/* ======================================================== */}
            {selectedStockDetail && (
                <div 
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
                    onClick={() => setSelectedStockDetail(null)}
                >
                    <div 
                        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                    <Boxes className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Stock Details
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-mono">
                                        {selectedStockDetail.sku}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedStockDetail(null)}
                                className="h-8 w-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Product Info Card */}
                            <div className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                                <div className="relative w-20 h-20 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                                    <ProductThumbnail
                                        src={selectedStockDetail.image}
                                        alt={selectedStockDetail.product_name}
                                        className="h-full w-full object-contain"
                                        fallbackIconSize="h-8 w-8"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 uppercase">
                                        {selectedStockDetail.category || 'General'}
                                    </span>
                                    <h4 className="text-sm font-bold text-white mt-1 leading-snug break-words">
                                        {selectedStockDetail.product_name}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                        <Truck className="h-3 w-3 text-slate-500" />
                                        <span>{selectedStockDetail.distributor_name || 'Direct / General'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        On-Hand Stock
                                    </span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className={`text-xl font-black font-mono ${
                                            selectedStockDetail.quantity <= lowStockThreshold ? 'text-rose-400' : 'text-emerald-400'
                                        }`}>
                                            {selectedStockDetail.quantity.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {selectedStockDetail.product?.size_value 
                                                ? `${selectedStockDetail.product.size_value}${selectedStockDetail.product?.unit?.symbol || selectedStockDetail.unit?.symbol || ''}` 
                                                : (selectedStockDetail.product?.unit?.symbol || selectedStockDetail.unit?.symbol || 'units')}
                                        </span>
                                    </div>
                                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                                        selectedStockDetail.quantity <= lowStockThreshold 
                                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' 
                                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                                    }`}>
                                        {selectedStockDetail.quantity <= lowStockThreshold ? 'Critical Low Stock' : 'Healthy Stock'}
                                    </span>
                                </div>

                                <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-2xl">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Total Asset Value
                                    </span>
                                    <div className="text-xl font-black font-mono text-emerald-400">
                                        {formatCurrency((Number(selectedStockDetail.quantity) || 0) * (Number(selectedStockDetail.purchase_price) || 0))}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                                        Unit: {formatCurrency(Number(selectedStockDetail.purchase_price) || 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-2">
                                {canManageStock && (
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const item = selectedStockDetail;
                                                setSelectedStockDetail(null);
                                                openStockModal('in', item);
                                            }}
                                            className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-lg shadow-emerald-950/50"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            <span>Stock In</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const item = selectedStockDetail;
                                                setSelectedStockDetail(null);
                                                openStockModal('out', item);
                                            }}
                                            className="px-3 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-lg shadow-rose-950/50"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                            <span>Stock Out</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const item = selectedStockDetail;
                                                setSelectedStockDetail(null);
                                                openStockModal('adjust', item);
                                            }}
                                            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                                        >
                                            <Sliders className="h-3.5 w-3.5" />
                                            <span>Audit</span>
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleLocateInTable(selectedStockDetail)}
                                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                                >
                                    <ArrowDownRight className="h-4 w-4" />
                                    <span>Locate in Catalog Table</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* FULL TABLE MODAL: COMPLETE INVENTORY CATALOG EXPLORER    */}
            {/* ======================================================== */}
            {isFullTableModalOpen && (
                <div className="fixed inset-0 z-[55] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                    <Maximize2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <span>Warehouse Inventory Catalog — Full Table Explorer</span>
                                        <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                            {sortedData.length} Total SKUs
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-400">Complete, distraction-free dataset view with live sorting, pagination, and stock movements</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsFullTableModalOpen(false)}
                                className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
                                title="Close Full Table (ESC)"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body: Scrollable Table */}
                        <div className="flex-1 overflow-auto bg-slate-900/40">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800 shadow-sm">
                                        <SortableHeader label="SKU Code" sortKey="sku" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap pl-4" />
                                        <SortableHeader label="Category" sortKey="category" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                        <SortableHeader label="Product Name" sortKey="product_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} />
                                        <SortableHeader label="Distributor" sortKey="distributor_name" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} className="whitespace-nowrap" />
                                        <SortableHeader label="Purchase Price" sortKey="purchase_price" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                        <SortableHeader label="Stock & Unit" sortKey="quantity" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="center" className="whitespace-nowrap" />
                                        <SortableHeader label="Stock Status" sortKey="stock_status" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="center" className="whitespace-nowrap" />
                                        <SortableHeader label="Total Valuation" sortKey="total_valuation" currentSortKey={sortConfig?.key || null} currentDirection={sortConfig?.direction || 'asc'} onSort={requestSort} align="right" className="whitespace-nowrap" />
                                        <th className="py-3 px-3 text-center whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                                    {paginatedData.map((item) => {
                                        const isLowStock = item.quantity <= lowStockThreshold;
                                        return (
                                            <tr 
                                                key={item.id}
                                                id={`modal-inventory-row-${item.id}`}
                                                className={`transition-colors duration-500 ${
                                                    highlightedRowId === item.id 
                                                        ? 'bg-emerald-950/70 border-y-2 border-emerald-500' 
                                                        : 'hover:bg-slate-850/80'
                                                }`}
                                            >
                                                <td className="py-3 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                                                    {item.sku}
                                                </td>
                                                <td className="py-3 px-3 text-slate-300 font-medium whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700 whitespace-nowrap">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-semibold text-white">
                                                    {item.product_name}
                                                </td>
                                                <td className="py-3 px-3 text-slate-300">
                                                    {item.distributor_name}
                                                </td>
                                                <td className="py-3 px-3 text-right text-slate-300 font-mono">
                                                    {formatCurrency(item.purchase_price)}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <div className="inline-flex flex-col items-center">
                                                        <span className={`inline-flex items-center gap-1.5 font-bold font-mono text-xs px-2.5 py-1 rounded-full ${
                                                            isLowStock ? 'bg-rose-950/80 text-rose-300 border border-rose-800/50' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                                                        }`}>
                                                            <span className="text-sm font-black">{item.quantity.toLocaleString()}</span>
                                                            <span className="text-[11px] text-slate-300 font-sans font-semibold">
                                                                {item.product?.size_value 
                                                                    ? `${item.product.size_value}${item.product?.unit?.symbol || item.unit?.symbol || ''}` 
                                                                    : (item.product?.unit?.symbol || item.unit?.symbol || 'units')}
                                                                {item.product?.packaging ? ` (${item.product.packaging})` : ''}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                                        isLowStock ? 'text-rose-400 bg-rose-950/40' : 'text-emerald-400 bg-emerald-950/40'
                                                    }`}>
                                                        {item.stock_status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-300">
                                                    {formatCurrency(item.total_valuation || 0)}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    {canManageStock ? (
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openStockModal('in', item.product_id)}
                                                                className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/50 rounded-lg text-[10px] font-bold transition"
                                                                title="Add Stock In"
                                                            >
                                                                + In
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openStockModal('out', item.product_id)}
                                                                className="px-2 py-1 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-700/50 rounded-lg text-[10px] font-bold transition"
                                                                title="Stock Out / Sales"
                                                            >
                                                                - Out
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openStockModal('adjust', item.product_id)}
                                                                className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[10px] transition"
                                                                title="Audit / Adjust"
                                                            >
                                                                Adjust
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-500 italic">View Only</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Modal Footer: Full Pagination & Close */}
                        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsFullTableModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
                            >
                                Back to Dashboard
                            </button>
                            <TablePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                startIndex={startIndex}
                                endIndex={endIndex}
                                pageSize={pageSize}
                                onPageChange={setPage}
                                onPageSizeChange={setPageSize}
                            />
                        </div>
                    </div>
                </div>
            )}

        </MainLayout>
    );
}
