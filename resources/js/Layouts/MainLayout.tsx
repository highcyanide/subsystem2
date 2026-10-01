import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Boxes,
    Truck,
    PackagePlus,
    TrendingUp,
    Store,
    Layers,
    CheckCircle2,
    ShieldCheck,
    Bell,
    LogOut,
    User,
    Settings,
    History,
    ChevronDown,
    X,
    Check
} from 'lucide-react';

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

interface Props {
    children: React.ReactNode;
    title?: string;
}

export default function MainLayout({ children, title }: Props) {
    const page = usePage<any>();
    const url = page.url || '/';
    const flash = page.props?.flash;
    const auth = page.props?.auth;
    const notifications = page.props?.notifications || { unread_count: 0, items: [] };
    const settings = page.props?.settings || {};

    const companyName = settings.company_name || 'WINZELLE';
    const notificationStyle = settings.notification_style || 'number';

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Periodic live background poll to keep notifications up-to-date across multiple users
    useEffect(() => {
        if (!auth?.user) return;
        const interval = setInterval(() => {
            router.reload({
                only: ['notifications'],
                preserveState: true,
                preserveScroll: true,
            });
        }, 15000);
        return () => clearInterval(interval);
    }, [auth?.user?.id]);

    const handleMarkAllRead = () => {
        router.post('/notifications/read-all', {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {},
        });
    };

    const handleNotificationClick = (notif: NotificationItem) => {
        if (!notif.is_read) {
            router.post(`/notifications/${notif.id}/read`, {}, { preserveState: true, preserveScroll: true });
        }
        if (notif.link) {
            router.visit(notif.link);
        }
        setShowNotifications(false);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-emerald-950 text-emerald-400 border-emerald-800/60',
        owner: 'bg-teal-950 text-teal-400 border-teal-800/60',
        checker: 'bg-slate-800 text-slate-300 border-slate-700',
    };

    const navItems = [
        {
            name: 'Sales & Purchase',
            subtitle: 'Module 3: Transactions & Cards',
            href: '/sales-purchase',
            icon: TrendingUp,
            active: url.startsWith('/sales-purchase') || url === '/',
        },
        {
            name: 'Inventory',
            subtitle: 'Module 1: Live Stock Table',
            href: '/inventory',
            icon: Boxes,
            active: url.startsWith('/inventory'),
        },
        {
            name: 'Distributors',
            subtitle: 'Module 1: Add Distributors',
            href: '/distributors',
            icon: Truck,
            active: url.startsWith('/distributors'),
        },
        {
            name: 'Products',
            subtitle: 'Module 2: Add & Update Items',
            href: '/products',
            icon: PackagePlus,
            active: url.startsWith('/products'),
        },
    ];

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

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
                                        {companyName}
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
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${item.active
                                                ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-900/20'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                            }`}
                                    >
                                        <Icon className={`h-4 w-4 ${item.active ? 'text-emerald-400' : 'text-slate-400'}`} />
                                        <span className="whitespace-nowrap">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Side: Notifications + User */}
                        <div className="flex items-center space-x-2">
                            {/* Notification Bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                                    className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                                >
                                    <Bell className="h-5 w-5" />
                                    {notifications.unread_count > 0 && (
                                        notificationStyle === 'dot' ? (
                                            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                        ) : (
                                            <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                                                {notifications.unread_count > 99 ? '99+' : notifications.unread_count}
                                            </span>
                                        )
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-white">Notifications</h3>
                                            {notifications.unread_count > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.items.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-slate-500 text-xs">
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.items.map((notif: NotificationItem) => (
                                                    <button
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`w-full text-left px-4 py-3 border-b border-slate-800/60 hover:bg-slate-800/60 transition ${
                                                            !notif.is_read ? 'bg-emerald-950/20' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {!notif.is_read && (
                                                                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                                                            )}
                                                            <div className={!notif.is_read ? '' : 'pl-4'}>
                                                                <p className="text-xs font-semibold text-white">{notif.title}</p>
                                                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                                <p className="text-[10px] text-slate-500 mt-1">{timeAgo(notif.created_at)}</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                                    className="flex items-center space-x-2 bg-slate-900/80 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800 transition"
                                >
                                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
                                        {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <span className="block text-xs font-semibold text-white leading-tight">{auth?.user?.name || 'User'}</span>
                                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0 rounded-full border ${roleColors[auth?.user?.role] || roleColors.checker}`}>
                                            {auth?.user?.role_label || 'Checker'}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                </button>

                                {/* User Dropdown */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-slate-800">
                                            <p className="text-xs font-bold text-white">{auth?.user?.name}</p>
                                            <p className="text-[10px] text-slate-400">{auth?.user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            {auth?.user?.role && ['admin', 'owner'].includes(auth.user.role) && (
                                                <Link
                                                    href="/activity-log"
                                                    className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                                                >
                                                    <History className="h-4 w-4" />
                                                    <span>Activity Log</span>
                                                </Link>
                                            )}
                                            {auth?.user?.role === 'admin' && (
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    <span>Settings</span>
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition border-t border-slate-800"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${item.active
                                        ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/40'
                                        : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{item.name}</span>
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

            {/* Flash Error Notification */}
            {flash?.error && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
                    <div className="bg-rose-950/90 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 backdrop-blur-md">
                        <X className="h-5 w-5 text-rose-400 shrink-0" />
                        <span className="text-sm font-medium">{flash.error}</span>
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
                    <span>{companyName} Store System &copy; {new Date().getFullYear()}</span>
                </div>
            </footer>
        </div>
    );
}
