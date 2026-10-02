import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Props {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
}

export default function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 15, 25, 50, 100],
}: Props) {
    if (totalItems === 0) return null;

    // Generate page numbers to show (smart window around current page)
    const getVisiblePages = () => {
        const pages: number[] = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            {/* Info and Page Size selector */}
            <div className="flex items-center gap-4 flex-wrap">
                <span>
                    Showing <strong className="text-white font-mono">{startIndex}</strong> to{' '}
                    <strong className="text-white font-mono">{endIndex}</strong> of{' '}
                    <strong className="text-emerald-400 font-mono">{totalItems}</strong> entries
                </span>

                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Rows per page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
                    >
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center space-x-1">
                    {/* First Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="First Page"
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronsLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* Prev Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Previous Page"
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>

                    {/* Page Numbers */}
                    {visiblePages.map((pageNum) => (
                        <button
                            key={pageNum}
                            type="button"
                            onClick={() => onPageChange(pageNum)}
                            className={`min-w-[30px] h-[30px] rounded-lg text-xs font-bold font-mono transition border ${
                                pageNum === currentPage
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-md shadow-emerald-950/50'
                                    : 'border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    {/* Next Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Next Page"
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    {/* Last Page */}
                    <button
                        type="button"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Last Page"
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                        <ChevronsRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
