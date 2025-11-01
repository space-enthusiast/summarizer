// Check if Chrome AI is available
let aiAvailable = false;
let aiSession = null;

// Initialize AI on page load
(async function initAI() {
  try {
    if ('Summarizer' in self) {
      const state = await Summarizer.availability();
      const isAvailableNow = state === 'available';
      const isPendingDownload = state === 'downloadable' || state === 'downloading';
      
      if (isAvailableNow || isPendingDownload) {
        aiAvailable = true;
        console.log('Chrome AI is available! State:', state);
      } else {
        console.log('Chrome AI is not available on this device. State:', state);
      }
    } else if ('ai' in self && 'summarizer' in self.ai) {
      // Fallback to older ai.summarizer API
      const availability = await self.ai.summarizer.capabilities();
      if (availability.available === 'readily') {
        aiAvailable = true;
        console.log('Chrome AI is available! (legacy API)');
      } else if (availability.available === 'after-download') {
        aiAvailable = true;
        console.log('Chrome AI is available but needs to download the model first (legacy API)');
      } else {
        console.log('Chrome AI is not available on this device (legacy API)');
      }
    } else {
      console.log('Chrome AI API is not supported in this browser');
    }
  } catch (error) {
    console.log('Error checking AI availability:', error);
  }
})();

// Listen for text selection events
document.addEventListener('mouseup', async function() {
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

// Analyze the page colors and match to the closest palette
function analyzePageColors() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Create a temporary canvas to capture page colors
  // Note: We can't directly capture the page due to CORS, so we'll sample elements
  const sampleSize = 50;
  const colorCount = {};
  
  // Sample colors from visible elements
  const allElements = document.querySelectorAll('*');
  const visibleElements = Array.from(allElements).filter(el => {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           el.offsetWidth > 0 && 
           el.offsetHeight > 0;
  });
  
  visibleElements.slice(0, 100).forEach(el => {
    const bgColor = window.getComputedStyle(el).backgroundColor;
    const textColor = window.getComputedStyle(el).color;
    
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      const key = bgColor;
      colorCount[key] = (colorCount[key] || 0) + 1;
    }
    if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
      const key = textColor;
      colorCount[key] = (colorCount[key] || 0) + 1;
    }
  });
  
  // Find the most common colors
  const sortedColors = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color]) => color);
  
  // Convert to RGB and find the dominant hue
  let dominantHue = 0;
  if (sortedColors.length > 0) {
    const rgb = parseRGB(sortedColors[0]);
    dominantHue = rgbToHue(rgb);
  }
  
  return findMatchingPalette(dominantHue);
}

// Parse RGB from CSS color string
function parseRGB(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3])
    };
  }
  // Handle hex colors
  const hexMatch = colorStr.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    };
  }
  return { r: 0, g: 0, b: 0 };
}

// Convert RGB to HSL hue (0-360)
function rgbToHue(rgb) {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  
  return hue;
}

// Find the palette that best matches the dominant hue
function findMatchingPalette(hue) {
  const paletteHues = {
    'purple': 270,
    'pink': 340,
    'blue': 210,
    'green': 120,
    'coral': 10,
    'cyan': 180,
    'mint': 160,
    'rose': 350,
    'peach': 30,
    'red': 0
  };
  
  let closestPalette = colorPalettes[0];
  let minDiff = 360;
  
  colorPalettes.forEach(palette => {
    const paletteHue = paletteHues[palette.name];
    const diff = Math.min(
      Math.abs(hue - paletteHue),
      360 - Math.abs(hue - paletteHue)
    );
    if (diff < minDiff) {
      minDiff = diff;
      closestPalette = palette;
    }
  });
  
  return closestPalette;
}

// Get or set a color for this tab
function getTabColor() {
  let tabColor = sessionStorage.getItem('tabColor');
  if (!tabColor) {
    // Analyze page colors and match to closest palette
    try {
      tabColor = analyzePageColors();
    } catch (error) {
      console.log('Error analyzing colors, using random palette:', error);
      // Fallback to random if analysis fails
      tabColor = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    }
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

  // Use AI to summarize the text if available
  (async () => {
    const popupBody = document.getElementById('popup-body-content');
    if (!popupBody) return;

    if (!aiAvailable) {
      // AI is not available
      popupBody.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p style="color: #e74c3c; font-weight: 600; margin-bottom: 10px;">⚠️ Chrome AI Not Available</p>
          <p style="color: #666; font-size: 14px;">Chrome's built-in AI is not supported in this browser or device.</p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">Please use Chrome 127+ with AI features enabled.</p>
        </div>
      `;
      return;
    }

    try {
      // Create summarizer session if not exists
      if (!aiSession) {
        if ('Summarizer' in self) {
          aiSession = await Summarizer.create({
            type: 'key-points',
            format: 'plain-text',
            length: 'medium'
          });
        } else if ('ai' in self && 'summarizer' in self.ai) {
          // Fallback to legacy API
          aiSession = await self.ai.summarizer.create();
        } else {
          throw new Error('No summarizer API available');
        }
      }

      // Generate summary
      const summary = await aiSession.summarize(text);

      popupBody.innerHTML = `
        <div style="margin-bottom: 12px;">
          <p style="font-weight: 600; color: ${colors.primary}; margin-bottom: 8px;">Summary:</p>
          <p style="line-height: 1.6;">${escapeHtml(summary)}</p>
        </div>
      `;
    } catch (error) {
      console.error('Error generating summary:', error);
      popupBody.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p style="color: #e74c3c; font-weight: 600; margin-bottom: 10px;">❌ Error</p>
          <p style="color: #666; font-size: 14px;">Failed to generate summary: ${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  })();

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
