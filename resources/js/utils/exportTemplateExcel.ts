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
    product_id?: number;
    sku: string;
    category: string;
    distributor_name: string;
    product_name: string;
    purchase_price: number;
    selling_price: number;
    quantity: number;
    stock_status?: string;
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
    wb.creator = `${companyName} WAREHOUSE SYSTEM`;
    wb.lastModifiedBy = `${companyName} WAREHOUSE SYSTEM`;
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

    // Clean company name to avoid duplicate "STORE" (e.g. WINZELLE STORE STORE)
    const cleanCompany = (companyName || 'WINZELLE').trim().replace(/\s+STORE$/i, '').trim();
    const title = `${cleanCompany.toUpperCase()} STORE SALES & PURCHASE`;

    // Row 1 & 2: Full-width Header Banner across all 11 columns (A to K)
    ws.mergeCells('A1:K2');
    const titleCell = ws.getCell('A1');
    titleCell.value = title;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    for (let r = 1; r <= 2; r++) {
        const row = ws.getRow(r);
        row.height = 22;
        for (let c = 1; c <= 11; c++) {
            row.getCell(c).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF70AD47' } // Theme accent green matching inventory
            };
        }
    }

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

    let sumQty = 0;
    let sumTotalPurchase = 0;
    let sumGrossAmount = 0;
    let sumVatAdjusted = 0;
    let sumNetProfit = 0;

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

        sumQty += qty;
        sumTotalPurchase += totalPurchase;
        sumGrossAmount += grossAmount;
        sumVatAdjusted += vatAmount;
        sumNetProfit += netProfit;

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

    totalsRow.getCell(2).value = `TOTALS (${totalRowsCount} Txns):`;
    totalsRow.getCell(2).alignment = { horizontal: 'right', vertical: 'middle' };

    let avgPurchasePrice = 0;
    let avgDealingPrice = 0;
    let avgDiscount = 0;

    if (totalRowsCount > 0) {
        avgPurchasePrice = purchases.reduce((sum, p) => sum + (Number(p.purchase_price) || 0), 0) / totalRowsCount;
        avgDealingPrice = purchases.reduce((sum, p) => sum + (Number(p.dealing_price) || 0), 0) / totalRowsCount;
        avgDiscount = purchases.reduce((sum, p) => sum + (Number(p.discount) || 0), 0) / totalRowsCount;

        // Col 3: Total Quantity
        totalsRow.getCell(3).value = { formula: `SUM(C4:C${totalsRowNum - 1})`, result: sumQty };
        totalsRow.getCell(3).numFmt = '#,##0';
        totalsRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 5: Average Purchase Price
        totalsRow.getCell(5).value = { formula: `AVERAGE(E4:E${totalsRowNum - 1})`, result: avgPurchasePrice };
        totalsRow.getCell(5).numFmt = '#,##0.00';
        totalsRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 6: Total Purchase Sum Formula
        totalsRow.getCell(6).value = { formula: `SUM(F4:F${totalsRowNum - 1})`, result: sumTotalPurchase };
        totalsRow.getCell(6).numFmt = '#,##0.00';
        totalsRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 7: Average Dealing Price
        totalsRow.getCell(7).value = { formula: `AVERAGE(G4:G${totalsRowNum - 1})`, result: avgDealingPrice };
        totalsRow.getCell(7).numFmt = '#,##0.00';
        totalsRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 8: Average Discount
        totalsRow.getCell(8).value = { formula: `AVERAGE(H4:H${totalsRowNum - 1})`, result: avgDiscount };
        totalsRow.getCell(8).numFmt = '#,##0.00';
        totalsRow.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 9: Gross Amount Sum Formula
        totalsRow.getCell(9).value = { formula: `SUM(I4:I${totalsRowNum - 1})`, result: sumGrossAmount };
        totalsRow.getCell(9).numFmt = '#,##0.00';
        totalsRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 10: VAT Sum Formula
        totalsRow.getCell(10).value = { formula: `SUM(J4:J${totalsRowNum - 1})`, result: sumVatAdjusted };
        totalsRow.getCell(10).numFmt = '#,##0.00';
        totalsRow.getCell(10).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 11: Net Profit Sum Formula
        totalsRow.getCell(11).value = { formula: `SUM(K4:K${totalsRowNum - 1})`, result: sumNetProfit };
        totalsRow.getCell(11).numFmt = '#,##0.00';
        totalsRow.getCell(11).alignment = { horizontal: 'right', vertical: 'middle' };
    } else {
        totalsRow.getCell(3).value = 0;
        totalsRow.getCell(6).value = 0;
        totalsRow.getCell(9).value = 0;
        totalsRow.getCell(10).value = 0;
        totalsRow.getCell(11).value = 0;
    }

    // Supplementary Summary Statistics Section (matching inventory styling)
    const statsStartRow = totalsRowNum + 2;
    ws.mergeCells(`D${statsStartRow}:F${statsStartRow}`);
    const statsHeader = ws.getCell(`D${statsStartRow}`);
    statsHeader.value = 'SALES & PURCHASE SUMMARY STATISTICS';
    statsHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    statsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } };
    statsHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    ['E', 'F'].forEach(cLetter => {
        ws.getCell(`${cLetter}${statsStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } };
    });

    const statRows: [string, number, string][] = [
        ['Total Transactions', totalRowsCount, '#,##0'],
        ['Total Units Quantity', sumQty, '#,##0'],
        ['Average Purchase Price', avgPurchasePrice, '₱#,##0.00'],
        ['Average Dealing Price', avgDealingPrice, '₱#,##0.00'],
        ['Total Purchase Cost', sumTotalPurchase, '₱#,##0.00'],
        ['Total Gross Sales', sumGrossAmount, '₱#,##0.00'],
        [`Total ${vatPercentage}% VAT Amount`, sumVatAdjusted, '₱#,##0.00'],
        ['Total Net Profit', sumNetProfit, '₱#,##0.00'],
        ['Overall Profit Margin', sumGrossAmount > 0 ? (sumNetProfit / sumGrossAmount) * 100 : 0, '0.00"%"'],
    ];

    statRows.forEach((stat, sIdx) => {
        const rNum = statsStartRow + 1 + sIdx;
        const r = ws.getRow(rNum);
        r.height = 19;

        // Label in Col D & E merged
        ws.mergeCells(`D${rNum}:E${rNum}`);
        const cLabel = r.getCell(4);
        cLabel.value = stat[0];
        cLabel.font = { name: 'Calibri', size: 10, bold: true };
        cLabel.alignment = { horizontal: 'left', vertical: 'middle' };
        [4, 5].forEach(colIdx => {
            const cell = r.getCell(colIdx);
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            };
        });

        // Value in Col F
        const cVal = r.getCell(6);
        cVal.value = stat[1];
        cVal.alignment = { horizontal: 'right', vertical: 'middle' };
        cVal.font = { name: 'Calibri', size: 10, bold: true };
        cVal.numFmt = stat[2];
        cVal.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
    });

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
    wb.creator = `${companyName} WAREHOUSE SYSTEM`;
    wb.lastModifiedBy = `${companyName} WAREHOUSE SYSTEM`;
    wb.created = new Date();
    wb.modified = new Date();

    const ws = wb.addWorksheet('Central Inventory', {
        views: [{ showGridLines: true }]
    });

    // Column widths matching inventory table (NO PRODUCT ID)
    ws.columns = [
        { key: 'sku', width: 18 },
        { key: 'category', width: 22 },
        { key: 'distributor', width: 28 },
        { key: 'product_name', width: 36 },
        { key: 'purchase_price', width: 20 },
        { key: 'selling_price', width: 20 },
        { key: 'quantity', width: 18 },
        { key: 'stock_status', width: 18 },
        { key: 'valuation', width: 24 },
    ];

    // Merged Title Header across all 9 columns (A to I)
    ws.mergeCells('A1:I2');
    const titleCell = ws.getCell('A1');
    titleCell.value = `${companyName.toUpperCase()} CENTRAL INVENTORY REPORT`;
    titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    for (let r = 1; r <= 2; r++) {
        const row = ws.getRow(r);
        row.height = 20;
        for (let c = 1; c <= 9; c++) {
            row.getCell(c).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF70AD47' }
            };
        }
    }

    // Row 3: Headers (Exact Inventory Table Columns)
    const headers = [
        'SKU',
        'CATEGORY',
        'DISTRIBUTOR',
        'PRODUCT NAME',
        'PURCHASE PRICE (PHP)',
        'SELLING PRICE (PHP)',
        'STOCK QUANTITY',
        'STOCK STATUS',
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
        const isRightAligned = ['PURCHASE PRICE (PHP)', 'SELLING PRICE (PHP)', 'STOCK QUANTITY', 'TOTAL VALUATION (PHP)'].includes(h);
        cell.alignment = {
            horizontal: isRightAligned ? 'right' : (['SKU', 'STOCK STATUS'].includes(h) ? 'center' : 'left'),
            vertical: 'middle'
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF548235' } },
            bottom: { style: 'thin', color: { argb: 'FF548235' } },
            left: { style: 'thin', color: { argb: 'FF548235' } },
            right: { style: 'thin', color: { argb: 'FF548235' } },
        };
    });

    let sumQty = 0;
    let sumPurchasePrice = 0;
    let sumSellingPrice = 0;
    let sumValuation = 0;
    let sumSellingValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;

    // Data rows starting at Row 4
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
        const sellingVal = qty * sPrice;
        const isLow = qty <= 15;
        const status = item.stock_status || (isLow ? 'Low Stock' : 'In Stock');

        sumQty += qty;
        sumPurchasePrice += pPrice;
        sumSellingPrice += sPrice;
        sumValuation += valuation;
        sumSellingValuation += sellingVal;
        if (isLow) lowStockCount++;
        else inStockCount++;

        // 1. SKU
        const c1 = row.getCell(1);
        c1.value = item.sku || 'N/A';
        c1.alignment = { horizontal: 'center', vertical: 'middle' };

        // 2. CATEGORY
        const c2 = row.getCell(2);
        c2.value = item.category || 'General';
        c2.alignment = { horizontal: 'left', vertical: 'middle' };

        // 3. DISTRIBUTOR
        const c3 = row.getCell(3);
        c3.value = item.distributor_name || 'N/A';
        c3.alignment = { horizontal: 'left', vertical: 'middle' };

        // 4. PRODUCT NAME
        const c4 = row.getCell(4);
        c4.value = item.product_name || '';
        c4.alignment = { horizontal: 'left', vertical: 'middle' };

        // 5. PURCHASE PRICE
        const c5 = row.getCell(5);
        c5.value = pPrice;
        c5.numFmt = '#,##0.00';
        c5.alignment = { horizontal: 'right', vertical: 'middle' };

        // 6. SELLING PRICE
        const c6 = row.getCell(6);
        c6.value = sPrice;
        c6.numFmt = '#,##0.00';
        c6.alignment = { horizontal: 'right', vertical: 'middle' };

        // 7. STOCK QUANTITY
        const c7 = row.getCell(7);
        c7.value = qty;
        c7.numFmt = '#,##0';
        c7.alignment = { horizontal: 'right', vertical: 'middle' };

        // 8. STOCK STATUS
        const c8 = row.getCell(8);
        c8.value = status;
        c8.alignment = { horizontal: 'center', vertical: 'middle' };
        if (isLow) {
            c8.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFC00000' } };
        } else {
            c8.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF375623' } };
        }

        // 9. TOTAL VALUATION (Formula: Purchase Price * Quantity -> E*G)
        const c9 = row.getCell(9);
        c9.value = { formula: `E${rowNum}*G${rowNum}`, result: valuation };
        c9.numFmt = '#,##0.00';
        c9.alignment = { horizontal: 'right', vertical: 'middle' };

        for (let colIdx = 1; colIdx <= 9; colIdx++) {
            const cell = row.getCell(colIdx);
            cell.fill = rowFill;
            cell.border = cellBorder;
            if (colIdx !== 8) {
                cell.font = { name: 'Calibri', size: 11 };
            }
        }
    });

    // Complete Totals row
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

    // Col 4: TOTALS label
    totalsRow.getCell(4).value = `TOTALS (${totalCount} SKUs):`;
    totalsRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };

    if (totalCount > 0) {
        const avgPPrice = sumPurchasePrice / totalCount;
        const avgSPrice = sumSellingPrice / totalCount;

        // Col 5: Average Purchase Price
        totalsRow.getCell(5).value = { formula: `AVERAGE(E4:E${totalsRowNum - 1})`, result: avgPPrice };
        totalsRow.getCell(5).numFmt = '#,##0.00';
        totalsRow.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 6: Average Selling Price
        totalsRow.getCell(6).value = { formula: `AVERAGE(F4:F${totalsRowNum - 1})`, result: avgSPrice };
        totalsRow.getCell(6).numFmt = '#,##0.00';
        totalsRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 7: Total Stock Quantity (Sum)
        totalsRow.getCell(7).value = { formula: `SUM(G4:G${totalsRowNum - 1})`, result: sumQty };
        totalsRow.getCell(7).numFmt = '#,##0';
        totalsRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

        // Col 8: Stock Status Summary
        totalsRow.getCell(8).value = `${inStockCount} In / ${lowStockCount} Low`;
        totalsRow.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
        totalsRow.getCell(8).font = { name: 'Calibri', size: 9, bold: true };

        // Col 9: Total Inventory Valuation (Sum)
        totalsRow.getCell(9).value = { formula: `SUM(I4:I${totalsRowNum - 1})`, result: sumValuation };
        totalsRow.getCell(9).numFmt = '#,##0.00';
        totalsRow.getCell(9).alignment = { horizontal: 'right', vertical: 'middle' };
    } else {
        totalsRow.getCell(7).value = 0;
        totalsRow.getCell(9).value = 0;
    }

    // Supplementary Summary Statistics Section
    const statsStartRow = totalsRowNum + 2;
    ws.mergeCells(`C${statsStartRow}:D${statsStartRow}`);
    const statsHeader = ws.getCell(`C${statsStartRow}`);
    statsHeader.value = 'INVENTORY SUMMARY STATISTICS';
    statsHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    statsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } };
    statsHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getCell(`D${statsStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF548235' } };

    const statRows: [string, number][] = [
        ['Total Products / SKUs', totalCount],
        ['Total Units In Stock', sumQty],
        ['Healthy Stock Products', inStockCount],
        ['Low Stock Alerts (<= 15 units)', lowStockCount],
        ['Total Inventory Valuation (Cost)', sumValuation],
        ['Total Retail Valuation (Selling)', sumSellingValuation],
        ['Potential Gross Profit', sumSellingValuation - sumValuation],
    ];

    statRows.forEach((stat, sIdx) => {
        const rNum = statsStartRow + 1 + sIdx;
        const r = ws.getRow(rNum);
        r.height = 18;

        const cLabel = r.getCell(3);
        cLabel.value = stat[0];
        cLabel.font = { name: 'Calibri', size: 10, bold: true };
        cLabel.alignment = { horizontal: 'left', vertical: 'middle' };
        cLabel.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };

        const cVal = r.getCell(4);
        cVal.value = stat[1];
        cVal.alignment = { horizontal: 'right', vertical: 'middle' };
        cVal.font = { name: 'Calibri', size: 10, bold: true };
        cVal.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
        if (sIdx >= 4) {
            cVal.numFmt = '₱#,##0.00';
        } else {
            cVal.numFmt = '#,##0';
        }
    });

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
    const cleanCompany = (companyName || 'WINZELLE').trim().replace(/\s+STORE$/i, '').trim();
    const title = `${cleanCompany.toUpperCase()} STORE SALES & PURCHASE`;
    const vatHeader = `${vatPercentage}% VAT`;

    const headers = [
        'DATE',
        'PROVIDER',
        'QUANTITY',
        'PRODUCT NAME',
        'PURCHASE PRICE',
        'TOTAL PURCHASE',
        'DEALING PRICE',
        'DISCOUNT',
        'GROSS AMOUNT',
        vatHeader,
        'NET PROFIT',
    ];

    let sumQty = 0;
    let sumPurchasePrice = 0;
    let sumDealingPrice = 0;
    let sumDiscount = 0;
    let sumTotalPurchase = 0;
    let sumGrossAmount = 0;
    let sumVatAdjusted = 0;
    let sumNetProfit = 0;

    const rows = purchases.map((item) => {
        const qty = Number(item.quantity) || 0;
        const purchasePrice = Number(item.purchase_price) || 0;
        const dealingPrice = Number(item.dealing_price) || 0;
        const totalPurchase = Number(item.total_purchase) || (qty * purchasePrice);
        const discount = Number(item.discount) || (dealingPrice - purchasePrice);
        const grossAmount = Number(item.gross_amount) || (qty * dealingPrice);
        const vatMultiplier = (1 - (vatPercentage / 100));
        const vatAmount = Number(item.vat_adjusted_amount) || (grossAmount * vatMultiplier);
        const netProfit = Number(item.net_profit) || (grossAmount - totalPurchase);

        sumQty += qty;
        sumPurchasePrice += purchasePrice;
        sumDealingPrice += dealingPrice;
        sumDiscount += discount;
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

    const totalCount = purchases.length;
    const avgPurchasePrice = totalCount > 0 ? (sumPurchasePrice / totalCount).toFixed(2) : '0.00';
    const avgDealingPrice = totalCount > 0 ? (sumDealingPrice / totalCount).toFixed(2) : '0.00';
    const avgDiscount = totalCount > 0 ? (sumDiscount / totalCount).toFixed(2) : '0.00';
    const profitMargin = sumGrossAmount > 0 ? ((sumNetProfit / sumGrossAmount) * 100).toFixed(2) : '0.00';

    const csvLines = [
        `"","","","${title}","","","","","","",""`,
        `"","","","","","","","","","",""`,
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
        `"","","","","","","","","","",""`,
        `"","TOTALS (${totalCount} Transactions):","${sumQty}","","${avgPurchasePrice}","${sumTotalPurchase.toFixed(2)}","${avgDealingPrice}","${avgDiscount}","${sumGrossAmount.toFixed(2)}","${sumVatAdjusted.toFixed(2)}","${sumNetProfit.toFixed(2)}"`,
        `"","","","","","","","","","",""`,
        `"SALES & PURCHASE SUMMARY STATISTICS:","","","","","","","","","",""`,
        `"Total Transactions","${totalCount}","","","","","","","","",""`,
        `"Total Units Quantity","${sumQty}","","","","","","","","",""`,
        `"Average Purchase Price (PHP)","${avgPurchasePrice}","","","","","","","","",""`,
        `"Average Dealing Price (PHP)","${avgDealingPrice}","","","","","","","","",""`,
        `"Total Purchase Cost (PHP)","${sumTotalPurchase.toFixed(2)}","","","","","","","","",""`,
        `"Total Gross Sales (PHP)","${sumGrossAmount.toFixed(2)}","","","","","","","","",""`,
        `"Total ${vatPercentage}% VAT (PHP)","${sumVatAdjusted.toFixed(2)}","","","","","","","","",""`,
        `"Total Net Profit (PHP)","${sumNetProfit.toFixed(2)}","","","","","","","","",""`,
        `"Overall Profit Margin","${profitMargin}%","","","","","","","","",""`,
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
    URL.revokeObjectURL(url);
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
        'SKU',
        'CATEGORY',
        'DISTRIBUTOR',
        'PRODUCT NAME',
        'PURCHASE PRICE (PHP)',
        'SELLING PRICE (PHP)',
        'STOCK QUANTITY',
        'STOCK STATUS',
        'TOTAL VALUATION (PHP)',
    ];

    let sumQty = 0;
    let sumPurchasePrice = 0;
    let sumSellingPrice = 0;
    let sumValuation = 0;
    let sumSellingValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;

    const rows = inventories.map((item) => {
        const qty = Number(item.quantity) || 0;
        const pPrice = Number(item.purchase_price) || 0;
        const sPrice = Number(item.selling_price) || 0;
        const valuation = Number(item.total_valuation) || (qty * pPrice);
        const sellingVal = qty * sPrice;
        const isLow = qty <= 15;
        const status = item.stock_status || (isLow ? 'Low Stock' : 'In Stock');

        sumQty += qty;
        sumPurchasePrice += pPrice;
        sumSellingPrice += sPrice;
        sumValuation += valuation;
        sumSellingValuation += sellingVal;
        if (isLow) lowStockCount++;
        else inStockCount++;

        return [
            item.sku || 'N/A',
            item.category || 'General',
            item.distributor_name || 'N/A',
            item.product_name || '',
            pPrice.toFixed(2),
            sPrice.toFixed(2),
            qty,
            status,
            valuation.toFixed(2),
        ];
    });

    const totalCount = inventories.length;
    const avgPPrice = totalCount > 0 ? (sumPurchasePrice / totalCount).toFixed(2) : '0.00';
    const avgSPrice = totalCount > 0 ? (sumSellingPrice / totalCount).toFixed(2) : '0.00';

    const csvLines = [
        `"","","","${title}","","","","",""`,
        `"","","","","","","","",""`,
        headers.map((h) => `"${h}"`).join(','),
        ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
        `"","","","","","","","",""`,
        `"","","","TOTALS (${totalCount} SKUs):","${avgPPrice}","${avgSPrice}","${sumQty}","${inStockCount} In / ${lowStockCount} Low","${sumValuation.toFixed(2)}"`,
        `"","","","","","","","",""`,
        `"INVENTORY SUMMARY STATISTICS:","","","","","","","",""`,
        `"Total Products / SKUs","${totalCount}","","","","","","",""`,
        `"Total Units In Stock","${sumQty}","","","","","","",""`,
        `"Healthy Stock Products","${inStockCount}","","","","","","",""`,
        `"Low Stock Alerts (<= 15 units)","${lowStockCount}","","","","","","",""`,
        `"Total Inventory Valuation (Cost PHP)","${sumValuation.toFixed(2)}","","","","","","",""`,
        `"Total Retail Valuation (Selling PHP)","${sumSellingValuation.toFixed(2)}","","","","","","",""`,
        `"Potential Gross Profit (PHP)","${(sumSellingValuation - sumValuation).toFixed(2)}","","","","","","",""`,
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
