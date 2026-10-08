import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Boxes,
    Truck,
    PackagePlus,
    TrendingUp,
    Warehouse,
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
    Check,
    Sun,
    Moon,
    ExternalLink,
    Clock,
    UserCheck,
    Info,
    AlertTriangle,
    Save,
    BookOpen,
    Upload,
    Camera,
    Trash2,
    HelpCircle
} from 'lucide-react';

interface NotificationItem {
    id: number;
    actor_id?: number | null;
    actor_name?: string | null;
    actor_role?: string | null;
    actor_avatar?: string | null;
    type: string;
    title: string;
    message: string;
    details?: string | null;
    link?: string | null;
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
    const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profileName, setProfileName] = useState(auth?.user?.name || '');
    const [profileUsername, setProfileUsername] = useState(auth?.user?.username || '');
    const [profileEmail, setProfileEmail] = useState(auth?.user?.email || '');
    const [profileAvatar, setProfileAvatar] = useState(auth?.user?.avatar || '');
    const [profilePassword, setProfilePassword] = useState('');
    const [profileProcessing, setProfileProcessing] = useState(false);
    const [profileError, setProfileError] = useState('');

    useEffect(() => {
        if (auth?.user) {
            setProfileName(auth.user.name || '');
            setProfileUsername(auth.user.username || '');
            setProfileEmail(auth.user.email || '');
            setProfileAvatar(auth.user.avatar || '');
        }
    }, [auth?.user?.name, auth?.user?.username, auth?.user?.email, auth?.user?.avatar]);

    // Theme state
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const prefersLight = document.documentElement.classList.contains('theme-light') || savedTheme === 'light';
        const activeTheme = prefersLight ? 'light' : 'dark';
        setTheme(activeTheme);
        applyTheme(activeTheme);
    }, []);

    const applyTheme = (newTheme: 'dark' | 'light') => {
        if (newTheme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('theme-light');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('theme-light');
        }
    };

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('theme', next);
        applyTheme(next);
    };

    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const isNavigatingRef = useRef(false);

    // Track active navigation to prevent background reload race conditions
    useEffect(() => {
        const removeStart = router.on('start', () => {
            isNavigatingRef.current = true;
        });
        const removeFinish = router.on('finish', () => {
            isNavigatingRef.current = false;
        });
        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

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

    // Real-time dynamic background synchronization across all pages, tabs, and users
    useEffect(() => {
        if (!auth?.user) return;

        const performDynamicSync = () => {
            // Never reload if user is currently navigating or if tab is in the background
            if (isNavigatingRef.current || document.hidden) {
                return;
            }
            // Avoid background reload while user is actively typing in an input, textarea, or selecting options
            const activeEl = document.activeElement;
            const activeTag = activeEl?.tagName?.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
                return;
            }
            // Avoid background reload if ANY interactive modal or menu is open
            if (
                isProfileOpen ||
                selectedNotif ||
                showNotifications ||
                showUserMenu ||
                document.querySelector('.fixed.z-50') ||
                document.querySelector('[role="dialog"]')
            ) {
                return;
            }

            router.reload();
        };

        // Live periodic poll every 5 seconds for instant cross-user dynamic updates
        const interval = setInterval(performDynamicSync, 5000);

        // Immediate dynamic sync when window/tab regains focus
        const handleWindowFocus = () => {
            performDynamicSync();
        };
        window.addEventListener('focus', handleWindowFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleWindowFocus);
        };
    }, [auth?.user?.id, isProfileOpen, selectedNotif, showNotifications, showUserMenu]);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIM = 256;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_DIM) {
                        height = Math.round((height * MAX_DIM) / width);
                        width = MAX_DIM;
                    }
                } else {
                    if (height > MAX_DIM) {
                        width = Math.round((width * MAX_DIM) / height);
                        height = MAX_DIM;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    const webpData = canvas.toDataURL('image/webp', 0.88);
                    setProfileAvatar(webpData);
                } else {
                    setProfileAvatar(event.target?.result as string);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleMarkAllRead = () => {
        router.post('/notifications/read-all', {}, {
            
            preserveScroll: true,
        });
    };

    const handleNotificationClick = (notif: NotificationItem) => {
        if (!notif.is_read) {
            router.post(`/notifications/${notif.id}/read`, {}, {  preserveScroll: true });
        }
        setSelectedNotif(notif);
        setShowNotifications(false);
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setProfileProcessing(true);
        setProfileError('');

        router.put('/profile', {
            name: profileName,
            username: profileUsername || undefined,
            email: profileEmail,
            avatar: profileAvatar || null,
            password: profilePassword || undefined,
        }, {
            preserveScroll: true,
            
            onSuccess: () => {
                setIsProfileOpen(false);
                setProfilePassword('');
            },
            onError: (errs) => {
                setProfileError(Object.values(errs)[0] as string || 'Failed to update profile');
            },
            onFinish: () => setProfileProcessing(false),
        });
    };

    const roleColors: Record<string, string> = {
        admin: 'bg-emerald-950 text-emerald-400 border-emerald-800/60',
        owner: 'bg-teal-950 text-teal-400 border-teal-800/60',
        checker: 'bg-slate-800 text-slate-300 border-slate-700',
    };

    const navItems = [
        {
            name: 'Inventory',
            shortName: 'Inventory',
            href: '/inventory',
            icon: Boxes,
            active: url.startsWith('/inventory') || url === '/',
        },
        {
            name: 'Sales & Purchase',
            shortName: 'Sales & Purchase',
            href: '/sales-purchase',
            icon: TrendingUp,
            active: url.startsWith('/sales-purchase'),
        },
        {
            name: 'Distributors',
            shortName: 'Distributors',
            href: '/distributors',
            icon: Truck,
            active: url.startsWith('/distributors'),
        },
        {
            name: 'Products',
            shortName: 'Products',
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
            <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-15 gap-4">

                        {/* Minimalist Brand Logo & Title */}
                        <Link href="/inventory" className="flex items-center space-x-2.5 group shrink-0" title={`${companyName} - Warehouse Inventory Management with Distributor Management and Dynamic Delivery Processing System`}>
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 flex items-center justify-center shadow-md shadow-emerald-900/20 border border-emerald-400/30 group-hover:scale-105 transition">
                                <Warehouse className="h-4.5 w-4.5 text-white" />
                            </div>
                            <span className="text-base font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition whitespace-nowrap">
                                {companyName}
                            </span>
                        </Link>

                        {/* Sleek Minimalist Segmented Navigation Dock */}
                        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-950/70 border border-slate-800 gap-1 shadow-inner">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        title={item.name}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                            item.active
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                                        <span className="hidden xl:inline">{item.name}</span>
                                        <span className="hidden lg:inline xl:hidden">{item.shortName}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Utility Bar: Theme + User Guide + Notifications + User */}
                        <div className="flex items-center space-x-2 shrink-0">

                            {/* Light / Dark Mode Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center justify-center"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-4.5 w-4.5 text-amber-400 transition transform hover:rotate-45" />
                                ) : (
                                    <Moon className="h-4.5 w-4.5 text-teal-600 transition transform hover:-rotate-12" />
                                )}
                            </button>

                            {/* Dedicated User Guide Help Button (Icon with Tooltip) */}
                            <Link
                                href="/guide"
                                title="Visual User Guide & Demos"
                                className={`p-2 rounded-lg transition flex items-center justify-center ${
                                    url.startsWith('/guide')
                                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                        : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                                }`}
                            >
                                <HelpCircle className="h-4.5 w-4.5" />
                            </Link>

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
                                    <div className="absolute right-0 mt-2 w-88 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-850/50">
                                            <div className="flex items-center gap-2">
                                                <Bell className="h-4 w-4 text-emerald-400" />
                                                <h3 className="text-sm font-bold text-white">Notifications</h3>
                                            </div>
                                            {notifications.unread_count > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-88 overflow-y-auto divide-y divide-slate-800/60">
                                            {notifications.items.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-slate-500 text-xs">
                                                    No notifications yet
                                                </div>
                                            ) : (
                                                notifications.items.map((notif: NotificationItem) => (
                                                    <button
                                                        key={notif.id}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`w-full text-left px-4 py-3 hover:bg-slate-800/60 transition ${
                                                            !notif.is_read ? 'bg-emerald-950/20' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2.5">
                                                            {!notif.is_read && (
                                                                <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                                                                    <span className="text-[10px] text-slate-500 shrink-0">{timeAgo(notif.created_at)}</span>
                                                                </div>
                                                                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                                                                    <UserCheck className="h-3 w-3 shrink-0" />
                                                                    <span>By: {notif.actor_name || 'System Admin'}</span>
                                                                    {notif.actor_role && (
                                                                        <span className="text-[9px] bg-slate-800 px-1 py-0.2 rounded text-slate-300 uppercase font-mono">
                                                                            {notif.actor_role}
                                                                        </span>
                                                                    )}
                                                                </div>
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
                                    <div className="h-7 w-7 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xs font-bold border border-emerald-500/30 shrink-0">
                                        {auth?.user?.avatar ? (
                                            <img src={auth.user.avatar} alt={auth.user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'
                                        )}
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
                                    <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-sm font-bold border border-emerald-500/40 shrink-0 shadow-md">
                                                {auth?.user?.avatar ? (
                                                    <img src={auth.user.avatar} alt={auth.user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{auth?.user?.name}</p>
                                                <p className="text-[10px] text-emerald-400 font-mono">@{auth?.user?.username || 'user'}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{auth?.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setIsProfileOpen(true);
                                                    setShowUserMenu(false);
                                                    setProfileName(auth?.user?.name || '');
                                                    setProfileUsername(auth?.user?.username || '');
                                                    setProfileEmail(auth?.user?.email || '');
                                                    setProfileAvatar(auth?.user?.avatar || '');
                                                }}
                                                className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                                            >
                                                <User className="h-4 w-4 text-emerald-400" />
                                                <span>My Profile & Avatar</span>
                                            </button>
                                            <Link
                                                href="/guide"
                                                onClick={() => setShowUserMenu(false)}
                                                className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                                            >
                                                <BookOpen className="h-4 w-4 text-teal-400" />
                                                <span>User Guide & Manual</span>
                                            </Link>
                                            {auth?.user?.role && ['admin', 'owner'].includes(auth.user.role) && (
                                                <Link
                                                    href="/activity-log"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                                                >
                                                    <History className="h-4 w-4" />
                                                    <span>Activity Log</span>
                                                </Link>
                                            )}
                                            {auth?.user?.role === 'admin' && (
                                                <Link
                                                    href="/settings"
                                                    onClick={() => setShowUserMenu(false)}
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
                    <span className="font-semibold text-slate-400">{companyName} &bull; Warehouse Inventory Management with Distributor Management and Dynamic Delivery Processing System</span>
                    <span>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</span>
                </div>
            </footer>

            {/* NOTIFICATION DETAILS MODAL - "WHO DID THE ACTION" */}
            {selectedNotif && (
                <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">{selectedNotif.title}</h3>
                                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(selectedNotif.created_at).toLocaleString()}</span>
                                        <span>•</span>
                                        <span className="text-emerald-400 font-medium">{timeAgo(selectedNotif.created_at)}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedNotif(null)}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* WHO DID THE ACTION BANNER */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                                Action Performed By
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        {(selectedNotif.actor_name || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{selectedNotif.actor_name || 'System Administrator'}</p>
                                        <p className="text-xs text-slate-400">Account: {selectedNotif.actor_name || 'System'}</p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase">
                                    {selectedNotif.actor_role || 'System'}
                                </span>
                            </div>
                        </div>

                        {/* MESSAGE & DETAILS */}
                        <div className="space-y-3 mb-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    Activity Summary
                                </label>
                                <p className="text-sm text-slate-200 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 leading-relaxed">
                                    {selectedNotif.message}
                                </p>
                            </div>
                            {selectedNotif.details && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Additional Details
                                    </label>
                                    <p className="text-xs font-mono text-emerald-300 bg-slate-950 border border-slate-800 rounded-xl p-3 whitespace-pre-wrap">
                                        {selectedNotif.details}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* MODAL ACTIONS */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setSelectedNotif(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                            >
                                Dismiss
                            </button>
                            {selectedNotif.link && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const link = selectedNotif.link!;
                                        setSelectedNotif(null);
                                        router.visit(link);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition border border-emerald-400/30"
                                >
                                    <span>View Related Record</span>
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MY PROFILE MODAL */}
            {isProfileOpen && (
                <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-400" />
                                <h3 className="text-base font-bold text-white">Update Profile</h3>
                            </div>
                            <button
                                onClick={() => setIsProfileOpen(false)}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {profileError && (
                            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                <span>{profileError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                                <div className="relative group shrink-0">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden border-2 border-emerald-500/40">
                                        {profileAvatar ? (
                                            <img
                                                src={profileAvatar}
                                                alt="User Avatar"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            (profileName || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <label
                                        htmlFor="profile-avatar-upload"
                                        className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow cursor-pointer transition"
                                        title="Upload Profile Picture"
                                    >
                                        <Camera className="h-3.5 w-3.5" />
                                        <input
                                            id="profile-avatar-upload"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </label>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white">Profile Photo</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        PNG, JPG, JPEG, WEBP. Auto-converted to optimized WebP.
                                    </p>
                                    {profileAvatar && (
                                        <button
                                            type="button"
                                            onClick={() => setProfileAvatar('')}
                                            className="mt-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={profileName}
                                    onChange={(e) => setProfileName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Login Username</label>
                                <input
                                    type="text"
                                    value={profileUsername}
                                    onChange={(e) => setProfileUsername(e.target.value)}
                                    placeholder="e.g. admin or john_doe"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Can be used interchangeably with email to log in.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={profileEmail}
                                    onChange={(e) => setProfileEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (leave blank to keep current)</label>
                                <input
                                    type="password"
                                    value={profilePassword}
                                    onChange={(e) => setProfilePassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={profileProcessing}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition border border-emerald-400/30"
                                >
                                    <Save className="h-4 w-4" />
                                    <span>{profileProcessing ? 'Saving...' : 'Save Profile'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
