// Listen for text selection events
document.addEventListener('mouseup', function() {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText.length > 0) {
    showPopup(selectedText);
  }
});

// Function to show a custom HTML popup
function showPopup(text) {
  // Remove any existing popup
  const existingPopup = document.getElementById('text-selector-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup element
  const popup = document.createElement('div');
  popup.id = 'text-selector-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-header">
        <h3>Selected Text</h3>
        <button class="close-btn" onclick="this.closest('#text-selector-popup').remove()">×</button>
      </div>
      <div class="popup-body">
        <p>${escapeHtml(text)}</p>
      </div>
    </div>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    #text-selector-popup {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      min-width: 300px;
      max-width: 600px;
      animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(400px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .popup-content {
      padding: 0;
    }
    
    .popup-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .popup-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .popup-body {
      padding: 20px;
      color: #333;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .popup-body p {
      margin: 0;
      line-height: 1.6;
      word-wrap: break-word;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(popup);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    popup.remove();
  }, 5000);
}

// Helper function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Alternative: Listen for mousedown to detect when dragging starts
document.addEventListener('mousedown', function() {
  // Clear any previous selection
  window.getSelection().removeAllRanges();
  
  // Remove any existing popup when starting new selection
  const existingPopup = document.getElementById('text-selector-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
});
