import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Warehouse, UserPlus, Eye, EyeOff, ShieldCheck, Crown, ClipboardCheck } from 'lucide-react';

const ROLES = [
    { value: 'admin', label: 'Administrator', description: 'Full access to all features, settings, and user management', icon: ShieldCheck, color: 'emerald' },
    { value: 'owner', label: 'Owner', description: 'Can manage distributors, products, purchases, and view logs', icon: Crown, color: 'teal' },
    { value: 'checker', label: 'Checker', description: 'Can view data and update inventory quantities', icon: ClipboardCheck, color: 'slate' },
];

interface RegisterProps {
    companyName?: string;
    settings?: Record<string, string>;
}

export default function Register({ companyName: propCompanyName, settings: propSettings }: RegisterProps) {
    const pageProps = (usePage().props as any) || {};
    const companyName = propCompanyName || propSettings?.company_name || pageProps.settings?.company_name || pageProps.companyName || 'WINZELLE';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('checker');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        router.post('/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            role,
        }, {
            onError: (errs: any) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
            <Head title={`Create Account - ${companyName}`} />

            {/* Background gradient effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700 items-center justify-center shadow-2xl shadow-emerald-900/40 border border-emerald-400/30 mb-4">
                        <Warehouse className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-100 bg-clip-text text-transparent">
                        {companyName}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Create your account</p>
                </div>

                {/* Register Card */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-emerald-400" />
                            Create Account
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">Set up your profile and role</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                autoFocus
                                placeholder="e.g. Juan Dela Cruz"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                            />
                            {errors.name && <p className="text-xs text-rose-400 mt-1.5">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                            />
                            {errors.email && <p className="text-xs text-rose-400 mt-1.5">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Min. 8 characters"
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
                                {errors.password && <p className="text-xs text-rose-400 mt-1.5">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Re-enter password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                />
                            </div>
                        </div>

                        {/* Role Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2">Account Role</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ROLES.map((r) => {
                                    const Icon = r.icon;
                                    const isSelected = role === r.value;
                                    return (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            className={`p-3 rounded-xl border text-center transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-950/60 border-emerald-500/60 shadow-md shadow-emerald-900/20'
                                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 mx-auto mb-1.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                                            <span className={`block text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                                                {r.label}
                                            </span>
                                            <span className="block text-[9px] text-slate-500 mt-0.5 leading-tight">
                                                {r.description.split(',')[0]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.role && <p className="text-xs text-rose-400 mt-1.5">{errors.role}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/40 transition border border-emerald-400/30"
                        >
                            {processing ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                        <p className="text-xs text-slate-400">
                            Already have an account?{' '}
                            <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
                                Sign In
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
