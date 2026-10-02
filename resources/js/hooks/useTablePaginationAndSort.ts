import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseTableOptions<T> {
    data: T[];
    initialSortKey?: keyof T | string;
    defaultSortKey?: keyof T | string;
    initialSortDirection?: SortDirection;
    defaultDirection?: SortDirection;
    initialPageSize?: number;
    defaultPageSize?: number;
}

export function useTablePaginationAndSort<T extends Record<string, any>>({
    data = [],
    initialSortKey,
    defaultSortKey,
    initialSortDirection,
    defaultDirection = 'asc',
    initialPageSize,
    defaultPageSize = 15,
}: UseTableOptions<T>) {
    const startKey = (initialSortKey || defaultSortKey || null) as string | null;
    const startDirection = (initialSortDirection || defaultDirection || 'asc') as SortDirection;
    const startPageSize = initialPageSize || defaultPageSize || 15;

    const [sortKey, setSortKey] = useState<string | null>(startKey);
    const [sortDirection, setSortDirection] = useState<SortDirection>(startDirection);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(startPageSize);

    // Toggle sort on a key
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
        setCurrentPage(1); // reset to page 1 on sort change
    };

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortKey || !data) return data || [];

        return [...data].sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            // Handle nested objects (e.g. distributor.name, product.name)
            if (sortKey.includes('.')) {
                const parts = sortKey.split('.');
                valA = parts.reduce((obj, p) => (obj && obj[p] !== undefined ? obj[p] : null), a);
                valB = parts.reduce((obj, p) => (obj && obj[p] !== undefined ? obj[p] : null), b);
            }

            // Treat null/undefined
            if (valA === null || valA === undefined) valA = '';
            if (valB === null || valB === undefined) valB = '';

            // Number comparison
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDirection === 'asc' ? valA - valB : valB - valA;
            }

            // Date comparison
            const isDateA = typeof valA === 'string' && !isNaN(Date.parse(valA)) && (valA.includes('-') || valA.includes('/'));
            const isDateB = typeof valB === 'string' && !isNaN(Date.parse(valB)) && (valB.includes('-') || valB.includes('/'));
            if (isDateA && isDateB) {
                const timeA = new Date(valA).getTime();
                const timeB = new Date(valB).getTime();
                return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
            }

            // Fallback numeric string
            const numA = Number(valA);
            const numB = Number(valB);
            if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
                return sortDirection === 'asc' ? numA - numB : numB - numA;
            }

            // String comparison
            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDirection === 'asc'
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    }, [data, sortKey, sortDirection]);

    // Total pages
    const totalItems = sortedData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    // Current page bounds check
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    // Paginated slice
    const paginatedData = useMemo(() => {
        const startIndex = (validCurrentPage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [sortedData, validCurrentPage, pageSize]);

    const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

    return {
        // Sort properties (supports both sortConfig and direct properties)
        sortKey,
        sortDirection,
        sortConfig: {
            key: sortKey,
            direction: sortDirection,
        },
        handleSort,
        requestSort: handleSort,

        // Pagination properties (supports both aliases)
        currentPage: validCurrentPage,
        setCurrentPage,
        setPage: setCurrentPage,
        pageSize,
        setPageSize: (newSize: number) => {
            setPageSize(newSize);
            setCurrentPage(1);
        },
        totalPages,
        totalItems,
        startIndex,
        endIndex,

        // Data arrays
        paginatedData,
        sortedData,
    };
}
