// Initialize IndexedDB (same as in index.js)
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
        alert("Invalid love letter link!");
        window.location.href = "index.html";
        return;
    }
    
    try {
        const loveData = await getLoveLetter(loveId);
        
        // Display basic info
        document.getElementById('displayName').textContent = loveData.loverName;
        document.getElementById('loverPhoto').src = loveData.photo;
        
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
        window.location.href = "index.html";
    }
});