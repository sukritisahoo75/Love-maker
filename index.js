// Counter functions (now using IndexedDB)
function updateCounterDisplay() {
    getCounter().then(count => {
        document.getElementById('usageCount').textContent = `This has been used ${count} times`;
    });
}

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LoveLettersDB', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('letters')) {
                db.createObjectStore('letters', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('counter')) {
                db.createObjectStore('counter', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onerror = (event) => {
            reject("IndexedDB error: " + event.target.error);
        };
    });
}

// Get counter value
function getCounter() {
    return new Promise((resolve) => {
        initDB().then(db => {
            const tx = db.transaction('counter', 'readonly');
            const store = tx.objectStore('counter');
            const request = store.get('loveCounter');
            
            request.onsuccess = () => {
                resolve(request.result ? request.result.value : 0);
            };
            
            request.onerror = () => resolve(0);
        }).catch(() => resolve(0));
    });
}

// Update counter
function updateCounter() {
    return new Promise((resolve, reject) => {
        getCounter().then(currentCount => {
            initDB().then(db => {
                const tx = db.transaction('counter', 'readwrite');
                const store = tx.objectStore('counter');
                store.put({ id: 'loveCounter', value: currentCount + 1 });
                resolve();
            }).catch(reject);
        });
    });
}

// Enhanced image compression
function compressImage(file) {
    return new Promise((resolve, reject) => {
        console.log("Original file size:", (file.size / 1024 / 1024).toFixed(2), "MB");
        
        if (file.size > 4 * 1024 * 1024) {
            reject("Image is too large (max 4MB). Please choose a smaller file.");
            return;
        }

        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        const TARGET_MAX_SIZE_KB = 300; // More aggressive target
        const INITIAL_QUALITY = 0.6;

        const reader = new FileReader();
        
        reader.onerror = () => reject("Error reading the file");
        reader.onload = function(e) {
            const img = new Image();
            
            img.onerror = () => reject("Image load error");
            img.onload = function() {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Progressive compression
                const compressWithQuality = (quality) => {
                    return new Promise((resolve) => {
                        canvas.toBlob(blob => {
                            console.log("Compressed to:", (blob.size / 1024).toFixed(2), "KB at quality:", quality);
                            resolve(blob);
                        }, 'image/jpeg', quality);
                    });
                };

                const compressUntilSuitable = async (quality) => {
                    const blob = await compressWithQuality(quality);
                    
                    if (blob.size / 1024 <= TARGET_MAX_SIZE_KB || quality <= 0.3) {
                        return blob;
                    }
                    
                    return compressUntilSuitable(quality * 0.7);
                };

                compressUntilSuitable(INITIAL_QUALITY)
                    .then(finalBlob => {
                        if (!finalBlob || finalBlob.size / 1024 > TARGET_MAX_SIZE_KB * 1.5) {
                            reject("Image couldn't be compressed enough");
                            return;
                        }
                        
                        const compressedReader = new FileReader();
                        compressedReader.onload = () => resolve(compressedReader.result);
                        compressedReader.onerror = () => reject("Compressed reader error");
                        compressedReader.readAsDataURL(finalBlob);
                    })
                    .catch(reject);
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    });
}

// Save love letter to IndexedDB
function saveLoveLetter(id, data) {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const tx = db.transaction('letters', 'readwrite');
            const store = tx.objectStore('letters');
            store.put({ id: id, data: data });
            resolve();
        }).catch(reject);
    });
}

// Main function with complete error handling
async function createLoveLetter() {
    const loverName = document.getElementById('loverName').value.trim();
    const photoFile = document.getElementById('photoUpload').files[0];
    const createButton = document.getElementById('createButton');

    if (!loverName) {
        alert("Please enter your lover's name!");
        return;
    }
    
    if (!photoFile) {
        alert("Please upload a photo!");
        return;
    }

    createButton.disabled = true;
    createButton.textContent = 'Creating...';

    try {
        // Step 1: Compress image
        const compressedPhoto = await compressImage(photoFile);
        
        // Step 2: Prepare data
        const loveId = 'love-' + Date.now();
        const loveData = {
            loverName: loverName,
            photo: compressedPhoto
        };

        // Step 3: Save data
        await saveLoveLetter(loveId, loveData);
        await updateCounter();
        updateCounterDisplay();

        // Step 4: Redirect
        const pathParts = window.location.pathname.split('/');
        const repoName = pathParts.length > 1 ? pathParts[1] : '';
        const baseUrl = repoName ? `${window.location.origin}/${repoName}` : window.location.origin;
        window.location.href = `${baseUrl}/index2.html?id=${loveId}`;

    } catch (error) {
        console.error("Error:", error);
        alert(typeof error === 'string' ? error : "Error creating love letter. Please try with a smaller image.");
    } finally {
        createButton.disabled = false;
        createButton.textContent = 'Create Love Letter';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    try {
        updateCounterDisplay();
        document.getElementById('createButton').addEventListener('click', createLoveLetter);
    } catch (error) {
        console.error("Initialization error:", error);
        alert("Failed to initialize the page. Please refresh.");
    }
});