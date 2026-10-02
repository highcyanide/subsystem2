import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { 
    Settings, 
    Save, 
    Building2, 
    Bell, 
    Percent, 
    Package, 
    ShieldCheck, 
    Crown, 
    ClipboardCheck, 
    UserPlus, 
    Edit2, 
    X, 
    Loader2, 
    Lock, 
    Mail, 
    User as UserIcon,
    Camera,
    RotateCcw,
    Trash2,
    Archive,
    AtSign
} from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    username?: string;
    email: string;
    avatar?: string;
    role: string;
    created_at: string;
    deleted_at?: string | null;
}

interface Props {
    settings: Record<string, string>;
    users: UserItem[];
}

const roleIcons: Record<string, any> = { admin: ShieldCheck, owner: Crown, checker: ClipboardCheck };
const roleColors: Record<string, string> = {
    admin: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/40',
    owner: 'text-teal-400 bg-teal-950/60 border-teal-700/40',
    checker: 'text-slate-300 bg-slate-800/60 border-slate-700/40',
};

export default function SettingsIndex({ settings, users }: Props) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;

    const [companyName, setCompanyName] = useState(settings.company_name || 'WINZELLE');
    const [lowStockThreshold, setLowStockThreshold] = useState(settings.low_stock_threshold || '15');
    const [defaultVat, setDefaultVat] = useState(settings.default_vat_percentage || '12');
    const [notificationStyle, setNotificationStyle] = useState(settings.notification_style || 'number');
    const [processing, setProcessing] = useState(false);

    // User management modal state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [userName, setUserName] = useState('');
    const [userUsername, setUserUsername] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userRole, setUserRole] = useState<'admin' | 'owner' | 'checker'>('checker');
    const [userProcessing, setUserProcessing] = useState(false);
    const [userError, setUserError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.put('/settings', {
            company_name: companyName,
            low_stock_threshold: parseInt(lowStockThreshold),
            default_vat_percentage: parseFloat(defaultVat),
            notification_style: notificationStyle,
        }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setProcessing(false),
        });
    };

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
                    setUserAvatar(webpData);
                } else {
                    setUserAvatar(event.target?.result as string);
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const openAddUser = () => {
        setEditingUser(null);
        setUserName('');
        setUserUsername('');
        setUserEmail('');
        setUserAvatar('');
        setUserPassword('');
        setUserRole('checker');
        setUserError('');
        setIsUserModalOpen(true);
    };

    const openEditUser = (user: UserItem) => {
        setEditingUser(user);
        setUserName(user.name);
        setUserUsername(user.username || '');
        setUserEmail(user.email);
        setUserAvatar(user.avatar || '');
        setUserPassword('');
        setUserRole((user.role as any) || 'checker');
        setUserError('');
        setIsUserModalOpen(true);
    };

    const handleArchiveUser = (user: UserItem) => {
        if (confirm(`Move user "${user.name}" to archive? They will be unable to log in until restored.`)) {
            router.delete(`/settings/users/${user.id}`, {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleRestoreUser = (user: UserItem) => {
        router.post(`/settings/users/${user.id}/restore`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || !userEmail.trim()) {
            setUserError('Name and email are required.');
            return;
        }
        if (!editingUser && !userPassword) {
            setUserError('Password is required for new users.');
            return;
        }

        setUserProcessing(true);
        setUserError('');

        const payload: any = {
            name: userName.trim(),
            username: userUsername.trim() || undefined,
            email: userEmail.trim(),
            avatar: userAvatar || null,
            role: userRole,
        };
        if (userPassword) {
            payload.password = userPassword;
        }

        if (editingUser) {
            router.put(`/settings/users/${editingUser.id}`, payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsUserModalOpen(false);
                },
                onError: (err: any) => {
                    setUserError(Object.values(err)[0] as string || 'Failed to update user.');
                },
                onFinish: () => setUserProcessing(false),
            });
        } else {
            router.post('/settings/users', payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsUserModalOpen(false);
                },
                onError: (err: any) => {
                    setUserError(Object.values(err)[0] as string || 'Failed to create user.');
                },
                onFinish: () => setUserProcessing(false),
            });
        }
    };

    return (
        <MainLayout title="Settings">
            <Head title="System Settings" />

            <div className="mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    <span>System</span>
                    <span>•</span>
                    <span>Configuration & Access Control</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Settings className="h-7 w-7 text-emerald-400" />
                    <span>System Settings & RBAC</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">Configure company name, system preferences, and user role-based permissions</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings Form */}
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                            <Building2 className="h-4 w-4 text-emerald-400" />
                            General Settings
                        </h2>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name (Live System & Login Sync)</label>
                            <input
                                type="text"
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Updating this updates company branding on login screen, header, reports, and spreadsheets</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                    <Package className="h-3.5 w-3.5 text-amber-400" />
                                    Low Stock Threshold
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="1000"
                                    value={lowStockThreshold}
                                    onChange={(e) => setLowStockThreshold(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Items at or below this quantity show "Low Stock" warning</p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                    <Percent className="h-3.5 w-3.5 text-teal-400" />
                                    Default VAT %
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={defaultVat}
                                    onChange={(e) => setDefaultVat(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                                />
                                <p className="text-[10px] text-slate-500 mt-1">Default VAT rate when recording purchases</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
                                <Bell className="h-3.5 w-3.5 text-rose-400" />
                                Notification Badge Style
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setNotificationStyle('number')}
                                    className={`p-4 rounded-xl border text-center transition-all ${
                                        notificationStyle === 'number'
                                            ? 'bg-emerald-950/60 border-emerald-500/60'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="relative inline-block mb-2">
                                        <Bell className="h-6 w-6 text-slate-400" />
                                        <span className="absolute -top-1 -right-2 h-4 min-w-[16px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">3</span>
                                    </div>
                                    <span className={`block text-xs font-bold ${notificationStyle === 'number' ? 'text-emerald-300' : 'text-slate-400'}`}>Number Count</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNotificationStyle('dot')}
                                    className={`p-4 rounded-xl border text-center transition-all ${
                                        notificationStyle === 'dot'
                                            ? 'bg-emerald-950/60 border-emerald-500/60'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="relative inline-block mb-2">
                                        <Bell className="h-6 w-6 text-slate-400" />
                                        <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 rounded-full" />
                                    </div>
                                    <span className={`block text-xs font-bold ${notificationStyle === 'dot' ? 'text-emerald-300' : 'text-slate-400'}`}>Dot Indicator</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition border border-emerald-400/30 flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span>{processing ? 'Saving Changes...' : 'Save System Settings'}</span>
                        </button>
                    </form>
                </div>

                {/* User Accounts & RBAC Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                Role-Based Access Control
                            </h2>
                            <p className="text-[10px] text-slate-400 mt-0.5">{users.length} registered system users</p>
                        </div>
                        <button
                            type="button"
                            onClick={openAddUser}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-xl transition shadow-sm"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Add User</span>
                        </button>
                    </div>

                    <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[500px]">
                        {users.map((user) => {
                            const RoleIcon = roleIcons[user.role] || ClipboardCheck;
                            const colorClass = roleColors[user.role] || roleColors.checker;
                            const isArchived = Boolean(user.deleted_at);

                            return (
                                <div key={user.id} className={`px-6 py-3.5 flex items-center justify-between hover:bg-slate-800/30 transition ${isArchived ? 'opacity-65 bg-slate-950/40' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-sm font-bold shadow overflow-hidden border border-emerald-500/40 shrink-0">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold text-white">{user.name}</p>
                                                {user.username && (
                                                    <span className="text-[10px] text-emerald-400 font-mono">@{user.username}</span>
                                                )}
                                                {isArchived && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClass}`}>
                                            <RoleIcon className="h-3 w-3" />
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>

                                        {isArchived ? (
                                            <button
                                                type="button"
                                                onClick={() => handleRestoreUser(user)}
                                                className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-lg transition inline-flex items-center gap-1 font-bold text-xs shadow-sm"
                                                title="Restore User Account"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                <span>Restore</span>
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openEditUser(user)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                                                    title="Edit user details and role"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>

                                                {currentUserId !== user.id && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleArchiveUser(user)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                                                        title="Archive User Account"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ADD / EDIT USER RBAC MODAL */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                {editingUser ? 'Edit User & Role' : 'Create New System User'}
                            </h3>
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {userError && (
                            <div className="mb-4 p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                                {userError}
                            </div>
                        )}

                        <form onSubmit={handleSaveUser} className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                                <div className="relative group shrink-0">
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden border border-emerald-500/40">
                                        {userAvatar ? (
                                            <img src={userAvatar} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            (userName || 'U').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <label
                                        htmlFor="modal-user-avatar"
                                        className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow cursor-pointer transition"
                                        title="Upload Photo"
                                    >
                                        <Camera className="h-3 w-3" />
                                        <input
                                            id="modal-user-avatar"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </label>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white">Profile Photo</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">Auto-converted to optimized WebP format</p>
                                    {userAvatar && (
                                        <button
                                            type="button"
                                            onClick={() => setUserAvatar('')}
                                            className="mt-1 text-[10px] text-rose-400 hover:text-rose-300 font-semibold"
                                        >
                                            Remove photo
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                                    <UserIcon className="h-3.5 w-3.5 text-emerald-400" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                                    <AtSign className="h-3.5 w-3.5 text-emerald-400" />
                                    Username (for login)
                                </label>
                                <input
                                    type="text"
                                    value={userUsername}
                                    onChange={(e) => setUserUsername(e.target.value)}
                                    placeholder="e.g. jdoe"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5 text-emerald-400" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="e.g. jdoe@company.com"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    placeholder={editingUser ? '••••••••' : 'Enter password'}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                    Role-Based Access Level (RBAC) *
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setUserRole('admin')}
                                        className={`p-2.5 rounded-xl border text-center transition ${
                                            userRole === 'admin'
                                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <ShieldCheck className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                                        <span className="text-[11px] block">Admin</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserRole('owner')}
                                        className={`p-2.5 rounded-xl border text-center transition ${
                                            userRole === 'owner'
                                                ? 'bg-teal-950/80 border-teal-500 text-teal-300 font-bold'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <Crown className="h-4 w-4 mx-auto mb-1 text-teal-400" />
                                        <span className="text-[11px] block">Owner</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserRole('checker')}
                                        className={`p-2.5 rounded-xl border text-center transition ${
                                            userRole === 'checker'
                                                ? 'bg-slate-800 border-slate-500 text-white font-bold'
                                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <ClipboardCheck className="h-4 w-4 mx-auto mb-1 text-slate-400" />
                                        <span className="text-[11px] block">Checker</span>
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    <strong>Admin:</strong> Full access & deletions. <strong>Owner:</strong> Full edit access. <strong>Checker:</strong> View only with limited edits.
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsUserModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={userProcessing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md border border-emerald-400/30 transition"
                                >
                                    {userProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    <span>{userProcessing ? 'Saving User...' : editingUser ? 'Update User' : 'Create User'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
