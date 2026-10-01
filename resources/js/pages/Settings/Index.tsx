import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import { Settings, Save, Building2, Bell, Percent, Package, ShieldCheck, Crown, ClipboardCheck } from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
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
    const [companyName, setCompanyName] = useState(settings.company_name || 'WINZELLE');
    const [lowStockThreshold, setLowStockThreshold] = useState(settings.low_stock_threshold || '15');
    const [defaultVat, setDefaultVat] = useState(settings.default_vat_percentage || '12');
    const [notificationStyle, setNotificationStyle] = useState(settings.notification_style || 'number');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.put('/settings', {
            company_name: companyName,
            low_stock_threshold: parseInt(lowStockThreshold),
            default_vat_percentage: parseFloat(defaultVat),
            notification_style: notificationStyle,
        }, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <MainLayout title="Settings">
            <Head title="System Settings" />

            <div className="mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    <span>System</span>
                    <span>•</span>
                    <span>Configuration</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Settings className="h-7 w-7 text-emerald-400" />
                    <span>System Settings</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">Configure system-wide preferences and thresholds</p>
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
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name</label>
                            <input
                                type="text"
                                required
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Displayed in the header, footer, and login page</p>
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
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </div>

                {/* User Accounts Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            User Accounts
                        </h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">{users.length} registered users</p>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                        {users.map((user) => {
                            const RoleIcon = roleIcons[user.role] || ClipboardCheck;
                            const colorClass = roleColors[user.role] || roleColors.checker;
                            return (
                                <div key={user.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-800/30 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-sm font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">{user.name}</p>
                                            <p className="text-[10px] text-slate-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colorClass}`}>
                                        <RoleIcon className="h-3 w-3" />
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
