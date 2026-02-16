// ========================================
// BLOG.JS - Blog Functionality
// ========================================

function loadBlogPosts() {
    const posts = getBlogPosts();
    renderBlogPosts(posts);
    updateBlogStats();
}

function searchBlogPosts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const posts = getBlogPosts();
    
    const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery) || 
        post.content.toLowerCase().includes(searchQuery)
    );
    
    renderBlogPosts(filtered);
}

function renderBlogPosts(posts) {
    const container = document.getElementById('blogContainer');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<p class="comic-font" style="text-align: center; color: var(--y2k-blue);">No posts yet...</p>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="glass-panel blog-post">
            <h3 style="color: var(--y2k-lime);">${escapeHtml(post.title)}</h3>
            <p class="blog-post-meta" style="color: var(--y2k-blue); font-size: 0.9rem; margin: 5px 0;">
                ${post.createdDate} • Mood: ${post.mood}
            </p>
            <p class="blog-post-content" style="margin: 15px 0;">${escapeHtml(post.content)}</p>
        </div>
    `).join('');
}

function updateBlogStats() {
    const posts = getBlogPosts();
    const postCount = document.getElementById('blogPostCount');
    const viewCount = document.getElementById('blogViewCount');
    
    if (postCount) postCount.textContent = posts.length.toString().padStart(2, '0');
    if (viewCount) viewCount.textContent = (posts.length * 5).toString().padStart(2, '0');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('blogContainer')) {
        loadBlogPosts();
    }
});