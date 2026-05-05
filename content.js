// content.js for Openify Extract

console.log('Openify Extract content script loaded.');

let extractionInProgress = false;
let extractedTracksMap = new Map(); 
let idleCount = 0;

const parsePlaylist = (data) => {
    const tracks = data.tracks.items.map((item, index) => {
        const track = item.track || item;
        
        let artistName = 'Unknown';
        if (track.artists) {
            if (Array.isArray(track.artists)) {
                artistName = track.artists.map(a => a.name).join(', ');
            } else if (track.artists.items) {
                artistName = track.artists.items.map(a => a.profile?.name || a.name).join(', ');
            }
        }
        
        let albumName = 'Unknown';
        if (track.album) {
            albumName = track.album.name || track.album;
        } else if (track.albumOfTrack) {
            albumName = track.albumOfTrack.name;
        }

        let duration = '?';
        if (track.duration_ms) {
            duration = (track.duration_ms / 1000).toFixed(0) + 's';
        } else if (track.duration?.totalMilliseconds) {
            duration = (track.duration.totalMilliseconds / 1000).toFixed(0) + 's';
        }

        return {
            id: track.id || `track-${index}-${Date.now()}`,
            name: track.name || 'Unknown',
            artist: artistName,
            album: albumName,
            duration: duration,
            uri: track.uri || ''
        };
    });
    
    return {
        name: data.name || document.title.replace(' - Spotify', '').trim() || 'Playlist',
        tracks: tracks
    };
};

const scrapeFromDOM = () => {
    const trackRows = document.querySelectorAll('[data-testid="tracklist-row"]');
    if (trackRows.length === 0) return null;

    const tracks = Array.from(trackRows).map((row, index) => {
        const nameElem = row.querySelector('[data-testid="internal-track-link"]');
        const artistElems = row.querySelectorAll('a[href^="/artist/"]');
        const albumElem = row.querySelector('a[href^="/album/"]');
        
        let id = `dom-track-${index}`;
        if (nameElem && nameElem.href) {
            const match = nameElem.href.match(/\/track\/([a-zA-Z0-9]+)/);
            if (match) id = match[1];
        }

        return {
            id: id,
            name: nameElem ? nameElem.innerText : 'Unknown',
            artist: artistElems.length > 0 ? Array.from(artistElems).map(a => a.innerText).join(', ') : 'Unknown',
            album: albumElem ? albumElem.innerText : 'Unknown',
            duration: '?',
            uri: ''
        };
    });

    return {
        name: document.querySelector('h1')?.innerText || 'Playlist',
        tracks: tracks
    };
};

const performExtractionStep = () => {
    let foundNew = false;
    
    // 1. Try JSON extraction from scripts
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
        try {
            const content = script.textContent;
            if (content.includes('tracks') && content.includes('items')) {
                const data = JSON.parse(content);
                let found = null;
                const findTracks = (obj) => {
                    if (!obj || typeof obj !== 'object' || found) return;
                    if (obj.tracks && obj.tracks.items && Array.isArray(obj.tracks.items)) {
                        found = obj;
                        return;
                    }
                    for (const key in obj) findTracks(obj[key]);
                };
                findTracks(data);
                if (found) {
                    const result = parsePlaylist(found);
                    result.tracks.forEach(t => {
                        if (!extractedTracksMap.has(t.id)) {
                            extractedTracksMap.set(t.id, t);
                            foundNew = true;
                        }
                    });
                }
            }
        } catch (e) {}
    }

    // 2. Try DOM extraction
    const domResult = scrapeFromDOM();
    if (domResult) {
        domResult.tracks.forEach(t => {
            if (!extractedTracksMap.has(t.id) || extractedTracksMap.get(t.id).duration === '?') {
                extractedTracksMap.set(t.id, t);
                foundNew = true;
            }
        });
    }
    
    return foundNew;
};

const startManualExtraction = async (btn) => {
    if (extractionInProgress) {
        // Stop early if clicked again
        return finishExtraction(btn);
    }
    
    extractionInProgress = true;
    extractedTracksMap.clear();
    idleCount = 0;

    btn.innerText = 'Extracting... (Scroll Down!)';
    btn.style.backgroundColor = '#f57c00';

    const hint = document.createElement('div');
    hint.id = 'openify-scroll-hint';
    hint.innerText = 'Please scroll down the playlist slowly to capture all tracks!';
    hint.style.cssText = `
        position: fixed;
        bottom: 70px;
        right: 20px;
        background: #333;
        color: #fff;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(hint);
    setTimeout(() => { if(document.getElementById('openify-scroll-hint')) hint.remove(); }, 5000);

    window.extractionInterval = setInterval(async () => {
        const foundNew = performExtractionStep();
        const newSize = extractedTracksMap.size;

        btn.innerText = `Extracting... (${newSize})`;

        if (!foundNew && newSize > 0) {
            idleCount++;
        } else {
            idleCount = 0;
        }

        // Auto-stop after ~15 seconds of no new tracks (assuming user reached bottom)
        if (idleCount >= 15) {
            finishExtraction(btn);
        }
    }, 1000);
};

const finishExtraction = async (btn) => {
    if (window.extractionInterval) {
        clearInterval(window.extractionInterval);
    }
    extractionInProgress = false;
    btn.innerText = 'Extract Playlist';
    btn.style.backgroundColor = '#1DB954';
    
    const hint = document.getElementById('openify-scroll-hint');
    if (hint) hint.remove();
    
    if (extractedTracksMap.size === 0) {
        alert("Couldn't find any tracks. Make sure you are on a playlist page!");
        return;
    }

    const finalData = {
        name: document.querySelector('h1')?.innerText || 'Playlist',
        tracks: Array.from(extractedTracksMap.values())
    };
    
    await chrome.storage.local.set({
        extractedData: JSON.stringify(finalData.tracks),
        lastExtractedName: finalData.name
    });
    
    alert(`Extraction complete! Saved ${finalData.tracks.length} tracks. Click the extension icon in the toolbar to export.`);
};

// Add a floating button to the UI
const addExtractButton = () => {
    if (!document.body) return;
    if (document.getElementById('openify-extract-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'openify-extract-btn';
    btn.innerText = 'Extract Playlist';
    btn.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
        background-color: #1DB954 !important;
        color: white !important;
        border: none !important;
        padding: 12px 20px !important;
        border-radius: 25px !important;
        font-weight: bold !important;
        font-size: 14px !important;
        cursor: pointer !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        transition: transform 0.2s !important;
        font-family: Circular, spotify-circular, Helvetica, Arial, sans-serif !important;
        display: block !important;
    `;

    btn.onmouseover = () => {
        if (!extractionInProgress) btn.style.transform = 'scale(1.05)';
    };
    btn.onmouseout = () => btn.style.transform = 'scale(1)';

    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        startManualExtraction(btn);
    };

    document.body.appendChild(btn);
    console.log('Openify Extract: Button added');
};

setInterval(addExtractButton, 1500);
