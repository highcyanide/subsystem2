import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Boxes, 
    Truck, 
    PackagePlus, 
    TrendingUp, 
    Store,
    Layers,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';

interface Props {
    children: React.ReactNode;
    title?: string;
}

export default function MainLayout({ children, title }: Props) {
    const page = usePage<any>();
    const url = page.url || '/';
    const flash = page.props?.flash;

    const navItems = [
        {
            name: 'Subsystem 2: Sales & Purchase',
            subtitle: 'Module 3: Transactions & Cards',
            href: '/sales-purchase',
            icon: TrendingUp,
            active: url.startsWith('/sales-purchase') || url === '/',
            badge: 'Spreadsheet View'
        },
        {
            name: 'Subsystem 1: Inventory Management',
            subtitle: 'Module 1: Live Stock Table',
            href: '/inventory',
            icon: Boxes,
            active: url.startsWith('/inventory'),
            badge: 'Real-time Stock'
        },
        {
            name: 'Subsystem 2: Distributors',
            subtitle: 'Module 1: Add Distributors',
            href: '/distributors',
            icon: Truck,
            active: url.startsWith('/distributors'),
        },
        {
            name: 'Subsystem 2: Distributor Items',
            subtitle: 'Module 2: Add & Update Items',
            href: '/products',
            icon: PackagePlus,
            active: url.startsWith('/products'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
            {/* Top Bar Navigation */}
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/40 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        
                        {/* Logo & Title */}
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 border border-emerald-400/30">
                                <Store className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-100 bg-clip-text text-transparent">
                                        WINZELLE
                                    </h1>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                        Enterprise
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">Inventory & Sales Subsystem Integration</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <nav className="hidden md:flex space-x-1 lg:space-x-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                            item.active
                                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-900/20'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 ${item.active ? 'text-emerald-400' : 'text-slate-400'}`} />
                                        <span className="whitespace-nowrap">{item.name.replace('Subsystem ', 'S')}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* System Badge */}
                        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span className="text-xs text-slate-300 font-medium hidden sm:inline">Subsystem Sync Active</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Sub-bar */}
                <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-slate-900/95 border-t border-slate-800/80 space-x-2 no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
                                    item.active
                                        ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
                                        : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{item.name.split(':')[1] || item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </header>

            {/* Flash Success Notification */}
            {flash?.success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
                    <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 backdrop-blur-md animate-fade-in">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        <span className="text-sm font-medium">{flash.success}</span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-slate-900/60 border-t border-slate-800/80 text-xs text-slate-500 py-4 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                        <Layers className="h-4 w-4 text-emerald-500" />
                        <span>Subsystem 1 (Inventory) & Subsystem 2 (Distributors, Items, Sales & Purchase)</span>
                    </div>
                    <span>Winzelle Store System &copy; {new Date().getFullYear()}</span>
                </div>
            </footer>
        </div>
    );
}
