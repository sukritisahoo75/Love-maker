// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LoveLettersDB', 1);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('letters')) {
                db.createObjectStore('letters', { keyPath: 'id' });
            }
        };
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onerror = (event) => {
            reject("Database error: " + event.target.error);
        };
    });
}

// Get love letter data from IndexedDB
function getLoveLetter(id) {
    return new Promise((resolve, reject) => {
        initDB().then(db => {
            const tx = db.transaction('letters', 'readonly');
            const store = tx.objectStore('letters');
            const request = store.get(id);
            
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.data);
                } else {
                    reject("Love letter not found");
                }
            };
            
            request.onerror = () => {
                reject("Error accessing database");
            };
        }).catch(reject);
    });
}

// Share functions
function copyLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

function closeModal() {
    document.getElementById('shareModal').style.display = 'none';
}

// Floating hearts animation
function createFloatingHeart(container) {
    const heart = document.createElement('div');
    heart.className = 'heart-emoji';
    heart.innerHTML = ['❤️', '💖', '💘', '💝', '💓', '💗'][Math.floor(Math.random() * 6)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = `${6 + Math.random() * 10}s`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(heart);
    return heart;
}

// Main initialization
document.addEventListener('DOMContentLoaded', async function() {
    // Load love letter data
    const urlParams = new URLSearchParams(window.location.search);
    const loveId = urlParams.get('id');
    
    if (!loveId) {
        redirectToMain();
        return;
    }
    
    try {
        const loveData = await getLoveLetter(loveId);
        
        // Display basic info
        document.getElementById('displayName').textContent = loveData.loverName;
        const imgElement = document.getElementById('loverPhoto');
        imgElement.src = loveData.photo;

        // Enhanced image handling
        imgElement.onload = function() {
            const naturalWidth = this.naturalWidth;
            const naturalHeight = this.naturalHeight;
            const aspectRatio = naturalWidth / naturalHeight;
            
            // Clear previous orientation classes
            this.classList.remove('landscape', 'portrait');
            
            // Add appropriate orientation class
            if (aspectRatio > 1.1) {
                // Landscape image (wider than tall)
                this.classList.add('landscape');
                this.style.maxHeight = '60vh';
                this.style.width = '100%';
            } else if (aspectRatio < 0.9) {
                // Portrait image (taller than wide)
                this.classList.add('portrait');
                this.style.height = '65vh';
                this.style.width = 'auto';
            } else {
                // Square image
                this.style.maxHeight = '65vh';
                this.style.maxWidth = '100%';
            }
            
            // Adjust container for very tall images
            if (naturalHeight > naturalWidth * 1.5) {
                this.parentElement.style.maxWidth = '400px';
            } else {
                this.parentElement.style.maxWidth = '600px';
            }
            
            // Fade-in effect
            this.style.opacity = '0';
            setTimeout(() => {
                this.style.transition = 'opacity 0.5s ease';
                this.style.opacity = '1';
            }, 50);
        };

        imgElement.onerror = function() {
            console.error("Failed to load image");
            this.parentElement.innerHTML = `
                <div class="image-error">
                    <p>❤️ Couldn't load the image ❤️</p>
                    <p>But the love remains!</p>
                </div>
            `;
        };
        
        // Initialize floating hearts
        const floatingHearts = document.getElementById('floatingHearts');
        for (let i = 0; i < 30; i++) {
            createFloatingHeart(floatingHearts);
        }
        
        // Surprise button functionality
        const surpriseBtn = document.getElementById('surpriseBtn');
        const dynamicMessage = document.getElementById('dynamicMessage');
        
        const messages = [
            "You're the most beautiful person I know 🌸",
            "I fall in love with you more every day 💫",
            "Your laugh is my favorite sound 🎶",
            "I love you more than words can express 💌",
            "Will you marry me someday? 💍",
            "You are my last 7 minutes ❤️"
        ];
        
        let messageIndex = 0;
        
        surpriseBtn.addEventListener('click', function() {
            // Show next message
            dynamicMessage.innerHTML = messages[messageIndex];
            messageIndex = (messageIndex + 1) % messages.length;
            
            // Create heart burst effect
            for (let i = 0; i < 20; i++) {
                const heart = createFloatingHeart(floatingHearts);
                heart.style.left = `${50 + (Math.random() - 0.5) * 30}%`;
                heart.style.bottom = '20%';
                heart.style.animationDuration = `${1 + Math.random() * 2}s`;
                
                setTimeout(() => heart.remove(), 2000);
            }
        });
        
        // Share button functionality
        document.getElementById('shareBtn').addEventListener('click', function() {
            const shareUrl = `${window.location.origin}${window.location.pathname}?id=${loveId}`;
            document.getElementById('shareLink').value = shareUrl;
            document.getElementById('shareModal').style.display = 'flex';
        });
        
    } catch (error) {
        console.error("Error loading love letter:", error);
        alert("Love letter data not found! It may have expired or been deleted.");
        redirectToMain();
    }
});

function redirectToMain() {
    const isGitHub = window.location.host.includes('github.io');
    window.location.href = isGitHub ? '/Love-maker/' : 'index.html';
}