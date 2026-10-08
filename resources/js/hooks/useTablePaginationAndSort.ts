import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';

export type SortDirection = 'asc' | 'desc';

export interface LaravelPaginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface UseTableOptions<T> {
    data: T[] | LaravelPaginator<T>;
    initialSortKey?: keyof T | string;
    defaultSortKey?: keyof T | string;
    initialSortDirection?: SortDirection;
    defaultDirection?: SortDirection;
    initialPageSize?: number;
    defaultPageSize?: number;
}

export function useTablePaginationAndSort<T extends Record<string, any>>({
    data,
    initialSortKey,
    defaultSortKey,
    initialSortDirection,
    defaultDirection = 'asc',
    initialPageSize,
    defaultPageSize = 15,
}: UseTableOptions<T>) {
    const isServerPaginated = Boolean(
        data && typeof data === 'object' && !Array.isArray(data) && 'current_page' in data && 'last_page' in data
    );

    const rawList: T[] = isServerPaginated 
        ? ((data as LaravelPaginator<T>).data || [])
        : (Array.isArray(data) ? data : []);

    const startKey = (initialSortKey || defaultSortKey || null) as string | null;
    const startDirection = (initialSortDirection || defaultDirection || 'asc') as SortDirection;
    const startPageSize = isServerPaginated 
        ? (data as LaravelPaginator<T>).per_page 
        : (initialPageSize || defaultPageSize || 15);

    const [sortKey, setSortKey] = useState<string | null>(startKey);
    const [sortDirection, setSortDirection] = useState<SortDirection>(startDirection);
    const [currentPage, setCurrentPage] = useState<number>(() => {
        return isServerPaginated ? (data as LaravelPaginator<T>).current_page : 1;
    });
    const [pageSize, setPageSize] = useState<number>(startPageSize);

    // Toggle sort on a key
    const handleSort = (key: string) => {
        const nextDir = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortKey(key);
        setSortDirection(nextDir);
        setCurrentPage(1);

        if (isServerPaginated && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('sort', key);
            url.searchParams.set('direction', nextDir);
            url.searchParams.set('page', '1');
            router.get(url.pathname + url.search, {}, { preserveState: true, preserveScroll: true });
        }
    };

    // Sort data for client-side arrays
    const sortedData = useMemo(() => {
        if (isServerPaginated) return rawList;
        if (!sortKey || !rawList) return rawList || [];

        return [...rawList].sort((a, b) => {
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
    }, [rawList, sortKey, sortDirection, isServerPaginated]);

    // Total items and pages
    const totalItems = isServerPaginated ? (data as LaravelPaginator<T>).total : sortedData.length;
    const totalPages = isServerPaginated 
        ? Math.max(1, (data as LaravelPaginator<T>).last_page) 
        : Math.max(1, Math.ceil(totalItems / pageSize));

    const activePage = isServerPaginated 
        ? (data as LaravelPaginator<T>).current_page 
        : Math.min(Math.max(1, currentPage), totalPages);

    // Paginated slice
    const paginatedData = useMemo(() => {
        if (isServerPaginated) {
            return rawList;
        }
        const startIndex = (activePage - 1) * pageSize;
        return sortedData.slice(startIndex, startIndex + pageSize);
    }, [isServerPaginated, rawList, sortedData, activePage, pageSize]);

    const startIndex = isServerPaginated
        ? ((data as LaravelPaginator<T>).from ?? (totalItems === 0 ? 0 : 1))
        : (totalItems === 0 ? 0 : (activePage - 1) * pageSize + 1);

    const endIndex = isServerPaginated
        ? ((data as LaravelPaginator<T>).to ?? totalItems)
        : Math.min(activePage * pageSize, totalItems);

    const onPageChange = (newPage: number) => {
        if (isServerPaginated && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('page', String(newPage));
            router.get(url.pathname + url.search, {}, { preserveState: true, preserveScroll: true });
        } else {
            setCurrentPage(newPage);
        }
    };

    const onPageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        if (isServerPaginated && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('per_page', String(newSize));
            url.searchParams.set('page', '1');
            router.get(url.pathname + url.search, {}, { preserveState: true, preserveScroll: true });
        } else {
            setCurrentPage(1);
        }
    };

    return {
        // Sort properties
        sortKey,
        sortDirection,
        sortConfig: {
            key: sortKey,
            direction: sortDirection,
        },
        handleSort,
        requestSort: handleSort,

        // Pagination properties
        currentPage: activePage,
        setCurrentPage: onPageChange,
        setPage: onPageChange,
        pageSize: isServerPaginated ? (data as LaravelPaginator<T>).per_page : pageSize,
        setPageSize: onPageSizeChange,
        totalPages,
        totalItems,
        startIndex,
        endIndex,

        // Data arrays
        paginatedData,
        sortedData,
    };
}
