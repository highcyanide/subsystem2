import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    History,
    Search,
    Filter,
    User,
    Plus,
    Edit3,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface LogUser {
    id: number;
    name: string;
    role: string;
}

interface Log {
    id: number;
    user_id: number;
    action: string;
    model_type: string;
    model_id: number | null;
    description: string;
    old_values: any;
    new_values: any;
    ip_address: string;
    created_at: string;
    user?: LogUser;
}

interface PaginatedLogs {
    data: Log[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Props {
    logs: PaginatedLogs;
    users: { id: number; name: string; role: string }[];
    filters: {
        user_id: string;
        action: string;
        model_type: string;
        search: string;
        date: string;
    };
}

const actionIcons: Record<string, any> = {
    created: Plus,
    updated: Edit3,
    deleted: Trash2,
};

const actionColors: Record<string, string> = {
    created: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/40',
    updated: 'text-amber-400 bg-amber-950/60 border-amber-700/40',
    deleted: 'text-rose-400 bg-rose-950/60 border-rose-700/40',
};

export default function ActivityLogIndex({ logs, users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [userId, setUserId] = useState(filters.user_id || '');
    const [action, setAction] = useState(filters.action || '');
    const [modelType, setModelType] = useState(filters.model_type || '');
    const [date, setDate] = useState(filters.date || '');

    const handleFilter = (overrides: Record<string, string> = {}) => {
        router.get('/activity-log', {
            search: overrides.search ?? search,
            user_id: overrides.user_id ?? userId,
            action: overrides.action ?? action,
            model_type: overrides.model_type ?? modelType,
            date: overrides.date ?? date,
        }, { preserveState: true });
    };

    const handleClear = () => {
        setSearch(''); setUserId(''); setAction(''); setModelType(''); setDate('');
        router.get('/activity-log', {}, { preserveState: true });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <MainLayout title="Activity Log">
            <Head title="Activity Log" />

            <div className="mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    <span>System</span>
                    <span>•</span>
                    <span>Audit Trail</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <History className="h-7 w-7 text-emerald-400" />
                    <span>Activity Log</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">Track all actions performed by users across the system</p>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    <select value={userId} onChange={(e) => { setUserId(e.target.value); handleFilter({ user_id: e.target.value }); }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                        <option value="">All Users</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                    </select>
                    <select value={action} onChange={(e) => { setAction(e.target.value); handleFilter({ action: e.target.value }); }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                        <option value="">All Actions</option>
                        <option value="created">Created</option>
                        <option value="updated">Updated</option>
                        <option value="deleted">Deleted</option>
                    </select>
                    <select value={modelType} onChange={(e) => { setModelType(e.target.value); handleFilter({ model_type: e.target.value }); }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                        <option value="">All Types</option>
                        <option value="Distributor">Distributor</option>
                        <option value="Product">Product</option>
                        <option value="Purchase">Purchase</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Setting">Setting</option>
                    </select>
                    <div className="flex gap-2">
                        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); handleFilter({ date: e.target.value }); }}
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                        <button onClick={handleClear} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-lg transition">Clear</button>
                    </div>
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                                <th className="py-3 px-4">Date & Time</th>
                                <th className="py-3 px-4">User</th>
                                <th className="py-3 px-4">Action</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Description</th>
                                <th className="py-3 px-4">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500">
                                        No activity logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => {
                                    const ActionIcon = actionIcons[log.action] || Edit3;
                                    const colorClass = actionColors[log.action] || actionColors.updated;
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-850/80 transition-colors">
                                            <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                        {log.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-white block leading-tight">{log.user?.name || 'System'}</span>
                                                        <span className="text-[10px] text-slate-500">{log.user?.role || ''}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
                                                    <ActionIcon className="h-3 w-3" />
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                                                    {log.model_type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                                                {log.description}
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                                                {log.ip_address}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                            Showing page {logs.current_page} of {logs.last_page} ({logs.total} total)
                        </span>
                        <div className="flex gap-1">
                            <button
                                disabled={!logs.prev_page_url}
                                onClick={() => logs.prev_page_url && router.visit(logs.prev_page_url)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                disabled={!logs.next_page_url}
                                onClick={() => logs.next_page_url && router.visit(logs.next_page_url)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-lg transition"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
