import ExcelJS from 'exceljs';

export interface PurchaseExportItem {
    date: string;
    provider: string;
    quantity: number;
    product_name: string;
    purchase_price: number;
    total_purchase: number;
    dealing_price: number;
    discount: number;
    gross_amount: number;
    vat_percentage: number;
    vat_adjusted_amount: number;
    net_profit: number;
}

export interface InventoryExportItem {
    product_id: number;
    sku: string;
    category: string;
    distributor_name: string;
    product_name: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    total_valuation: number;
}

/**
 * Export Sales & Purchase data matching docs/template-inventory.xlsx EXACT colors, formulas, and styles
 */
export async function exportSalesPurchaseExcel(
    companyName: string = 'WINZELLE',
    purchases: PurchaseExportItem[],
    vatPercentage: number = 12,
    filenamePrefix: string = 'sales_purchase_report'
) {
    const wb = new ExcelJS.Workbook();
    wb.creator = `${companyName} STORE SYSTEM`;
    wb.lastModifiedBy = `${companyName} STORE SYSTEM`;
    wb.created = new Date();
    wb.modified = new Date();

    const ws = wb.addWorksheet('BIR 2023', {
        views: [{ showGridLines: true }]
    });

    // Column widths matching template-inventory.xlsx
    ws.columns = [
        { key: 'date', width: 14 },
        { key: 'provider', width: 24 },
        { key: 'quantity', width: 14 },
        { key: 'product_name', width: 32 },
        { key: 'purchase_price', width: 18 },
        { key: 'total_purchase', width: 20 },
        { key: 'dealing_price', width: 18 },
        { key: 'discount', width: 16 },
        { key: 'gross_amount', width: 20 },
        { key: 'vat', width: 18 },
        { key: 'net_profit', width: 18 },
    ];

    // Row 1 & 2: Merged Title at D1:E2 matching template-inventory.xlsx
    ws.mergeCells('D1:E2');
    const titleCell = ws.getCell('D1');
    titleCell.value = `${companyName.toUpperCase()} SALES & PURCHASE`;
    titleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF70AD47' } // Excel accent green from template
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fill surrounding merged cells to ensure consistent background rendering
    ['E1', 'D2', 'E2'].forEach(addr => {
        const c = ws.getCell(addr);
        c.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
    });

    // Row 3: Headers matching template
    const vatLabel = `${vatPercentage}% VAT`;
    const headers = [
        'DATE',
        'PROVIDER',
        'QUANTITY',
        'PRODUCT NAME',
        'PURCHASE PRICE',
        'TOTAL PURCHASE',
        'DEALING PRICE',
        'DISCOUNT ',
        'GROSS AMOUNT',
        vatLabel,
        'NET PROFIT',
    ];

    const headerRow = ws.getRow(3);
    headerRow.height = 26;
    headers.forEach((h, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = h;
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
        const isRightAligned = ['QUANTITY', 'PURCHASE PRICE', 'TOTAL PURCHASE', 'DEALING PRICE', 'DISCOUNT ', 'GROSS AMOUNT', vatLabel, 'NET PROFIT'].includes(h);
        cell.alignment = {
            horizontal: isRightAligned ? 'right' : (h === 'DATE' ? 'center' : 'left'),
            vertical: 'middle'
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF548235' } },
            bottom: { style: 'thin', color: { argb: 'FF548235' } },
            left: { style: 'thin', color: { argb: 'FF548235' } },
            right: { style: 'thin', color: { argb: 'FF548235' } },
        };
    });

    const vatMultiplier = (100 - vatPercentage) / 100;

    // Data rows starting at Row 4
    purchases.forEach((item, index) => {
        const rowNum = 4 + index;
        const row = ws.getRow(rowNum);
        row.height = 20;

        const isOdd = index % 2 === 1;
        const rowFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isOdd ? 'FFF2F8EE' : 'FFFFFFFF' }
        };

        const cellBorder = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };

        const qty = Number(item.quantity) || 0;
        const purchasePrice = Number(item.purchase_price) || 0;
        const dealingPrice = Number(item.dealing_price) || 0;
        const totalPurchase = qty * purchasePrice;
        const discount = dealingPrice - purchasePrice;
        const grossAmount = qty * dealingPrice;
        const vatAmount = grossAmount * vatMultiplier;
        const netProfit = grossAmount - totalPurchase;

        // 1. DATE
        const c1 = row.getCell(1);
        c1.value = item.date || '';
        c1.alignment = { horizontal: 'center', vertical: 'middle' };

        // 2. PROVIDER
        const c2 = row.getCell(2);
        c2.value = item.provider || '';
        c2.alignment = { horizontal: 'left', vertical: 'middle' };

        // 3. QUANTITY
        const c3 = row.getCell(3);
        c3.value = qty;
        c3.numFmt = '#,##0';
        c3.alignment = { horizontal: 'right', vertical: 'middle' };

        // 4. PRODUCT NAME
        const c4 = row.getCell(4);
        c4.value = item.product_name || '';
        c4.alignment = { horizontal: 'left', vertical: 'middle' };

        // 5. PURCHASE PRICE
        const c5 = row.getCell(5);
        c5.value = purchasePrice;
        c5.numFmt = '#,##0.00';
        c5.alignment = { horizontal: 'right', vertical: 'middle' };

        // 6. TOTAL PURCHASE (Formula matching template)
        const c6 = row.getCell(6);
        c6.value = { formula: `C${rowNum}*E${rowNum}`, result: totalPurchase };
        c6.numFmt = '#,##0.00';
        c6.alignment = { horizontal: 'right', vertical: 'middle' };

        // 7. DEALING PRICE
        const c7 = row.getCell(7);
        c7.value = dealingPrice;
        c7.numFmt = '#,##0.00';
        c7.alignment = { horizontal: 'right', vertical: 'middle' };

        // 8. DISCOUNT (Formula matching template)
        const c8 = row.getCell(8);
        c8.value = { formula: `G${rowNum}-E${rowNum}`, result: discount };
        c8.numFmt = '#,##0.00';
        c8.alignment = { horizontal: 'right', vertical: 'middle' };

        // 9. GROSS AMOUNT (Formula matching template)
        const c9 = row.getCell(9);
        c9.value = { formula: `C${rowNum}*G${rowNum}`, result: grossAmount };
        c9.numFmt = '#,##0.00';
        c9.alignment = { horizontal: 'right', vertical: 'middle' };

        // 10. 12% VAT (Formula matching template)
        const c10 = row.getCell(10);
        c10.value = { formula: `I${rowNum}*${vatMultiplier}`, result: vatAmount };
        c10.numFmt = '#,##0.00';
        c10.alignment = { horizontal: 'right', vertical: 'middle' };

        // 11. NET PROFIT (Formula matching template)
        const c11 = row.getCell(11);
        c11.value = { formula: `I${rowNum}-F${rowNum}`, result: netProfit };
        c11.numFmt = '#,##0.00';
        c11.alignment = { horizontal: 'right', vertical: 'middle' };

        for (let colIdx = 1; colIdx <= 11; colIdx++) {
            const cell = row.getCell(colIdx);
            cell.fill = rowFill;
            cell.border = cellBorder;
            cell.font = { name: 'Calibri', size: 11 };
        }
    });

    // Totals row at the bottom
    const totalRowsCount = purchases.length;
    const totalsRowNum = 4 + totalRowsCount;
    const totalsRow = ws.getRow(totalsRowNum);
    totalsRow.height = 24;

    const totalsFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEAF4E4' } // Light green accent
    };

    const totalsBorder = {
        top: { style: 'thin', color: { argb: 'FF70AD47' } },
        bottom: { style: 'double', color: { argb: 'FF70AD47' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    };

    for (let c = 1; c <= 11; c++) {
        const cell = totalsRow.getCell(c);
        cell.fill = totalsFill;
        cell.border = totalsBorder;
        cell.font = { name: 'Calibri', size: 11, bold: true };
    }

    totalsRow.getCell(5).value = 'TOTALS:';
    totalsRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };

    if (totalRowsCount > 0) {
        // F: Total purchase sum formula
        totalsRow.getCell(6).value = { formula: `SUM(F4:F${totalsRowNum - 1})` };
        totalsRow.getCell(6).numFmt = '#,##0.00';
        totalsRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

        // I: Gross amount sum formula
        totalsRow.getCell(9).value = { formula: `SUM(I4:I${totalsRowNum - 1})` };
        totalsRow.getCell(9).numFmt = '#,##0.00';
        totalsRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };

        // J: VAT sum formula
        totalsRow.getCell(10).value = { formula: `SUM(J4:J${totalsRowNum - 1})` };
        totalsRow.getCell(10).numFmt = '#,##0.00';
        totalsRow.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };

        // K: Net profit sum formula
        totalsRow.getCell(11).value = { formula: `SUM(K4:K${totalsRowNum - 1})` };
        totalsRow.getCell(11).numFmt = '#,##0.00';
        totalsRow.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export Central Inventory as Excel matching the template green styling and formulas
 */
