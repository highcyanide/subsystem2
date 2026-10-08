import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import {
    History,
    Search,
    Filter,
    User as UserIcon,
    Plus,
    Edit3,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ArrowRight,
    FileDiff,
    X,
    CheckCircle2,
    Shield,
    Clock,
    Activity,
    Maximize2,
    ChevronUp,
    ChevronDown
} from 'lucide-react';

interface LogUser {
    id: number;
    name: string;
    role: string;
    email?: string;
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
    const [userSearch, setUserSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<number | null>(
        filters.user_id ? Number(filters.user_id) : null
    );

    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [modelType, setModelType] = useState(filters.model_type || '');
    const [date, setDate] = useState(filters.date || '');

    // Detailed Modal / Diff Inspector (Google Docs style)
    const [inspectLog, setInspectLog] = useState<Log | null>(null);
    const [isTableExpanded, setIsTableExpanded] = useState(false);
    const [isFullTableModalOpen, setIsFullTableModalOpen] = useState(false);

    // 1-3 Rows Snapshot dataset when collapsed and no search
    const displayedLogs = React.useMemo(() => {
        if (!isTableExpanded && !search.trim()) {
            return logs.data.slice(0, 3);
        }
        return logs.data;
    }, [isTableExpanded, search, logs.data]);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.role.toLowerCase().includes(userSearch.toLowerCase())
    );

    const handleSelectUser = (uId: number | null) => {
        setSelectedUser(uId);
        router.get('/activity-log', {
            user_id: uId ? String(uId) : undefined,
            search: search || undefined,
            action: action || undefined,
            model_type: modelType || undefined,
            date: date || undefined,
        }, { preserveState: true });
    };

    const handleFilterChange = (key: string, val: string) => {
        if (key === 'action') setAction(val);
        if (key === 'model_type') setModelType(val);
        if (key === 'date') setDate(val);

        router.get('/activity-log', {
            user_id: selectedUser ? String(selectedUser) : undefined,
            search: search || undefined,
            action: key === 'action' ? (val || undefined) : (action || undefined),
            model_type: key === 'model_type' ? (val || undefined) : (modelType || undefined),
            date: key === 'date' ? (val || undefined) : (date || undefined),
        }, { preserveState: true });
    };

