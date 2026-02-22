// ========================================
// APP.JS - Core Functions
// ========================================

// ========================================
// STAR FIELD INITIALIZATION
// ========================================

function initStarField() {
    const starField = document.getElementById('starField');
    if (!starField) return;

    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        starField.appendChild(star);
    }
}

// ========================================
// SPLASH SCREEN
// ========================================

function closeSplash() {
    const splash = document.getElementById('splashScreen');
    if (splash) {
        splash.style.display = 'none';
    }
    incrementVisitorCount();
    updateVisitorCount();
}

// ========================================
// NAVIGATION
// ========================================

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('active');
    }
}

// ========================================
// MUSIC PLAYER
// ========================================

function toggleMusic() {
    const audio = document.getElementById('bgMusic');
    if (audio) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }
}

// ========================================
// PAGE UPDATES
// ========================================

function updateVisitorCount() {
    const count = getVisitorCount();
    const elements = document.querySelectorAll('#visitorCount');
    elements.forEach(el => {
        el.textContent = formatVisitorCount(count);
    });
}

function updateLastUpdated() {
    const elements = document.querySelectorAll('#lastUpdated');
    const today = new Date().toLocaleDateString();
    elements.forEach(el => {
        el.textContent = today;
    });
}

function loadLatestBlogPost() {
    const posts = getBlogPosts();
    const container = document.getElementById('latestBlogContainer');
    if (!container || posts.length === 0) return;

    const latest = posts[posts.length - 1];
    container.innerHTML = `
        <h3>${escapeHtml(latest.title)}</h3>
        <p class="blog-post-date" style="color: var(--y2k-blue); font-size: 0.9rem; margin: 5px 0;">
            ${latest.createdDate} • Mood: ${latest.mood}
        </p>
        <p class="blog-post-content">${escapeHtml(latest.content)}</p>
        <a href="blog.html" class="chrome-button" style="display: inline-block; margin-top: 10px;">Read More →</a>
    `;
}

// ========================================
// DIARY AUTHENTICATION
// ========================================

function checkDiaryAuth() {
    const container = document.getElementById('diaryAuthContainer');
    const content = document.getElementById('diaryContent');
    
    if (!container || !content) return;

    if (!isAuthenticated('diary')) {
        container.innerHTML = `
            <div class="container" style="text-align: center; margin-top: 100px;">
                <div class="glass-panel" style="max-width: 400px; margin: 0 auto;">
                    <h2 class="neon-text">DIARY LOCKED</h2>
                    <p class="comic-font" style="margin: 20px 0;">This diary is password protected.</p>
                    <input type="password" id="diaryPassword" placeholder="Enter password" style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid var(--y2k-pink);">
                    <button class="chrome-button" onclick="unlockDiary(event)" style="width: 100%;">Unlock</button>
                </div>
            </div>
        `;
        content.style.display = 'none';
    } else {
        container.innerHTML = '';
        content.style.display = 'block';
        loadDiaryEntries();
    }
}

function unlockDiary(event) {
    event.preventDefault();
    const password = document.getElementById('diaryPassword').value;
    
    if (checkPassword('diary', password)) {
        setAuthenticated('diary');
        checkDiaryAuth();
        showAlert('Diary unlocked!', 'success');
    } else {
        showAlert('Wrong password!', 'error');
    }
}

function lockDiary() {
    clearAuthentication('diary');
    checkDiaryAuth();
    showAlert('Diary locked!', 'info');
}

// ========================================
// RESUME AUTHENTICATION
// ========================================

function checkResumeAuth() {
    const container = document.getElementById('resumeAuthContainer');
    const content = document.getElementById('resumeContent');
    
    if (!container || !content) return;

    if (!isAuthenticated('resume')) {
        container.innerHTML = `
            <div class="container" style="text-align: center; margin-top: 100px;">
                <div class="glass-panel" style="max-width: 400px; margin: 0 auto;">
                    <h2 class="neon-text">RESUME PROTECTED</h2>
                    <p class="comic-font" style="margin: 20px 0;">This resume is password protected.</p>
                    <input type="password" id="resumePassword" placeholder="Enter password" style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid var(--y2k-pink);">
                    <button class="chrome-button" onclick="unlockResume(event)" style="width: 100%;">Unlock</button>
                </div>
            </div>
        `;
        content.style.display = 'none';
    } else {
        container.innerHTML = '';
        content.style.display = 'block';
    }
}

function unlockResume(event) {
    event.preventDefault();
    const password = document.getElementById('resumePassword').value;
    
    if (checkPassword('resume', password)) {
        setAuthenticated('resume');
        checkResumeAuth();
        showAlert('Resume unlocked!', 'success');
    } else {
        showAlert('Wrong password!', 'error');
    }
}

function lockResume() {
    clearAuthentication('resume');
    checkResumeAuth();
    showAlert('Resume locked!', 'info');
}

// ========================================
// ADMIN AUTHENTICATION
// ========================================

function checkAdminAuth() {
    const container = document.getElementById('adminAuthContainer');
    const content = document.getElementById('adminContent');
    
    if (!container || !content) return;

    if (!isAuthenticated('admin')) {
        container.innerHTML = `
            <div class="container" style="text-align: center; margin-top: 100px;">
                <div class="glass-panel" style="max-width: 400px; margin: 0 auto;">
                    <h2 class="neon-text">ADMIN LOGIN</h2>
                    <p class="comic-font" style="margin: 20px 0;">Admin access required.</p>
                    <input type="password" id="adminPassword" placeholder="Enter admin password" style="width: 100%; padding: 10px; margin: 10px 0; border: 2px solid var(--y2k-pink);">
                    <button class="chrome-button" onclick="loginAdmin(event)" style="width: 100%;">Login</button>
                </div>
            </div>
        `;
        content.style.display = 'none';
    } else {
        container.innerHTML = '';
        content.style.display = 'block';
        loadBlogList();
        loadDiaryList();
    }
}

function loginAdmin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (checkPassword('admin', password)) {
        setAuthenticated('admin');
        checkAdminAuth();
        showAlert('Admin logged in!', 'success');
    } else {
        showAlert('Wrong admin password!', 'error');
    }
}

function logoutAdmin() {
    clearAuthentication('admin');
    checkAdminAuth();
    showAlert('Logged out!', 'info');
}

// ========================================
// NOTIFICATIONS
// ========================================

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 10000;
        animation: fadeIn 0.3s ease-in;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// ========================================
// UTILITY
// ========================================

function escapeHtml(unsafe) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return unsafe.replace(/[&<>"']/g, m => map[m]);
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initStarField();
    updateVisitorCount();
    updateLastUpdated();

    const splash = document.getElementById('splashScreen');
    if (splash) {
        incrementVisitorCount();
        updateVisitorCount();
    }
    
    // Check for authentication needs
    if (document.getElementById('diaryAuthContainer')) {
        checkDiaryAuth();
    }
    if (document.getElementById('resumeAuthContainer')) {
        checkResumeAuth();
    }
    if (document.getElementById('adminAuthContainer')) {
        checkAdminAuth();
    }
    
    // Load latest blog post on home page
    if (document.getElementById('latestBlogContainer')) {
        loadLatestBlogPost();
    }
});