// background.js for Openify Extract

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'initiateExport') {
        const { format } = message;
        
        (async () => {
            try {
                const storage = await chrome.storage.local.get(['extractedData']);
                let dataToExport = storage.extractedData;
                
                if (!dataToExport || dataToExport === '[]') {
                    sendResponse({ status: 'error', error: 'No data to export.' });
                    return;
                }
                
                if (typeof dataToExport === 'string') {
                    dataToExport = JSON.parse(dataToExport);
                }

                if (dataToExport.length === 0) {
                    sendResponse({ status: 'error', error: 'No data to export.' });
                    return;
                }

                if (format === 'json') {
                    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        chrome.downloads.download({
                            url: event.target.result,
                            filename: `spotify_playlist_${Date.now()}.json`,
                            saveAs: true
                        }, () => {
                            sendResponse({ status: 'success' });
                        });
                    };
                    reader.readAsDataURL(blob);
                } else if (format === 'csv') {
                    // Collect all possible headers
                    const headersSet = new Set();
                    dataToExport.forEach(row => {
                        Object.keys(row).forEach(key => headersSet.add(key));
                    });
                    const headers = Array.from(headersSet);
                    
                    // Create CSV
                    const csvContent = [
                        headers.join(','),
                        ...dataToExport.map(row =>
                            headers.map(header => {
                                let val = row[header] || '';
                                // Escape quotes and wrap in quotes for CSV format safety
                                val = val.toString().replace(/"/g, '""');
                                return `"${val}"`;
                            }).join(',')
                        )
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        chrome.downloads.download({
                            url: event.target.result,
                            filename: `spotify_playlist_${Date.now()}.csv`,
                            saveAs: true
                        }, () => {
                            sendResponse({ status: 'success' });
                        });
                    };
                    reader.readAsDataURL(blob);
                } else {
                    sendResponse({ status: 'error', error: `Unsupported format: ${format}` });
                }
            } catch (error) {
                console.error('Export error:', error);
                sendResponse({ status: 'error', error: error.message });
            }
        })();
        return true; // Indicates async response
    }
    return false;
});
