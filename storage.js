// ========================================
// STORAGE.JS - LocalStorage Management
// ========================================

const PASSWORDS = {
    diary: 'diary123',
    resume: 'resume123',
    admin: 'admin123'
};

// ========================================
// BLOG POST FUNCTIONS
// ========================================

function getBlogPosts() {
    const posts = localStorage.getItem('y2k_blog_posts');
    return posts ? JSON.parse(posts) : [];
}

function saveBlogPost(post) {
    const posts = getBlogPosts();
    if (post.id) {
        const index = posts.findIndex(p => p.id === post.id);
        if (index >= 0) posts[index] = post;
    } else {
        post.id = Date.now().toString();
        post.createdDate = new Date().toLocaleDateString();
    }
    localStorage.setItem('y2k_blog_posts', JSON.stringify(posts));
}

function deleteBlogPost(postId) {
    const posts = getBlogPosts().filter(p => p.id !== postId);
    localStorage.setItem('y2k_blog_posts', JSON.stringify(posts));
}

function getBlogPostById(postId) {
    return getBlogPosts().find(p => p.id === postId);
}

// ========================================
// DIARY ENTRY FUNCTIONS
// ========================================

function getDiaryEntries() {
    const entries = localStorage.getItem('y2k_diary_entries');
    return entries ? JSON.parse(entries) : [];
}

function saveDiaryEntry(entry) {
    const entries = getDiaryEntries();
    if (entry.id) {
        const index = entries.findIndex(e => e.id === entry.id);
        if (index >= 0) entries[index] = entry;
    } else {
        entry.id = Date.now().toString();
        entry.date = new Date().toLocaleDateString();
    }
    localStorage.setItem('y2k_diary_entries', JSON.stringify(entries));
}

function deleteDiaryEntry(entryId) {
    const entries = getDiaryEntries().filter(e => e.id !== entryId);
    localStorage.setItem('y2k_diary_entries', JSON.stringify(entries));
}

function getDiaryEntryById(entryId) {
    return getDiaryEntries().find(e => e.id === entryId);
}

// ========================================
// GUESTBOOK FUNCTIONS
// ========================================

function getGuestbookEntries() {
    const entries = localStorage.getItem('y2k_guestbook');
    return entries ? JSON.parse(entries) : [];
}

function addGuestbookEntry(name, message) {
    const entries = getGuestbookEntries();
    entries.unshift({
        id: Date.now().toString(),
        name: name,
        message: message,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('y2k_guestbook', JSON.stringify(entries));
}

function deleteGuestbookEntry(entryId) {
    const entries = getGuestbookEntries().filter(e => e.id !== entryId);
    localStorage.setItem('y2k_guestbook', JSON.stringify(entries));
}

// ========================================
// VISITOR COUNTER
// ========================================

function getVisitorCount() {
    const count = localStorage.getItem('y2k_visitor_count');
    return parseInt(count || '0');
}

function incrementVisitorCount() {
    const count = getVisitorCount() + 1;
    localStorage.setItem('y2k_visitor_count', count.toString());
    return count;
}

function formatVisitorCount(num) {
    return num.toString().padStart(6, '0');
}

// ========================================
// AUTHENTICATION
// ========================================

function checkPassword(type, password) {
    return password === PASSWORDS[type];
}

function setAuthenticated(type) {
    sessionStorage.setItem(`y2k_auth_${type}`, 'true');
}

function isAuthenticated(type) {
    return sessionStorage.getItem(`y2k_auth_${type}`) === 'true';
}

function clearAuthentication(type) {
    sessionStorage.removeItem(`y2k_auth_${type}`);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function calculateWordCount(text) {
    return text.trim().split(/\s+/).length;
}

function getTotalWordCount() {
    const entries = getDiaryEntries();
    return entries.reduce((total, entry) => total + calculateWordCount(entry.content || ''), 0);
}

function getDaysActive() {
    const entries = getDiaryEntries();
    return entries.length > 0 ? Math.floor((Date.now() - new Date(entries[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ========================================
// INITIALIZATION
// ========================================

function initializeSampleData() {
    if (!localStorage.getItem('y2k_blog_posts')) {
        const samplePosts = [
            {
                id: '1',
                title: 'Welcome to My Blog!',
                mood: 'excited',
                content: 'This is my first blog post! Welcome to my Y2K-inspired portfolio. I\'m excited to share my thoughts and projects with you.',
                createdDate: new Date().toLocaleDateString()
            },
            {
                id: '2',
                title: 'Web Development is Awesome',
                mood: 'creative',
                content: 'I love web development! Building websites is so much fun, especially when you can make them look retro and cool like this.',
                createdDate: new Date().toLocaleDateString()
            }
        ];
        localStorage.setItem('y2k_blog_posts', JSON.stringify(samplePosts));
    }

    if (!localStorage.getItem('y2k_diary_entries')) {
        const sampleEntries = [
            {
                id: '1',
                content: 'Today was a great day! I finished my portfolio website. Can\'t wait to show it to everyone.',
                date: new Date().toLocaleDateString()
            }
        ];
        localStorage.setItem('y2k_diary_entries', JSON.stringify(sampleEntries));
    }

    if (!localStorage.getItem('y2k_guestbook')) {
        const sampleGuestbook = [
            {
                id: '1',
                name: 'Cool Person',
                message: 'Love your website! The Y2K aesthetic is amazing!',
                date: new Date().toLocaleDateString()
            }
        ];
        localStorage.setItem('y2k_guestbook', JSON.stringify(sampleGuestbook));
    }

    if (!localStorage.getItem('y2k_visitor_count')) {
        localStorage.setItem('y2k_visitor_count', '0');
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
});

// Clear all data function (for debugging)
function clearAllData() {
    localStorage.clear();
    sessionStorage.clear();
    initializeSampleData();
    location.reload();
}