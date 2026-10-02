import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { exportSalesPurchaseExcel } from '@/utils/exportTemplateExcel';
import {
    Truck,
    PackagePlus,
    TrendingUp,
    Boxes,
    ShieldCheck,
    CheckCircle2,
    Calendar,
    FileSpreadsheet,
    Download,
    Star,
    RefreshCw,
    ExternalLink,
    ArrowRight,
    Sparkles,
    RotateCcw,
    Trash2,
    DollarSign,
    Users,
    Crown,
    ClipboardCheck,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    Eye,
    Plus,
    X,
    Building2,
    Archive,
    Check,
    Lock
} from 'lucide-react';

export default function GuideIndex() {
    const [activeSection, setActiveSection] = useState<'flow' | 'distributors' | 'products' | 'delivery_sync' | 'spreadsheet' | 'roles'>('flow');

    // -------------------------------------------------------------
    // INTERACTIVE DEMO 1: EXACT DISTRIBUTOR CARD & DETAILS MODAL
    // -------------------------------------------------------------
    const [demoDistStarred, setDemoDistStarred] = useState(true);
    const [demoDistArchived, setDemoDistArchived] = useState(false);
    const [demoDistModalOpen, setDemoDistModalOpen] = useState(false);

    // -------------------------------------------------------------
    // INTERACTIVE DEMO 2: PRODUCT CATALOG & PRICING
    // -------------------------------------------------------------
    const [prodPurchasePrice, setProdPurchasePrice] = useState(114);
    const [prodSellingPrice, setProdSellingPrice] = useState(120);
    const prodMargin = prodSellingPrice - prodPurchasePrice;
    const prodMarginPct = prodPurchasePrice > 0 ? ((prodMargin / prodPurchasePrice) * 100).toFixed(1) : '0';

    // -------------------------------------------------------------
    // INTERACTIVE DEMO 3: SALES & PURCHASE DELIVERY & SHELF AUTO-SYNC
    // -------------------------------------------------------------
    const [deliveryQty, setDeliveryQty] = useState(20);
    const [deliveryCost, setDeliveryCost] = useState(114);
    const [deliverySelling, setDeliverySelling] = useState(120);
    const [shelfStock, setShelfStock] = useState(35);
    const [deliveryCelebration, setDeliveryCelebration] = useState(false);

    const calcTotalPurchase = deliveryQty * deliveryCost;
    const calcDiscount = deliverySelling - deliveryCost;
    const calcGrossAmount = deliveryQty * deliverySelling;
    const calcVatAdjusted = calcGrossAmount * 0.88;
    const calcNetProfit = calcGrossAmount - calcTotalPurchase;

    const handleSimulateDelivery = (casesToAdd: number) => {
        setDeliveryQty(casesToAdd);
        setShelfStock(prev => prev + casesToAdd);
        setDeliveryCelebration(true);
        setTimeout(() => setDeliveryCelebration(false), 2400);
    };

    const handleResetShelf = () => {
        setShelfStock(35);
        setDeliveryQty(20);
        setDeliveryCelebration(false);
    };

    // -------------------------------------------------------------
    // INTERACTIVE DEMO 4: EXCEL TEST DOWNLOAD
    // -------------------------------------------------------------
    const [isDownloadingSample, setIsDownloadingSample] = useState(false);
    const handleDownloadSampleExcel = async () => {
        setIsDownloadingSample(true);
        try {
            const sampleRows = [
                {
                    date: '2026-10-01',
                    provider: 'PEPSI',
                    quantity: 10,
                    product_name: 'Pep Reg 195ml PET/12',
                    purchase_price: 114,
                    total_purchase: 1140,
                    dealing_price: 120,
                    discount: 6,
                    gross_amount: 1200,
                    vat_percentage: 12,
                    vat_adjusted_amount: 1056,
                    net_profit: 60,
                },
                {
                    date: '2026-10-01',
                    provider: 'PEPSI',
                    quantity: 10,
                    product_name: 'Pep Reg 290ml PET/12',
                    purchase_price: 176,
                    total_purchase: 1760,
                    dealing_price: 184,
                    discount: 8,
                    gross_amount: 1840,
                    vat_percentage: 12,
                    vat_adjusted_amount: 1619.2,
                    net_profit: 80,
                },
                {
                    date: '2026-10-01',
                    provider: 'PEPSI',
                    quantity: 100,
                    product_name: 'Sti Str 240ml RGB/24',
                    purchase_price: 280,
                    total_purchase: 28000,
                    dealing_price: 300,
                    discount: 20,
                    gross_amount: 30000,
                    vat_percentage: 12,
                    vat_adjusted_amount: 26400,
                    net_profit: 2000,
                },
                {
                    date: '2026-10-02',
                    provider: 'COCA-COLA',
                    quantity: 50,
                    product_name: 'Coke 1.5L PET /12',
                    purchase_price: 420,
                    total_purchase: 21000,
                    dealing_price: 460,
                    discount: 40,
                    gross_amount: 23000,
                    vat_percentage: 12,
                    vat_adjusted_amount: 20240,
                    net_profit: 2000,
                }
            ];

            await exportSalesPurchaseExcel('WINZELLE', sampleRows, 12, 'sample_bir_2023_report');
        } finally {
            setIsDownloadingSample(false);
        }
    };

    // -------------------------------------------------------------
    // INTERACTIVE DEMO 5: ROLES SIMULATOR
    // -------------------------------------------------------------
    const [selectedRole, setSelectedRole] = useState<'admin' | 'owner' | 'checker'>('admin');
    const roleProfiles = {
        admin: {
            title: 'Administrator',
            badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
            description: 'Master account with full keys: distributor directory, user accounts, system configuration, and archiving.',
            canAddDistributors: true,
            canRecordPurchases: true,
            canEditProducts: true,
            canArchiveDistributor: true,
            canExportSpreadsheets: true,
            canManageUsers: true,
        },
        owner: {
            title: 'Store Owner / Manager',
            badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
            description: 'Oversees daily store operations, incoming distributor trucks, sales markups, and stock oversight.',
            canAddDistributors: true,
            canRecordPurchases: true,
            canEditProducts: true,
            canArchiveDistributor: false,
            canExportSpreadsheets: true,
            canManageUsers: false,
        },
        checker: {
            title: 'Stock Checker / Staff',
            badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
            description: 'Frontline store team member. Can count shelf inventory and view distributor products safely.',
            canAddDistributors: false,
            canRecordPurchases: true,
            canEditProducts: false,
            canArchiveDistributor: false,
            canExportSpreadsheets: false,
            canManageUsers: false,
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(val || 0);
    };

    return (
        <MainLayout title="User Guide & Manual">
            <Head title="Visual User Guide - Interactive Manual" />

            {/* Top Hero Banner */}
            <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>100% Visual • Easy to Understand • Interactive Live Demos</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                            Store Owner's Visual Guide & Manual
                        </h1>
                        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                            No tech jargon! See and test the exact <strong>Distributor Cards</strong>, <strong>Delivery Auto-Sync</strong>, and <strong>BIR 2023 Excel Reports</strong> right on this page before doing it live.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Link
                            href="/distributors"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                        >
                            <span>Open Distributors Directory</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Interactive Module Navigation Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-slate-800">
                <button
                    type="button"
                    onClick={() => setActiveSection('flow')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        activeSection === 'flow'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    <TrendingUp className="h-4 w-4" />
                    <span>1. How The Store Works</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('distributors')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        activeSection === 'distributors'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    <Truck className="h-4 w-4" />
                    <span>2. Distributor Card Demo</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('products')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        activeSection === 'products'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    <PackagePlus className="h-4 w-4" />
                    <span>3. Products & Pricing</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('delivery_sync')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        activeSection === 'delivery_sync'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    <Boxes className="h-4 w-4" />
                    <span>4. Deliveries & Auto-Shelf</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('spreadsheet')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        activeSection === 'spreadsheet'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>5. BIR 2023 Excel Report</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveSection('roles')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                        activeSection === 'roles'
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                >
                    <ShieldCheck className="h-4 w-4" />
                    <span>6. Staff Roles & Keys</span>
                </button>
            </div>

            {/* ======================================================== */}
            {/* SECTION 1: HOW THE STORE WORKS (4-STEP VISUAL LIFECYCLE) */}
            {/* ======================================================== */}
            {activeSection === 'flow' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Store Workflow Overview</span>
                            <h2 className="text-2xl font-black text-white mt-1">From Distributor Truck to Store Shelf in 4 Steps</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Everything in Winzelle connects automatically so you never have to double-encode stock or perform manual calculations.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Step 1 */}
                            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 transition shadow-lg">
                                <div>
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-lg mb-4">
                                        1
                                    </div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                                        <Truck className="h-4 w-4 text-emerald-400" />
                                        <span>Add Distributor</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                        Register distributor companies (e.g. <strong>PEPSI</strong>, <strong>COCA-COLA</strong>, <strong>SAN MIGUEL</strong>). Upload their company logo so their card stands out.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('distributors')}
                                    className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                                >
                                    <span>Try Distributor Demo</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Step 2 */}
                            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 transition shadow-lg">
                                <div>
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-lg mb-4">
                                        2
                                    </div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                                        <PackagePlus className="h-4 w-4 text-emerald-400" />
                                        <span>Assign Products</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                        List each bottle, can, or case and assign it to its distributor. Set purchase price (₱114) and dealing price (₱120).
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('products')}
                                    className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                                >
                                    <span>Try Pricing Demo</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Step 3 */}
                            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/50 transition shadow-lg">
                                <div>
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-lg mb-4">
                                        3
                                    </div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                                        <span>Record Delivery</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                        When the distributor truck arrives, encode the delivery quantity in <strong>Sales & Purchases</strong>. Total purchase and VAT auto-compute.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('delivery_sync')}
                                    className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                                >
                                    <span>Try Delivery Sync</span>
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            {/* Step 4 */}
                            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex flex-col justify-between shadow-lg">
                                <div>
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow">
                                        4
                                    </div>
                                    <h3 className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
                                        <Boxes className="h-4 w-4 text-emerald-400" />
                                        <span>Inventory Auto-Syncs!</span>
                                    </h3>
                                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                                        <strong>Zero manual counting!</strong> Central Inventory shelf stock updates instantly upon recording a delivery.
                                    </p>
                                </div>
                                <span className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    <span>Automatic Stock Increment</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* SECTION 2: EXACT DISTRIBUTOR CARD & DETAILS MODAL DEMO   */}
            {/* ======================================================== */}
            {activeSection === 'distributors' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Module 1: Distributors</span>
                            <h2 className="text-2xl font-black text-white mt-1">Live Distributor Card & Details Modal (Exact System Replica)</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                In Winzelle, distributor cards are clean and uncluttered: showcasing only the big logo and company name. Click the star to favorite, click the card body to view full details, or test the 1-click archive/restore.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* The Exact Distributor Card from Distributors/Index.tsx */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                                        Exact System Card (Try Clicking It!):
                                    </p>
                                    <span className="text-[11px] text-emerald-400 font-mono">
                                        Status: {demoDistArchived ? 'Archived (Soft Deleted)' : 'Active Directory'}
                                    </span>
                                </div>

                                {!demoDistArchived ? (
                                    <div
                                        onClick={() => setDemoDistModalOpen(true)}
                                        className="group relative bg-slate-900 border border-amber-500/35 hover:border-amber-500/70 rounded-2xl p-5 shadow-lg hover:shadow-emerald-950/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-between text-center cursor-pointer h-72 select-none"
                                    >
                                        {/* Top row: Favorite indicator & Star button */}
                                        <div className="w-full flex items-center justify-between">
                                            {demoDistStarred ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                                    <Star className="h-3 w-3 fill-amber-400" />
                                                    <span>Favorite</span>
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                    Distributor
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDemoDistStarred(!demoDistStarred);
                                                }}
                                                className="p-1.5 text-amber-400 hover:scale-110 transition rounded-lg"
                                                title={demoDistStarred ? 'Unmark favorite' : 'Mark as favorite'}
                                            >
                                                <Star className={`h-4 w-4 ${demoDistStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
                                            </button>
                                        </div>

                                        {/* Center: BIGGER LOGO & NAME */}
                                        <div className="flex-1 flex flex-col items-center justify-center gap-3 w-full my-1">
                                            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/5 border border-slate-700/60 p-2.5 shadow-inner flex items-center justify-center group-hover:scale-105 group-hover:border-amber-400/60 transition-all duration-300">
                                                <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-red-600 text-white font-black text-3xl sm:text-4xl flex items-center justify-center border border-indigo-400/40 shadow-md">
                                                    P
                                                </div>
                                            </div>
                                            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 px-1 text-center">
                                                Pepsi-Cola Products Phils.
                                            </h3>
                                        </div>

                                        {/* Bottom row: Product count and details hint */}
                                        <div className="w-full pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                                            <span className="text-[11px] text-slate-400 font-mono bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                                                12 Products
                                            </span>
                                            <span className="text-[11px] font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                                Details &rarr;
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-6 text-center h-72 flex flex-col items-center justify-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                            <Archive className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-base font-bold text-amber-300">Distributor Soft-Deleted!</h4>
                                        <p className="text-xs text-slate-300 max-w-xs">
                                            Preserved safely in your Archived tab. No records or transaction histories are permanently deleted.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setDemoDistArchived(false)}
                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5 shadow"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            <span>Restore Distributor Back</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Controls and Interactive Instructions */}
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Try These Actions On The Card:</h4>
                                    
                                    <div className="space-y-2 text-xs text-slate-300">
                                        <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white">Star Favorite Toggle:</strong> Clicking the star instantly sorts the distributor to the top "Favorite Distributors" section for 1-click access.
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                                            <Eye className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white">Click Card Body:</strong> Opens the full details modal showing contact numbers, warehouse addresses, and registered products list.
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                                            <Archive className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="text-white">Safe Soft Deleting:</strong> Click below to simulate archiving:
                                                <div className="mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setDemoDistArchived(!demoDistArchived)}
                                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 inline-flex items-center gap-1.5"
                                                    >
                                                        {demoDistArchived ? <RotateCcw className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5 text-rose-400" />}
                                                        <span>{demoDistArchived ? 'Restore to Active' : 'Test Soft-Delete Archive'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* EXACT DISTRIBUTOR DETAILS MODAL (SIMULATOR)              */}
            {/* ======================================================== */}
            {demoDistModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
                            <div className="flex items-center space-x-4">
                                <div className="h-20 w-20 rounded-2xl bg-white/5 border border-slate-700/80 p-2 shadow-inner flex items-center justify-center shrink-0">
                                    <div className="h-full w-full rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-red-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                                        P
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-bold text-white">Pepsi-Cola Products Phils.</h2>
                                        {demoDistStarred && (
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                                            12 Registered Products
                                        </span>
                                        {demoDistStarred && (
                                            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-medium">
                                                ★ Pinned Favorite
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setDemoDistModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 text-sm">
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Contact Information</span>
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Phone / Contact:</span>
                                        <span className="font-semibold text-emerald-400">(02) 8887-3774</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Email Address:</span>
                                        <span className="text-slate-200">orders@pepsiphils.com</span>
                                    </div>
                                    <div className="flex items-start justify-between gap-4 pt-1.5 border-t border-slate-800/80">
                                        <span className="text-slate-400 shrink-0">Address:</span>
                                        <span className="text-slate-200 text-right">Km. 29 National Highway, Tunasan, Muntinlupa</span>
                                    </div>
                                </div>
                            </div>

                            {/* Registered Products Preview */}
                            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <Boxes className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Registered Products Sample</span>
                                </h4>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                        <span className="text-white font-medium">Pep Reg 195ml PET/12</span>
                                        <span className="text-emerald-400 font-mono">Cost: ₱114.00 • Price: ₱120.00</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                        <span className="text-white font-medium">Sti Str 240ml RGB/24</span>
                                        <span className="text-emerald-400 font-mono">Cost: ₱280.00 • Price: ₱300.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDemoDistModalOpen(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* SECTION 3: PRODUCTS CATALOG & PRICING SLIDER            */}
            {/* ======================================================== */}
            {activeSection === 'products' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Module 2: Products Catalog</span>
                            <h2 className="text-2xl font-black text-white mt-1">Interactive Pricing & Profit Margin Calculator</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Adjust your purchase cost and customer dealing price below to watch your gross discount and margin auto-compute in real-time.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            {/* Sliders */}
                            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
                                <div>
                                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                                        <span className="text-slate-300">Purchase Price (From Distributor):</span>
                                        <span className="text-emerald-400 font-mono text-base">{formatCurrency(prodPurchasePrice)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="500"
                                        step="2"
                                        value={prodPurchasePrice}
                                        onChange={(e) => setProdPurchasePrice(Number(e.target.value))}
                                        className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center text-xs font-bold mb-2">
                                        <span className="text-slate-300">Dealing / Selling Price (To Customer):</span>
                                        <span className="text-teal-400 font-mono text-base">{formatCurrency(prodSellingPrice)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={prodPurchasePrice}
                                        max={prodPurchasePrice + 200}
                                        step="2"
                                        value={prodSellingPrice < prodPurchasePrice ? prodPurchasePrice : prodSellingPrice}
                                        onChange={(e) => setProdSellingPrice(Number(e.target.value))}
                                        className="w-full accent-teal-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block">Gross Profit / Unit</span>
                                        <span className="text-lg font-black text-emerald-400 font-mono">
                                            {formatCurrency(prodMargin)}
                                        </span>
                                    </div>
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                                        <span className="text-[11px] text-slate-400 block">Margin Percentage</span>
                                        <span className="text-lg font-black text-teal-400 font-mono">
                                            +{prodMarginPct}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Card Visualizer */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                                            P
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">Pep Reg 195ml PET/12</h4>
                                            <span className="text-[11px] text-slate-400">Distributor: PEPSI</span>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        In Stock
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                                        <span className="text-[10px] text-slate-400 block">Distributor Cost</span>
                                        <span className="font-bold text-white font-mono">{formatCurrency(prodPurchasePrice)}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                                        <span className="text-[10px] text-slate-400 block">Store Selling</span>
                                        <span className="font-bold text-teal-300 font-mono">{formatCurrency(prodSellingPrice)}</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                                        <span className="text-[10px] text-emerald-300 block">Net Margin</span>
                                        <span className="font-bold text-emerald-400 font-mono">+{prodMarginPct}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* SECTION 4: DELIVERIES & AUTO-SHELF INVENTORY SYNC        */}
            {/* ======================================================== */}
            {activeSection === 'delivery_sync' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Module 3 & 4 Integration</span>
                            <h2 className="text-2xl font-black text-white mt-1">Delivery Truck & Central Inventory Auto-Shelf Sync</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Click the delivery buttons below to simulate a distributor delivery arriving. Watch how <strong>Sales & Purchase</strong> computes VAT & Net Profit while <strong>Central Inventory</strong> automatically increments shelf stock!
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Live Delivery Input Simulator */}
                            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-5">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Truck className="h-4 w-4" />
                                    <span>Distributor Delivery Truck Simulator</span>
                                </h3>

                                <div className="space-y-3">
                                    <div className="text-xs text-slate-300">
                                        Simulate receiving new stock of <strong>Pep Reg 195ml PET/12</strong> from <strong>PEPSI</strong>:
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSimulateDelivery(10)}
                                            className="flex-1 py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
                                        >
                                            +10 Cases Delivered
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSimulateDelivery(25)}
                                            className="flex-1 py-3 px-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow transition"
                                        >
                                            +25 Cases Delivered
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSimulateDelivery(50)}
                                            className="flex-1 py-3 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
                                        >
                                            +50 Cases Delivered
                                        </button>
                                    </div>
                                </div>

                                {/* Computed Table Row Preview */}
                                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                                        Sales & Purchase Auto-Calculation:
                                    </span>
                                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                            <span className="text-[10px] text-slate-400 block font-sans">Total Purchase:</span>
                                            <span className="text-white font-bold">{formatCurrency(calcTotalPurchase)}</span>
                                        </div>
                                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                            <span className="text-[10px] text-slate-400 block font-sans">Gross Amount:</span>
                                            <span className="text-teal-400 font-bold">{formatCurrency(calcGrossAmount)}</span>
                                        </div>
                                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                            <span className="text-[10px] text-slate-400 block font-sans">Net Profit:</span>
                                            <span className="text-emerald-400 font-bold">{formatCurrency(calcNetProfit)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Central Inventory Shelf Visualizer */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/40 shadow-xl space-y-5 text-center">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                        <Boxes className="h-4 w-4 text-emerald-400" />
                                        <span>Central Inventory Shelf Count</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={handleResetShelf}
                                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                                    >
                                        <RotateCcw className="h-3.5 w-3.5" />
                                        <span>Reset</span>
                                    </button>
                                </div>

                                <div className="py-4">
                                    <div className={`text-6xl sm:text-7xl font-black font-mono transition-transform duration-300 ${deliveryCelebration ? 'text-emerald-400 scale-110' : 'text-white'}`}>
                                        {shelfStock}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mt-1">
                                        Units Currently On Store Shelf
                                    </span>
                                </div>

                                {deliveryCelebration ? (
                                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-pulse flex items-center justify-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span>+{deliveryQty} Cases Automatically Added To Inventory!</span>
                                    </div>
                                ) : (
                                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                                        Click a delivery button on the left to watch this shelf number update automatically.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* SECTION 5: EXACT BIR 2023 EXCEL & CSV REPORT DEMO        */}
            {/* ======================================================== */}
            {activeSection === 'spreadsheet' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Spreadsheet Engine</span>
                                <h2 className="text-2xl font-black text-white mt-1">Official BIR 2023 Formatted Excel (.xlsx) & CSV</h2>
                                <p className="text-xs text-slate-400 mt-1">
                                    Exports strictly adhere to <code className="text-emerald-400">docs/template-inventory.xlsx</code> with solid green headers (<span className="text-emerald-400 font-mono">#70AD47</span>), soft green zebra rows, formulas, and double-line totals.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleDownloadSampleExcel}
                                disabled={isDownloadingSample}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50 shrink-0"
                            >
                                <Download className="h-4 w-4" />
                                <span>{isDownloadingSample ? 'Generating Excel...' : 'Download Sample Styled Excel (.xlsx)'}</span>
                            </button>
                        </div>

                        {/* Interactive Spreadsheet Preview Matching docs/template-inventory.xlsx */}
                        <div className="bg-white rounded-2xl border border-slate-300 p-4 overflow-x-auto shadow-2xl text-slate-900 font-sans">
                            {/* Merged Title Banner D1:E2 */}
                            <div className="mb-3 flex justify-center">
                                <div className="bg-[#70AD47] text-white font-bold px-8 py-2 rounded shadow text-sm tracking-wider uppercase text-center">
                                    WINZELLE SALES & PURCHASE
                                </div>
                            </div>

                            {/* Table */}
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-[#70AD47] text-white font-bold border border-[#548235]">
                                        <th className="py-2.5 px-3 border border-[#548235] text-center">DATE</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-left">PROVIDER</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">QUANTITY</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-left">PRODUCT NAME</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">PURCHASE PRICE</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">TOTAL PURCHASE</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">DEALING PRICE</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">DISCOUNT</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">GROSS AMOUNT</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">12% VAT</th>
                                        <th className="py-2.5 px-3 border border-[#548235] text-right">NET PROFIT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="bg-white hover:bg-slate-50 transition border border-slate-200">
                                        <td className="py-2 px-3 border border-slate-200 text-center font-mono">2026-10-01</td>
                                        <td className="py-2 px-3 border border-slate-200 font-bold">PEPSI</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">10</td>
                                        <td className="py-2 px-3 border border-slate-200 font-medium">Pep Reg 195ml PET/12</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱114.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">₱1,140.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱120.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱6.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">₱1,200.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱1,056.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-bold text-emerald-700">₱60.00</td>
                                    </tr>
                                    <tr className="bg-[#F2F8EE] hover:bg-emerald-50/50 transition border border-slate-200">
                                        <td className="py-2 px-3 border border-slate-200 text-center font-mono">2026-10-01</td>
                                        <td className="py-2 px-3 border border-slate-200 font-bold">PEPSI</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">100</td>
                                        <td className="py-2 px-3 border border-slate-200 font-medium">Sti Str 240ml RGB/24</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱280.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">₱28,000.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱300.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱20.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">₱30,000.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱26,400.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-bold text-emerald-700">₱2,000.00</td>
                                    </tr>
                                    <tr className="bg-white hover:bg-slate-50 transition border border-slate-200">
                                        <td className="py-2 px-3 border border-slate-200 text-center font-mono">2026-10-02</td>
                                        <td className="py-2 px-3 border border-slate-200 font-bold">COCA-COLA</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">50</td>
                                        <td className="py-2 px-3 border border-slate-200 font-medium">Coke 1.5L PET /12</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱420.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">₱21,000.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱460.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱40.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-semibold">₱23,000.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono">₱20,240.00</td>
                                        <td className="py-2 px-3 border border-slate-200 text-right font-mono font-bold text-emerald-700">₱2,000.00</td>
                                    </tr>
                                    {/* Accounting Totals Row */}
                                    <tr className="bg-[#EAF4E4] font-bold border-t border-[#70AD47] border-b-4 border-double border-b-[#70AD47]">
                                        <td colSpan={5} className="py-2.5 px-3 text-right text-slate-800">TOTALS:</td>
                                        <td className="py-2.5 px-3 text-right font-mono text-slate-900">₱50,140.00</td>
                                        <td colSpan={2} className="py-2.5 px-3"></td>
                                        <td className="py-2.5 px-3 text-right font-mono text-slate-900">₱54,200.00</td>
                                        <td className="py-2.5 px-3 text-right font-mono text-slate-900">₱47,696.00</td>
                                        <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-black">₱4,060.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* SECTION 6: ROLES & USER ACCESS MATRIX                    */}
            {/* ======================================================== */}
            {activeSection === 'roles' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                        <div className="mb-6">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Access Control</span>
                            <h2 className="text-2xl font-black text-white mt-1">Staff Roles & Permissions</h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Click a role below to see what permissions and safety locks are applied to their account.
                            </p>
                        </div>

                        {/* Role Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                            {(['admin', 'owner', 'checker'] as const).map((rKey) => {
                                const p = roleProfiles[rKey];
                                return (
                                    <button
                                        key={rKey}
                                        type="button"
                                        onClick={() => setSelectedRole(rKey)}
                                        className={`p-4 rounded-2xl border text-left transition ${
                                            selectedRole === rKey
                                                ? 'bg-emerald-950/60 border-emerald-500 shadow-lg'
                                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.badge}`}>
                                                {p.title}
                                            </span>
                                            {selectedRole === rKey && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                                        </div>
                                        <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Role Matrix */}
                        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                                Permission Matrix for: {roleProfiles[selectedRole].title}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300">Add & Edit Distributors</span>
                                    {roleProfiles[selectedRole].canAddDistributors ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                            <Check className="h-4 w-4" /> Allowed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300">Record Deliveries (Purchases)</span>
                                    {roleProfiles[selectedRole].canRecordPurchases ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                            <Check className="h-4 w-4" /> Allowed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300">Configure Product Prices</span>
                                    {roleProfiles[selectedRole].canEditProducts ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                            <Check className="h-4 w-4" /> Allowed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300">Archive / Soft-Delete</span>
                                    {roleProfiles[selectedRole].canArchiveDistributor ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                            <Check className="h-4 w-4" /> Allowed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300">Export BIR 2023 Spreadsheets</span>
                                    {roleProfiles[selectedRole].canExportSpreadsheets ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                            <Check className="h-4 w-4" /> Allowed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </div>

                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300">Manage Staff Accounts</span>
                                    {roleProfiles[selectedRole].canManageUsers ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                            <Check className="h-4 w-4" /> Allowed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-slate-500 font-bold">
                                            <Lock className="h-3.5 w-3.5" /> Locked
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
