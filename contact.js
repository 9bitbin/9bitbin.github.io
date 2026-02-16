// ========================================
// CONTACT.JS - Contact Form & Guestbook
// ========================================

function sendContactMessage(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !message) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    // Show success message
    showAlert('Message sent successfully!', 'success');
    
    // Reset form
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactMessage').value = '';
}

function signGuestbook(event) {
    event.preventDefault();
    
    const name = document.getElementById('guestbookName').value.trim();
    const message = document.getElementById('guestbookMessage').value.trim();
    
    if (!name || !message) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (message.length > 200) {
        showAlert('Message is too long (max 200 characters)', 'error');
        return;
    }
    
    addGuestbookEntry(name, message);
    showAlert('Thanks for signing my guestbook!', 'success');
    
    // Reset form
    document.getElementById('guestbookName').value = '';
    document.getElementById('guestbookMessage').value = '';
    document.getElementById('charCount').textContent = '0';
    
    // Reload guestbook
    loadGuestbook();
    updateGuestbookCount();
}

function loadGuestbook() {
    const entries = getGuestbookEntries();
    const container = document.getElementById('guestbookContainer');
    if (!container) return;

    if (entries.length === 0) {
        container.innerHTML = '<p class="comic-font" style="text-align: center; color: var(--y2k-blue);">No signatures yet...</p>';
        return;
    }

    container.innerHTML = entries.map(entry => `
        <div class="guestbook-entry">
            <p class="entry-name">${escapeHtml(entry.name)}</p>
            <p class="entry-message" style="margin: 8px 0; font-style: italic;">"${escapeHtml(entry.message)}"</p>
            <p class="entry-date" style="color: var(--y2k-cyan); font-size: 0.85rem; margin-top: 5px;">${entry.date}</p>
        </div>
    `).join('');
}

function updateCharCount(event) {
    const textarea = event.target;
    const count = textarea.value.length;
    const charCounter = document.getElementById('charCount');
    if (charCounter) {
        charCounter.textContent = count;
    }
}

function updateGuestbookCount() {
    const entries = getGuestbookEntries();
    const countElement = document.getElementById('guestbookCount');
    if (countElement) {
        countElement.textContent = entries.length;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('guestbookContainer')) {
        loadGuestbook();
        updateGuestbookCount();
    }
});