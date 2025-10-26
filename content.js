// Listen for text selection events
document.addEventListener('mouseup', function() {
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText.length > 0) {
    // Show popup immediately with loading screen
    showPopup(selectedText);
  }
});

// Color palettes for different themes
const colorPalettes = [
  { primary: '#667eea', secondary: '#764ba2', name: 'purple' },
  { primary: '#f093fb', secondary: '#f5576c', name: 'pink' },
  { primary: '#4facfe', secondary: '#00f2fe', name: 'blue' },
  { primary: '#43e97b', secondary: '#38f9d7', name: 'green' },
  { primary: '#fa709a', secondary: '#fee140', name: 'coral' },
  { primary: '#30cfd0', secondary: '#330867', name: 'cyan' },
  { primary: '#a8edea', secondary: '#fed6e3', name: 'mint' },
  { primary: '#ff9a9e', secondary: '#fecfef', name: 'rose' },
  { primary: '#ffecd2', secondary: '#fcb69f', name: 'peach' },
  { primary: '#ff8a80', secondary: '#ea4c89', name: 'red' }
];

// Get or set a color for this tab
function getTabColor() {
  let tabColor = sessionStorage.getItem('tabColor');
  if (!tabColor) {
    // Pick a random color from the palettes
    const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    tabColor = randomPalette;
    sessionStorage.setItem('tabColor', JSON.stringify(tabColor));
  } else {
    tabColor = JSON.parse(tabColor);
  }
  return tabColor;
}

// Function to show a custom HTML popup
function showPopup(text) {
  // Remove any existing popup
  const existingPopup = document.getElementById('text-selector-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Get the color for this tab
  const colors = getTabColor();

  // Create popup element with loading state
  const popup = document.createElement('div');
  popup.id = 'text-selector-popup';
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-header">
      </div>
      <div class="popup-body" id="popup-body-content">
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Generating text...</p>
        </div>
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
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
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
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid ${colors.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-container p {
      color: #333;
      font-weight: 500;
      margin: 0;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(popup);

  // Sleep for a certain time, then show the text
  setTimeout(() => {
    const popupBody = document.getElementById('popup-body-content');
    if (popupBody) {
      popupBody.innerHTML = `<p>${escapeHtml(text)}</p>`;
    }
  }, 2000); // Sleep for 2 seconds (2000ms)

  // Auto-remove after 8 seconds (2 second loading + 6 second display)
  setTimeout(() => {
    popup.remove();
  }, 8000);
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
