// ========================================
// ADMIN.JS - Admin Panel Functions
// ========================================

// ========================================
// BLOG MANAGEMENT
// ========================================

function handleSaveBlogPost(event) {
    event.preventDefault();
    
    const id = document.getElementById('blogPostId').value;
    const title = document.getElementById('blogTitle').value.trim();
    const mood = document.getElementById('blogMood').value;
    const content = document.getElementById('blogContent').value.trim();
    
    if (!title || !content) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    const post = {
        id: id || Date.now().toString(),
        title: title,
        mood: mood,
        content: content,
        createdDate: new Date().toLocaleDateString()
    };
    
    saveBlogPost(post);
    showAlert(id ? 'Post updated!' : 'Post created!', 'success');
    
    // Reset form
    document.getElementById('blogPostId').value = '';
    document.getElementById('blogTitle').value = '';
    document.getElementById('blogContent').value = '';
    document.getElementById('blogMood').value = 'happy';
    
    // Reload list
    loadBlogList();
    updateBlogCount();
}

function loadBlogList() {
    const posts = getBlogPosts();
    renderBlogList(posts);
    updateBlogCount();
}

function renderBlogList(posts) {
    const container = document.getElementById('blogListContainer');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="comic-font" style="text-align: center; color: var(--y2k-blue);">No blog posts yet.</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="admin-item">
            <h5 style="color: var(--y2k-lime); margin-bottom: 8px;">${escapeHtml(post.title)}</h5>
            <p style="font-size: 0.9rem; color: var(--y2k-blue); margin: 5px 0;">${post.createdDate} • ${post.mood}</p>
            <p style="font-size: 0.9rem; margin: 8px 0; line-height: 1.4;">${escapeHtml(post.content.substring(0, 100))}...</p>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button class="chrome-button" onclick="editBlogPost('${post.id}')" style="padding: 5px 15px; font-size: 0.9rem;">✏️ Edit</button>
                <button class="chrome-button" onclick="deleteBlogPostConfirm('${post.id}')" style="padding: 5px 15px; font-size: 0.9rem;">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function editBlogPost(postId) {
    const post = getBlogPostById(postId);
    if (post) {
        document.getElementById('blogPostId').value = post.id;
        document.getElementById('blogTitle').value = post.title;
        document.getElementById('blogMood').value = post.mood;
        document.getElementById('blogContent').value = post.content;
        window.scrollTo(0, 0);
    }
}

function deleteBlogPostConfirm(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        deleteBlogPost(postId);
        showAlert('Post deleted!', 'success');
        loadBlogList();
        updateBlogCount();
    }
}

function updateBlogCount() {
    const posts = getBlogPosts();
    const countElement = document.getElementById('blogListCount');
    if (countElement) {
        countElement.textContent = posts.length;
    }
}

// ========================================
// DIARY MANAGEMENT
// ========================================

function handleSaveDiaryEntry(event) {
    event.preventDefault();
    
    const id = document.getElementById('diaryEntryId').value;
    const content = document.getElementById('diaryEntryContent').value.trim();
    
    if (!content) {
        showAlert('Please write something', 'error');
        return;
    }
    
    const entry = {
        id: id || Date.now().toString(),
        content: content,
        date: new Date().toLocaleDateString()
    };
    
    saveDiaryEntry(entry);
    showAlert(id ? 'Entry updated!' : 'Entry created!', 'success');
    
    // Reset form
    document.getElementById('diaryEntryId').value = '';
    document.getElementById('diaryEntryContent').value = '';
    
    // Reload list
    loadDiaryList();
    updateDiaryCount();
}

function loadDiaryList() {
    const entries = getDiaryEntries();
    renderDiaryList(entries);
    updateDiaryCount();
}

function renderDiaryList(entries) {
    const container = document.getElementById('diaryListContainer');
    if (!container) return;

    if (entries.length === 0) {
        container.innerHTML = '<p class="comic-font" style="text-align: center; color: var(--y2k-blue);">No diary entries yet.</p>';
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="admin-item">
            <p style="font-size: 0.9rem; color: var(--y2k-blue); margin-bottom: 8px;">📝 ${entry.date}</p>
            <p style="font-size: 0.9rem; margin: 8px 0; line-height: 1.4;">${escapeHtml(entry.content.substring(0, 100))}...</p>
            <p style="font-size: 0.85rem; color: var(--y2k-lime); margin-top: 5px;">${calculateWordCount(entry.content)} words</p>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button class="chrome-button" onclick="editDiaryEntry('${entry.id}')" style="padding: 5px 15px; font-size: 0.9rem;">✏️ Edit</button>
                <button class="chrome-button" onclick="deleteDiaryEntryConfirm('${entry.id}')" style="padding: 5px 15px; font-size: 0.9rem;">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

function editDiaryEntry(entryId) {
    const entry = getDiaryEntryById(entryId);
    if (entry) {
        document.getElementById('diaryEntryId').value = entry.id;
        document.getElementById('diaryEntryContent').value = entry.content;
        window.scrollTo(0, 0);
    }
}

function deleteDiaryEntryConfirm(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        deleteDiaryEntry(entryId);
        showAlert('Entry deleted!', 'success');
        loadDiaryList();
        updateDiaryCount();
    }
}

function updateDiaryCount() {
    const entries = getDiaryEntries();
    const countElement = document.getElementById('diaryListCount');
    if (countElement) {
        countElement.textContent = entries.length;
    }
}

// ========================================
// TAB SWITCHING
// ========================================

function switchAdminTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Mark button as active
    event.target.classList.add('active');
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('adminContent')) {
        // Admin page ready
    }
});