import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { SortDirection } from '@/hooks/useTablePaginationAndSort';

interface Props {
    label: string;
    sortKey: string;
    currentSortKey: string | null;
    currentDirection: SortDirection;
    onSort: (key: string) => void;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export default function SortableHeader({
    label,
    sortKey,
    currentSortKey,
    currentDirection,
    onSort,
    align = 'left',
    className = '',
}: Props) {
    const isSorted = currentSortKey === sortKey;

    const alignClass = {
        left: 'justify-start text-left',
        center: 'justify-center text-center',
        right: 'justify-end text-right',
    }[align];

    return (
        <th
            onClick={() => onSort(sortKey)}
            className={`py-3 px-3 cursor-pointer select-none group transition-colors hover:bg-white/5 ${className}`}
            title={`Sort by ${label}`}
        >
            <div className={`flex items-center gap-1.5 ${alignClass}`}>
                <span className={`font-bold uppercase tracking-wider text-[11px] ${
                    isSorted ? 'text-emerald-300 font-extrabold' : 'text-slate-300 group-hover:text-white'
                }`}>
                    {label}
                </span>
                <span className="shrink-0 transition-transform">
                    {isSorted ? (
                        currentDirection === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-emerald-400" />
                        )
                    ) : (
                        <ArrowUpDown className="h-3 w-3 text-slate-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    )}
                </span>
            </div>
        </th>
    );
}
