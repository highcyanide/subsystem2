import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title = 'Confirm Action',
    message,
    confirmText = 'Yes, Delete',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 animate-scale-up">
                <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-white p-1 rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">{message}</p>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-rose-950/50 transition flex items-center gap-1.5"
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