    const handleClearAll = () => {
        setUserSearch('');
        setSelectedUser(null);
        setSearch('');
        setAction('');
        setModelType('');
        setDate('');
        router.get('/activity-log', {}, { preserveState: true });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <MainLayout title="User Activity & Audit History">
            <Head title="RBAC Activity Audit" />

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-950/40 pb-5">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                        <Shield className="h-4 w-4" />
                        <span>Security & RBAC Audit Trail</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                        <History className="h-7 w-7 text-emerald-400" />
                        <span>System Activity & Change History</span>
                    </h1>
                </div>

                {selectedUser && (
                    <button
                        type="button"
                        onClick={() => handleSelectUser(null)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-semibold transition"
                    >
                        <X className="h-3.5 w-3.5" />
                        <span>View All Users' Activity</span>
                    </button>
                )}
            </div>

            {/* ======================================================== */}
            {/* STEP 1: SELECT A USER FIRST (USER CARDS CONSOLE)        */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                    <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-emerald-400" />
                            <span>Select a User to View Action History</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Click a user profile card below to filter all actions performed by that role.</p>
                    </div>

                    {/* User Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find user by name or role..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                        />
                    </div>
                </div>

                {/* User Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    <button
                        type="button"
                        onClick={() => handleSelectUser(null)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                            selectedUser === null
                                ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">All Users</span>
                            <Activity className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2 block">System-wide logs</span>
                    </button>

                    {filteredUsers.map(u => {
                        const isSelected = selectedUser === u.id;
                        return (
                            <button
                                key={u.id}
                                type="button"
                                onClick={() => handleSelectUser(u.id)}
                                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                                    isSelected
                                        ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold truncate block">{u.name}</span>
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                                        u.role === 'admin' ? 'bg-purple-950/80 text-purple-300' :
                                        u.role === 'owner' ? 'bg-amber-950/80 text-amber-300' :
                                        'bg-blue-950/80 text-blue-300'
                                    }`}>
                                        {u.role}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ======================================================== */}
            {/* STEP 2: FILTERS (SEARCH, ACTION, MODULE, DATE)           */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search action details..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', search)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                </div>

                {/* Action Filter */}
                <select
                    value={action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                    <option value="">All Actions</option>
                    <option value="created">Created (+)</option>
                    <option value="updated">Updated (✎)</option>
                    <option value="deleted">Archived (🗑)</option>
                </select>

                {/* Module Filter */}
                <select
                    value={modelType}
                    onChange={(e) => handleFilterChange('model_type', e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                    <option value="">All Modules</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Product">Product</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Purchase">Purchase</option>
                    <option value="User">User Account</option>
                    <option value="Unit">Measurement Unit</option>
                </select>

                {/* Date Filter */}
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1 text-xs text-white">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => handleFilterChange('date', e.target.value)}
                        className="bg-transparent text-xs text-white focus:outline-none"
                    />
                </div>

                {(search || action || modelType || date || selectedUser) && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* ======================================================== */}
            {/* STEP 3: AUDIT HISTORY TIMELINE / TABLE (NO IP ADDRESS)   */}
            {/* ======================================================== */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Detailed Audit Trail</span>
                            <span className="text-xs bg-slate-800 text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
                                {logs.total} Total Records
                            </span>
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click any record row to inspect detailed before and after change values.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                                <th className="py-3 px-4">Date & Time</th>
                                <th className="py-3 px-4">Actor</th>
                                <th className="py-3 px-4">Action</th>
                                <th className="py-3 px-4">Module</th>
                                <th className="py-3 px-4">Description</th>
                                <th className="py-3 px-4 text-center">Changes Diff</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-500">
                                        No activity logs found matching the selected user or criteria.
                                    </td>
                                </tr>
                            ) : (
                                displayedLogs.map((log) => {
                                    const ActionIcon = actionIcons[log.action] || Edit3;
                                    const colorClass = actionColors[log.action] || actionColors.updated;
                                    const hasDiff = Boolean(log.old_values || log.new_values);

                                    return (
                                        <tr 
                                            key={log.id} 
                                            onClick={() => setInspectLog(log)}
                                            className="hover:bg-slate-850/80 transition-colors cursor-pointer"
                                        >
                                            <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                                                        {log.user?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-white block leading-tight">{log.user?.name || 'System'}</span>
                                                        <span className="text-[10px] text-slate-400 capitalize">{log.user?.role || ''}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
                                                    <ActionIcon className="h-3 w-3" />
                                                    <span className="capitalize">{log.action}</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                                                    {log.model_type}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-200 max-w-md truncate">
                                                {log.description}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {hasDiff ? (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInspectLog(log);
                                                        }}
                                                        className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/50 rounded-lg text-[10px] font-semibold flex items-center gap-1 mx-auto transition"
                                                    >
                                                        <FileDiff className="h-3 w-3" />
                                                        <span>View Diff</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-500 italic">No values recorded</span>
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
                {!isTableExpanded && !search.trim() && logs.total > 3 ? (
                    <div className="relative overflow-hidden border-t border-slate-800 bg-gradient-to-b from-slate-950/80 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-slate-300 font-medium">
                                Teaser preview: Showing <strong className="text-white font-bold">top 3</strong> of <strong className="text-emerald-400 font-mono font-bold">{logs.total}</strong> activity records
                            </span>
                            <span className="hidden md:inline-block text-[11px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700">
                                +{logs.total - 3} more records available
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setIsFullTableModalOpen(true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-95"
                            >
                                <Maximize2 className="h-3.5 w-3.5" />
                                <span>View Full Log in Modal ({logs.total})</span>
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
                    <div className="px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                                Showing page {logs.current_page} of {logs.last_page} ({logs.total} records)
                            </span>
                            {!search.trim() && (
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
                        {logs.last_page > 1 && (
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
                        )}
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* GOOGLE DOCS STYLE BEFORE & AFTER COMPARISON MODAL        */}
            {/* ======================================================== */}
            {inspectLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 relative max-h-[85vh] flex flex-col">
                        <button
                            type="button"
                            onClick={() => setInspectLog(null)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
                            <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                <FileDiff className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <span>Audit Change Details</span>
                                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                                        #{inspectLog.id}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span>Performed by <strong className="text-white">{inspectLog.user?.name || 'System'}</strong></span>
                                    <span>•</span>
                                    <span className="font-mono text-emerald-400">{formatDate(inspectLog.created_at)}</span>
                                </p>
                            </div>
                        </div>

                        {/* Description Summary */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs text-slate-200">
                            <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-0.5">Activity Description:</span>
                            {inspectLog.description}
                        </div>

                        {/* Before vs After Side-by-Side (Google Docs style) */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                
                                {/* Before */}
                                <div className="bg-slate-950 rounded-xl border border-rose-950/60 p-3.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 pb-1 border-b border-rose-900/40">
                                        <X className="h-3.5 w-3.5" />
                                        <span>Before Change (Previous)</span>
                                    </div>
                                    {inspectLog.old_values ? (
                                        <pre className="text-[11px] font-mono text-rose-200/90 whitespace-pre-wrap bg-slate-900/80 p-2.5 rounded-lg border border-rose-900/30 overflow-x-auto">
                                            {JSON.stringify(inspectLog.old_values, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic py-4 text-center">
                                            No prior state (New record creation)
                                        </div>
                                    )}
                                </div>

                                {/* After */}
                                <div className="bg-slate-950 rounded-xl border border-emerald-950/60 p-3.5">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 pb-1 border-b border-emerald-900/40">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>After Change (Updated)</span>
                                    </div>
                                    {inspectLog.new_values ? (
                                        <pre className="text-[11px] font-mono text-emerald-200/90 whitespace-pre-wrap bg-slate-900/80 p-2.5 rounded-lg border border-emerald-900/30 overflow-x-auto">
                                            {JSON.stringify(inspectLog.new_values, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="text-xs text-slate-500 italic py-4 text-center">
                                            Record archived or removed
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setInspectLog(null)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}

        
            {/* ======================================================== */}
            {/* FULL ACTIVITY LOG EXPLORER MODAL                         */}
            {/* ======================================================== */}
            {isFullTableModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
                    <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-7xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                                    <Maximize2 className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <span>System Activity & Audit Logs — Full Explorer</span>
                                        <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                                            {logs.total} Total Events
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-400">Complete immutable audit trail with actor details and before/after difference diffs</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsFullTableModalOpen(false)}
                                className="h-9 w-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
                                title="Close Full Log (ESC)"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body: Scrollable Table */}
                        <div className="flex-1 overflow-auto bg-slate-900/40">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800 shadow-sm">
                                        <th className="py-3 px-4">Date & Time</th>
                                        <th className="py-3 px-4">Actor</th>
                                        <th className="py-3 px-4">Action</th>
                                        <th className="py-3 px-4">Module</th>
                                        <th className="py-3 px-4">Description</th>
                                        <th className="py-3 px-4 text-center">Changes Diff</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-sans">
                                    {logs.data.map((log) => {
                                        const ActionIcon = actionIcons[log.action] || Edit3;
                                        const colorClass = actionColors[log.action] || actionColors.updated;
                                        const hasDiff = Boolean(log.old_values || log.new_values);

                                        return (
                                            <tr 
                                                key={log.id} 
                                                onClick={() => setInspectLog(log)}
                                                className="hover:bg-slate-850/80 transition-colors cursor-pointer"
                                            >
                                                <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                                                            {log.user?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-white block leading-tight">{log.user?.name || 'System'}</span>
                                                            <span className="text-[10px] text-slate-400 capitalize">{log.user?.role || ''}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
                                                        <ActionIcon className="h-3 w-3" />
                                                        <span className="capitalize">{log.action}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                                                        {log.model_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-200 max-w-md truncate">
                                                    {log.description}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {hasDiff ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setInspectLog(log);
                                                            }}
                                                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700/50 rounded-lg text-[10px] font-semibold flex items-center gap-1 mx-auto transition"
                                                        >
                                                            <FileDiff className="h-3 w-3" />
                                                            <span>View Diff</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-500 italic">No values recorded</span>
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
                            {logs.last_page > 1 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">
                                        Page {logs.current_page} of {logs.last_page} ({logs.total} records)
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
                    </div>
                </div>
            )}

        </MainLayout>
    );
}
