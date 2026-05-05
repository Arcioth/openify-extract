// popup.js for Openify Extract

document.addEventListener('DOMContentLoaded', async () => {
    const noDataView = document.getElementById('no-data');
    const hasDataView = document.getElementById('has-data');
    const playlistNameElem = document.getElementById('playlist-name');
    const trackCountElem = document.getElementById('track-count');
    const logoImg = document.getElementById('logo');

    if (logoImg) {
        const logos = ['icons/open1.png', 'icons/open2.png', 'icons/open3.png'];
        logoImg.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * logos.length);
            logoImg.src = logos[randomIndex];
            
            // Add a little spin animation effect
            logoImg.parentElement.style.transform = 'scale(1.1) rotate(180deg)';
            setTimeout(() => {
                logoImg.parentElement.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        });
    }

    const loadData = async () => {
        const storage = await chrome.storage.local.get(['extractedData', 'lastExtractedName']);
        if (storage.extractedData) {
            try {
                const tracks = JSON.parse(storage.extractedData);
                if (tracks && tracks.length > 0) {
                    noDataView.classList.add('hidden');
                    hasDataView.classList.remove('hidden');
                    playlistNameElem.innerText = storage.lastExtractedName || 'My Playlist';
                    trackCountElem.innerText = `${tracks.length} tracks`;
                    return;
                }
            } catch (e) {
                console.error("Error parsing stored data", e);
            }
        }
        noDataView.classList.remove('hidden');
        hasDataView.classList.add('hidden');
    };

    await loadData();

    document.getElementById('export-csv').onclick = () => {
        chrome.runtime.sendMessage({ action: 'initiateExport', format: 'csv' }, (response) => {
            if (response && response.status === 'success') {
                window.close();
            } else {
                alert('Export failed: ' + (response ? response.error : 'Unknown error'));
            }
        });
    };

    document.getElementById('export-json').onclick = () => {
        chrome.runtime.sendMessage({ action: 'initiateExport', format: 'json' }, (response) => {
            if (response && response.status === 'success') {
                window.close();
            } else {
                alert('Export failed: ' + (response ? response.error : 'Unknown error'));
            }
        });
    };

    document.getElementById('clear-data').onclick = async () => {
        if (confirm('Are you sure you want to clear the extracted data?')) {
            await chrome.storage.local.remove(['extractedData', 'lastExtractedName']);
            await loadData();
        }
    };
});
