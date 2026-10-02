import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Warehouse, LogIn, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';

interface LoginProps {
    companyName?: string;
    settings?: Record<string, string>;
}

export default function Login({ companyName: propCompanyName, settings: propSettings }: LoginProps) {
    const pageProps = (usePage().props as any) || {};
    const companyName = propCompanyName || propSettings?.company_name || pageProps.settings?.company_name || pageProps.companyName || 'WINZELLE';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post('/login', { username, password, remember }, {
            onError: (errs: any) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
            <Head title={`Login - ${companyName}`} />

            {/* Subtle background glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 items-center justify-center shadow-xl shadow-emerald-900/40 border border-emerald-400/30 mb-4">
                        <Warehouse className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-100 bg-clip-text text-transparent">
                        {companyName}
                    </h1>
                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold max-w-sm mx-auto leading-relaxed">
                        Warehouse Inventory Management with Distributor Management and Dynamic Delivery Processing System
                    </p>
                </div>

                {/* Secure Login Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md relative">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <LogIn className="h-5 w-5 text-emerald-400" />
                                Secure Sign In
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">Authorized personnel only</p>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-emerald-400" />
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                autoFocus
                                autoComplete="username"
                                placeholder="Enter your username or email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                            />
                            {(errors.username || errors.email) && (
                                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.username || errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-rose-400 mt-1.5 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/30 bg-slate-950 transition cursor-pointer"
                                />
                                <span className="text-xs text-slate-300 font-medium">Remember me</span>
                            </label>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3 text-emerald-500/70" />
                                Encrypted Session
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition border border-emerald-400/30 active:translate-y-0.5"
                        >
                            {processing ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
