const fs = require('fs');
const path = require('path');

// 1. Fix Distributors/Index.tsx
const distPath = path.resolve('C:/xampp/htdocs/subsystem2-dev/resources/js/pages/Distributors/Index.tsx');
let distCode = fs.readFileSync(distPath, 'utf8');

distCode = distCode.replace(
interface Distributor {
    id: number;
    name: string;
    contact_number: string;
    email?: string;
    address?: string;
    logo?: string;,
interface Distributor {
    id: number;
    name: string;
    contact_number: string;
    email?: string | null;
    address?: string | null;
    logo?: string | null;
);

fs.writeFileSync(distPath, distCode, 'utf8');
console.log('Distributors/Index.tsx updated');

// 2. Fix SalesPurchase/Index.tsx
const spPath = path.resolve('C:/xampp/htdocs/subsystem2-dev/resources/js/pages/SalesPurchase/Index.tsx');
let spCode = fs.readFileSync(spPath, 'utf8');

spCode = spCode.replace(
        setPage,
        setPageSize,
    } = useTablePaginationAndSort({
        data: purchases,,
        setPage,
        setPageSize,
        startIndex,
        endIndex,
    } = useTablePaginationAndSort({
        data: purchases,
);

spCode = spCode.replace(
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />,
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
);

fs.writeFileSync(spPath, spCode, 'utf8');
console.log('SalesPurchase/Index.tsx updated');

// 3. Fix Inventory/Index.tsx
const invPath = path.resolve('C:/xampp/htdocs/subsystem2-dev/resources/js/pages/Inventory/Index.tsx');
let invCode = fs.readFileSync(invPath, 'utf8');

invCode = invCode.replace(
        setPage,
        setPageSize,
    } = useTablePaginationAndSort({
        data: enrichedInventories,,
        setPage,
        setPageSize,
        startIndex,
        endIndex,
    } = useTablePaginationAndSort({
        data: enrichedInventories,
);

invCode = invCode.replace(
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />,
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            onPageSizeChange={setPageSize}
                        />
);

// Fix label in liveAnalysis
invCode = invCode.replace(
        const topValPoint = valuationLineData.points[0];
        const topValPct = (topValPoint && summary.total_valuation > 0)
            ? Math.round((topValPoint.val / summary.total_valuation) * 100)
            : 0;
        const valuationInsight = topValPoint
            ? \Capital is concentrated in \ at \ (\% of total warehouse assets).\
            : \Total asset valuation stands at \.\;,
        const topValPoint = valuationLineData.points[0];
        const topValPct = (topValPoint && summary.total_valuation > 0)
            ? Math.round((topValPoint.val / summary.total_valuation) * 100)
            : 0;
        const valuationInsight = topValPoint
            ? \Capital is concentrated in \ at \ (\% of total warehouse assets).\
            : \Total asset valuation stands at \.\;
);

// Fix topValuationCat fallback
invCode = invCode.replace(
        const topValuationCat = valuationLineData.points[0] || { label: 'General', val: 0 };,
        const topValuationCat = valuationLineData.points[0] || { name: 'General', val: 0 };
);

// Fix modal label/val references in valuation table and text
invCode = invCode.replace(
Total capital allocated across warehouse stock is <strong className=text-emerald-300>{formatCurrency(summary.total_valuation)}</strong>. The highest monetary investment is in <strong className=text-white>{realTimeAnalysis.topValuationCat.name || realTimeAnalysis.topValuationCat.label}</strong> at <strong className=text-white>{formatCurrency(realTimeAnalysis.topValuationCat.val || 0)} ({realTimeAnalysis.topValuationPct}%)</strong> of valuation.,
Total capital allocated across warehouse stock is <strong className=text-emerald-300>{formatCurrency(summary.total_valuation)}</strong>. The highest monetary investment is in <strong className=text-white>{realTimeAnalysis.topValuationCat.name}</strong> at <strong className=text-white>{formatCurrency(realTimeAnalysis.topValuationCat.val || 0)} ({realTimeAnalysis.topValuationPct}%)</strong> of valuation.
);

invCode = invCode.replace(
aluationLineData.points.map(p => (
                                                    <tr key={p.label || p.name} className=hover:bg-slate-900/50>
                                                        <td className=py-2 px-3 text-slate-200 font-sans font-medium>{p.label || p.name}</td>
                                                        <td className=py-2 px-3 text-right text-emerald-300 font-bold>{formatCurrency(p.val || p.value || 0)}</td>
                                                        <td className=py-2 px-3 text-right text-slate-400>
                                                            {summary.total_valuation > 0 ? Math.round(((p.val || p.value || 0) / summary.total_valuation) * 100) : 0}%
                                                        </td>
                                                    </tr>
                                                )),
aluationLineData.points.map(p => (
                                                    <tr key={p.name} className=hover:bg-slate-900/50>
                                                        <td className=py-2 px-3 text-slate-200 font-sans font-medium>{p.name}</td>
                                                        <td className=py-2 px-3 text-right text-emerald-300 font-bold>{formatCurrency(p.val || 0)}</td>
                                                        <td className=py-2 px-3 text-right text-slate-400>
                                                            {summary.total_valuation > 0 ? Math.round(((p.val || 0) / summary.total_valuation) * 100) : 0}%
                                                        </td>
                                                    </tr>
                                                ))
);

invCode = invCode.replace(
Audit pricing margins and payment terms with vendors in {realTimeAnalysis.topValuationCat.name || realTimeAnalysis.topValuationCat.label} to optimize capital turnover.,
Audit pricing margins and payment terms with vendors in {realTimeAnalysis.topValuationCat.name} to optimize capital turnover.
);

fs.writeFileSync(invPath, invCode, 'utf8');
console.log('Inventory/Index.tsx updated');
