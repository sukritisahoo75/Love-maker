document.querySelectorAll('.varyName').forEach(el => {
    el.textContent = localStorage.getItem('loverName') || 'My Love';
})

// Create floating hearts
const floatingHearts = document.getElementById('floatingHearts');
for (let i = 0; i < 30; i++) {
    const heart = document.createElement('div');
    heart.className = 'heart-emoji';
    heart.innerHTML = ['❤️', '💖', '💘', '💝', '💓', '💗'][Math.floor(Math.random() * 6)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = `${6 + Math.random() * 10}s`;
    heart.style.animationDelay = `${Math.random() * 5}s`;
    floatingHearts.appendChild(heart);
}

// Button surprise
const surpriseBtn = document.getElementById('surpriseBtn');
const dynamicMessage = document.getElementById('dynamicMessage');

const messages = [
    "You're the most beautiful person I know 🌸",
    "I fall in love with you more every day 💫",
    "Your laugh is my favorite sound 🎶",
    "I love you more than words can express 💌",
    "Will you marry me someday? 💍"
];

let messageIndex = 0;

surpriseBtn.addEventListener('click', () => {
    dynamicMessage.innerHTML = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length;
    
    // Create burst of hearts
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-emoji';
        heart.innerHTML = '❤️';
        heart.style.left = `${50 + (Math.random() - 0.5) * 30}%`;
        heart.style.bottom = '20%';
        heart.style.animationDuration = `${1 + Math.random() * 2}s`;
        heart.style.animationDelay = '0s';
        floatingHearts.appendChild(heart);
        
        // Remove after animation
        setTimeout(() => {
            heart.remove();
        }, 2000);
    }
});