export async function exportInventoryExcel(
    companyName: string = 'WINZELLE',
    inventories: InventoryExportItem[],
    filenamePrefix: string = 'inventory_report'
) {
    const wb = new ExcelJS.Workbook();
    wb.creator = `${companyName} STORE SYSTEM`;
    wb.lastModifiedBy = `${companyName} STORE SYSTEM`;
    wb.created = new Date();
    wb.modified = new Date();

    const ws = wb.addWorksheet('Central Inventory', {
        views: [{ showGridLines: true }]
    });

    ws.columns = [
        { key: 'product_id', width: 14 },
        { key: 'sku', width: 18 },
        { key: 'category', width: 20 },
        { key: 'distributor', width: 26 },
        { key: 'product_name', width: 34 },
        { key: 'purchase_price', width: 20 },
        { key: 'selling_price', width: 20 },
        { key: 'quantity', width: 20 },
        { key: 'valuation', width: 24 },
    ];

    // Merged Title Header
    ws.mergeCells('A1:D2');
    const titleCell = ws.getCell('A1');
    titleCell.value = `${companyName.toUpperCase()} CENTRAL INVENTORY REPORT`;
    titleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF70AD47' }
    };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    ['B1', 'C1', 'D1', 'A2', 'B2', 'C2', 'D2'].forEach(addr => {
        const c = ws.getCell(addr);
        c.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
    });

    // Row 3: Headers
    const headers = [
        'PRODUCT ID',
        'SKU',
        'CATEGORY',
        'DISTRIBUTOR',
        'PRODUCT NAME',
        'PURCHASE PRICE (PHP)',
        'SELLING PRICE (PHP)',
        'QUANTITY IN STOCK',
        'TOTAL VALUATION (PHP)',
    ];

    const headerRow = ws.getRow(3);
    headerRow.height = 26;
    headers.forEach((h, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.value = h;
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF70AD47' }
        };
        const isRightAligned = ['PURCHASE PRICE (PHP)', 'SELLING PRICE (PHP)', 'QUANTITY IN STOCK', 'TOTAL VALUATION (PHP)'].includes(h);
        cell.alignment = {
            horizontal: isRightAligned ? 'right' : (['PRODUCT ID', 'SKU'].includes(h) ? 'center' : 'left'),
            vertical: 'middle'
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF548235' } },
            bottom: { style: 'thin', color: { argb: 'FF548235' } },
            left: { style: 'thin', color: { argb: 'FF548235' } },
            right: { style: 'thin', color: { argb: 'FF548235' } },
        };
    });

    // Data rows
    inventories.forEach((item, index) => {
        const rowNum = 4 + index;
        const row = ws.getRow(rowNum);
        row.height = 20;

        const isOdd = index % 2 === 1;
        const rowFill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isOdd ? 'FFF2F8EE' : 'FFFFFFFF' }
        };

        const cellBorder = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };

        const qty = Number(item.quantity) || 0;
        const pPrice = Number(item.purchase_price) || 0;
        const sPrice = Number(item.selling_price) || 0;
        const valuation = Number(item.total_valuation) || (qty * pPrice);

        // Product ID
        const c1 = row.getCell(1);
        c1.value = item.product_id;
        c1.alignment = { horizontal: 'center', vertical: 'middle' };

        // SKU
        const c2 = row.getCell(2);
        c2.value = item.sku || 'N/A';
        c2.alignment = { horizontal: 'center', vertical: 'middle' };

        // Category
        const c3 = row.getCell(3);
        c3.value = item.category || 'General';
        c3.alignment = { horizontal: 'left', vertical: 'middle' };

        // Distributor
        const c4 = row.getCell(4);
        c4.value = item.distributor_name || 'N/A';
        c4.alignment = { horizontal: 'left', vertical: 'middle' };

        // Product Name
        const c5 = row.getCell(5);
        c5.value = item.product_name || '';
        c5.alignment = { horizontal: 'left', vertical: 'middle' };

        // Purchase Price
        const c6 = row.getCell(6);
        c6.value = pPrice;
        c6.numFmt = '#,##0.00';
        c6.alignment = { horizontal: 'right', vertical: 'middle' };

        // Selling Price
        const c7 = row.getCell(7);
        c7.value = sPrice;
        c7.numFmt = '#,##0.00';
        c7.alignment = { horizontal: 'right', vertical: 'middle' };

        // Quantity In Stock
        const c8 = row.getCell(8);
        c8.value = qty;
        c8.numFmt = '#,##0';
        c8.alignment = { horizontal: 'right', vertical: 'middle' };

        // Total Valuation (Formula)
        const c9 = row.getCell(9);
        c9.value = { formula: `F${rowNum}*H${rowNum}`, result: valuation };
        c9.numFmt = '#,##0.00';
        c9.alignment = { horizontal: 'right', vertical: 'middle' };

        for (let colIdx = 1; colIdx <= 9; colIdx++) {
            const cell = row.getCell(colIdx);
            cell.fill = rowFill;
            cell.border = cellBorder;
            cell.font = { name: 'Calibri', size: 11 };
        }
    });

    // Totals row
    const totalCount = inventories.length;
    const totalsRowNum = 4 + totalCount;
    const totalsRow = ws.getRow(totalsRowNum);
    totalsRow.height = 24;

    const totalsFill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEAF4E4' }
    };

    const totalsBorder = {
        top: { style: 'thin', color: { argb: 'FF70AD47' } },
        bottom: { style: 'double', color: { argb: 'FF70AD47' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    };

    for (let c = 1; c <= 9; c++) {
        const cell = totalsRow.getCell(c);
        cell.fill = totalsFill;
        cell.border = totalsBorder;
        cell.font = { name: 'Calibri', size: 11, bold: true };
    }

    totalsRow.getCell(5).value = 'TOTALS:';
    totalsRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };

    if (totalCount > 0) {
        totalsRow.getCell(8).value = { formula: `SUM(H4:H${totalsRowNum - 1})` };
        totalsRow.getCell(8).numFmt = '#,##0';
        totalsRow.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };

        totalsRow.getCell(9).value = { formula: `SUM(I4:I${totalsRowNum - 1})` };
        totalsRow.getCell(9).numFmt = '#,##0.00';
        totalsRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export Sales & Purchase as CSV strictly matching the template layout
 */
export function exportSalesPurchaseCSV(
    companyName: string = 'WINZELLE',
    purchases: PurchaseExportItem[],
    vatPercentage: number = 12,
    filenamePrefix: string = 'sales_purchase_report'
) {
    const title = `${companyName.toUpperCase()} SALES & PURCHASE`;
    const vatHeader = `${vatPercentage}% VAT`;

    const headers = [
        'DATE',
        'PROVIDER',
        'QUANTITY',
        'PRODUCT NAME',
        'PURCHASE PRICE',
        'TOTAL PURCHASE',
        'DEALING PRICE',
        'DISCOUNT ',
        'GROSS AMOUNT',
        vatHeader,
        'NET PROFIT',
    ];

    let sumTotalPurchase = 0;
    let sumGrossAmount = 0;
    let sumVatAdjusted = 0;
    let sumNetProfit = 0;

    const rows = purchases.map((item) => {
        const qty = Number(item.quantity) || 0;
        const purchasePrice = Number(item.purchase_price) || 0;
        const totalPurchase = Number(item.total_purchase) || qty * purchasePrice;
        const dealingPrice = Number(item.dealing_price) || 0;
        const discount = Number(item.discount) || (dealingPrice - purchasePrice);
        const grossAmount = Number(item.gross_amount) || qty * dealingPrice;
        const vatAmount = Number(item.vat_adjusted_amount) || (grossAmount * (1 - (vatPercentage / 100)));
        const netProfit = Number(item.net_profit) || (grossAmount - totalPurchase);

        sumTotalPurchase += totalPurchase;
        sumGrossAmount += grossAmount;
        sumVatAdjusted += vatAmount;
        sumNetProfit += netProfit;

        return [
            item.date || '',
            item.provider || '',
            qty,
            item.product_name || '',
            purchasePrice.toFixed(2),
            totalPurchase.toFixed(2),
            dealingPrice.toFixed(2),
            discount.toFixed(2),
            grossAmount.toFixed(2),
            vatAmount.toFixed(2),
            netProfit.toFixed(2),
        ];
    });

    const csvLines = [
        `"","","","${title}","","","","","","",""`,
        `"","","","","","","","","","",""`,
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
        `"","","","","","","","","","",""`,
        `"","","","","TOTALS:","${sumTotalPurchase.toFixed(2)}","","","${sumGrossAmount.toFixed(2)}","${sumVatAdjusted.toFixed(2)}","${sumNetProfit.toFixed(2)}"`,
    ];

    const csvContent = csvLines.join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `${filenamePrefix}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export Central Inventory as CSV matching template rows
 */
export function exportInventoryCSV(
    companyName: string = 'WINZELLE',
    inventories: InventoryExportItem[],
    filenamePrefix: string = 'inventory_report'
) {
    const title = `${companyName.toUpperCase()} CENTRAL INVENTORY REPORT`;
    const headers = [
        'PRODUCT ID',
        'SKU',
        'CATEGORY',
        'DISTRIBUTOR',
        'PRODUCT NAME',
        'PURCHASE PRICE (PHP)',
        'SELLING PRICE (PHP)',
        'QUANTITY IN STOCK',
        'TOTAL VALUATION (PHP)',
    ];

    let sumQty = 0;
    let sumValuation = 0;

    const rows = inventories.map((item) => {
        const qty = Number(item.quantity) || 0;
        const pPrice = Number(item.purchase_price) || 0;
        const sPrice = Number(item.selling_price) || 0;
        const valuation = Number(item.total_valuation) || (qty * pPrice);

        sumQty += qty;
        sumValuation += valuation;

        return [
            item.product_id,
            item.sku || 'N/A',
            item.category || 'General',
            item.distributor_name || 'N/A',
            item.product_name || '',
            pPrice.toFixed(2),
            sPrice.toFixed(2),
            qty,
            valuation.toFixed(2),
        ];
    });

    const csvLines = [
        `"","","","${title}","","","","",""`,
        `"","","","","","","","",""`,
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
        `"","","","","","","","",""`,
        `"","","","","TOTALS:","","","${sumQty}","${sumValuation.toFixed(2)}"`,
    ];

    const csvContent = csvLines.join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `${filenamePrefix}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
