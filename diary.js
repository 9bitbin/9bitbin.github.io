// ========================================
// DIARY.JS - Diary Functionality
// ========================================

function loadDiaryEntries() {
    const entries = getDiaryEntries();
    renderDiaryEntries(entries);
    updateDiaryStats();
}

function renderDiaryEntries(entries) {
    const container = document.getElementById('diaryContainer');
    if (!container) return;

    if (entries.length === 0) {
        container.innerHTML = '<p class="comic-font" style="text-align: center; color: var(--y2k-blue);">No diary entries yet...</p>';
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="glass-panel diary-entry">
            <p class="entry-date" style="color: var(--y2k-blue); font-size: 0.9rem;">📝 ${entry.date}</p>
            <p class="entry-content" style="margin: 10px 0; line-height: 1.6;">${escapeHtml(entry.content)}</p>
            <p class="entry-wordcount" style="color: var(--y2k-lime); font-size: 0.85rem; margin-top: 10px;">
                ${calculateWordCount(entry.content)} words
            </p>
        </div>
    `).join('');
}

function updateDiaryStats() {
    const entries = getDiaryEntries();
    const entryCount = document.getElementById('diaryEntryCount');
    const wordCount = document.getElementById('diaryWordCount');
    const daysActive = document.getElementById('diaryDaysActive');
    
    if (entryCount) entryCount.textContent = entries.length.toString().padStart(2, '0');
    if (wordCount) wordCount.textContent = getTotalWordCount().toString().padStart(4, '0');
    if (daysActive) daysActive.textContent = getDaysActive().toString().padStart(2, '0');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('diaryContainer')) {
        loadDiaryEntries();
    }
});