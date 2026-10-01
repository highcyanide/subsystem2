import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Store, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const { settings } = usePage().props as any;
    const companyName = settings?.company_name || 'WINZELLE';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post('/login', { email, password, remember }, {
            onError: (errs: any) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
            <Head title={`Login - ${companyName}`} />

            {/* Background gradient effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 items-center justify-center shadow-2xl shadow-emerald-900/40 border border-emerald-400/30 mb-4">
                        <Store className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-100 bg-clip-text text-transparent">
                        {companyName}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Inventory & Sales Subsystem</p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <LogIn className="h-5 w-5 text-emerald-400" />
                            Sign In
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Enter your credentials to access the system</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                            />
                            {errors.email && (
                                <p className="text-xs text-rose-400 mt-1.5">{errors.email}</p>
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
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
                                />
                                <span className="text-xs text-slate-400">Remember me</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition border border-emerald-400/30"
                        >
                            {processing ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-400">
                            Don't have an account?{' '}
                            <a href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
                                Create Account
                            </a>
                        </p>
                    </div>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-4 bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-2">Default Accounts</p>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="bg-slate-950/60 rounded-lg px-2 py-1.5 border border-slate-800">
                            <span className="text-emerald-400 font-bold block">Admin</span>
                            <span className="text-slate-500">admin@winzelle.com</span>
                        </div>
                        <div className="bg-slate-950/60 rounded-lg px-2 py-1.5 border border-slate-800">
                            <span className="text-teal-400 font-bold block">Owner</span>
                            <span className="text-slate-500">owner@winzelle.com</span>
                        </div>
                        <div className="bg-slate-950/60 rounded-lg px-2 py-1.5 border border-slate-800">
                            <span className="text-slate-300 font-bold block">Checker</span>
                            <span className="text-slate-500">checker@winzelle.com</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5">Password: password123</p>
                </div>
            </div>
        </div>
    );
}
