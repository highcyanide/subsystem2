export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
    const csvContent = [
        headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map(row =>
            row.map(val => {
                const str = val === null || val === undefined ? '' : String(val);
                return `"${str.replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\r\n');

    // Add UTF-8 BOM so Excel opens it with correct formatting
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
