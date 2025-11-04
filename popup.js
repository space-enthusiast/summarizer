// Storage helpers for persistent download state
async function saveDownloadState(state, progress = 0) {
  await chrome.storage.local.set({
    downloadState: state,
    downloadProgress: progress,
    downloadTimestamp: Date.now()
  });
}

async function getDownloadState() {
  const result = await chrome.storage.local.get(['downloadState', 'downloadProgress', 'downloadTimestamp']);
  // Clear state if it's older than 1 hour (stale state)
  if (result.downloadTimestamp && Date.now() - result.downloadTimestamp > 3600000) {
    await clearDownloadState();
    return null;
  }
  return result.downloadState ? result : null;
}

async function clearDownloadState() {
  await chrome.storage.local.remove(['downloadState', 'downloadProgress', 'downloadTimestamp']);
}

// Check Chrome AI summarizer availability
async function checkAIStatus() {
  const statusElement = document.getElementById('ai-status');
  const downloadButton = document.getElementById('download-button');
  const downloadProgress = document.getElementById('download-progress');

  try {
    // Check for persisted download state
    const persistedState = await getDownloadState();

    // Try Summarizer API first (reference pattern)
    let state = null;
    let isAvailable = false;

    if ('Summarizer' in self) {
      state = await Summarizer.availability();
      // States: 'unavailable' | 'downloadable' | 'downloading' | 'available'
      isAvailable = state === 'available';
    } else if ('ai' in self && 'summarizer' in self.ai) {
      // Fallback to ai.summarizer API
      const availability = await self.ai.summarizer.capabilities();
      if (availability.available === 'readily') {
        state = 'available';
        isAvailable = true;
      } else if (availability.available === 'after-download') {
        state = 'downloadable';
        isAvailable = false;
      } else {
        state = 'unavailable';
        isAvailable = false;
      }
    } else {
      statusElement.className = 'status-value status-unavailable';
      statusElement.textContent = '✗ Not Supported';
      downloadButton.style.display = 'none';
      downloadProgress.classList.remove('show');
      return;
    }

    // If download completed, clear persisted state
    if (state === 'available' && persistedState) {
      await clearDownloadState();
    }

    // Use persisted state if download is ongoing
    if (persistedState && persistedState.downloadState === 'downloading' && state !== 'available') {
      state = 'downloading';
      // Restore progress if available
      const progress = persistedState.downloadProgress || 0;
      statusElement.className = 'status-value status-download';
      statusElement.textContent = progress > 0 ? `⬇ Downloading: ${progress}%` : '⬇ Downloading...';
      downloadButton.style.display = 'none';
      downloadProgress.classList.add('show');
      downloadProgress.textContent = progress > 0 ? `Downloading: ${progress}%` : 'Downloading model...';
      return;
    }

    // Update status display
    if (state === 'available') {
      statusElement.className = 'status-value status-available';
      statusElement.textContent = '✓ Available';
      downloadButton.style.display = 'none';
      downloadProgress.classList.remove('show');
    } else if (state === 'downloadable') {
      statusElement.className = 'status-value status-download';
      statusElement.textContent = '⬇ Needs Download';
      downloadButton.style.display = 'block';
      downloadButton.disabled = false;
      downloadProgress.classList.remove('show');
    } else if (state === 'downloading') {
      statusElement.className = 'status-value status-download';
      statusElement.textContent = '⬇ Downloading...';
      downloadButton.style.display = 'none';
      downloadProgress.classList.add('show');
      downloadProgress.textContent = 'Downloading model...';
    } else {
      statusElement.className = 'status-value status-unavailable';
      statusElement.textContent = '✗ Not Available';
      downloadButton.style.display = 'none';
      downloadProgress.classList.remove('show');
    }
  } catch (error) {
    console.error('Error checking AI status:', error);
    statusElement.className = 'status-value status-unavailable';
    statusElement.textContent = '✗ Error';
    downloadButton.style.display = 'none';
    downloadProgress.classList.remove('show');
  }
}

// Download model function
async function downloadModel() {
  const statusElement = document.getElementById('ai-status');
  const downloadButton = document.getElementById('download-button');
  const downloadProgress = document.getElementById('download-progress');

  try {
    if (!('Summarizer' in self)) {
      // Try fallback API
      if (!('ai' in self && 'summarizer' in self.ai)) {
        throw new Error('Summarizer API not supported');
      }
      // For ai.summarizer API, creating a session will trigger download
      await saveDownloadState('downloading', 0);
      statusElement.className = 'status-value status-download';
      statusElement.textContent = '⬇ Downloading...';
      downloadButton.disabled = true;
      downloadProgress.classList.add('show');
      downloadProgress.textContent = 'Downloading model...';

      // Create session which will download the model
      await self.ai.summarizer.create();

      // Clear download state and recheck availability
      await clearDownloadState();
      await checkAIStatus();
      return;
    }

    // Check for user activation
    if (!navigator.userActivation || !navigator.userActivation.isActive) {
      statusElement.textContent = 'Click again to download';
      statusElement.style.color = '#856404';
      return;
    }

    // Save initial download state
    await saveDownloadState('downloading', 0);
    statusElement.className = 'status-value status-download';
    statusElement.textContent = '⬇ Downloading...';
    downloadButton.disabled = true;
    downloadProgress.classList.add('show');
    downloadProgress.textContent = 'Downloading: 0%';

    // Create summarizer with monitor to track download progress
    const summarizer = await Summarizer.create({
      type: 'key-points',
      format: 'plain-text',
      length: 'medium',
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const percent = Math.round(e.loaded * 100);
          downloadProgress.textContent = `Downloading: ${percent}%`;
          statusElement.textContent = `⬇ Downloading: ${percent}%`;
          // Persist progress
          saveDownloadState('downloading', percent);
        });
      }
    });

    // After download completes, clear persisted state and check availability
    await clearDownloadState();
    const newState = await Summarizer.availability();
    downloadProgress.classList.remove('show');
    downloadButton.disabled = false;

    if (newState === 'available') {
      statusElement.className = 'status-value status-available';
      statusElement.textContent = '✓ Available';
      downloadButton.style.display = 'none';
    } else {
      statusElement.className = 'status-value status-download';
      statusElement.textContent = 'Status: ' + newState;
      downloadButton.style.display = newState === 'downloadable' ? 'block' : 'none';
    }
  } catch (error) {
    console.error('Error downloading model:', error);
    await clearDownloadState();
    statusElement.className = 'status-value status-unavailable';
    statusElement.textContent = '✗ Download Failed';
    downloadButton.disabled = false;
    downloadProgress.classList.remove('show');
    downloadButton.style.display = 'block';
  }
}

// Initialize when DOM is ready
function initializePopup() {
  const downloadButton = document.getElementById('download-button');
  if (downloadButton) {
    downloadButton.addEventListener('click', downloadModel);
  }
  
  // Run check when popup opens
  checkAIStatus();
  
  // Periodically check if download is in progress
  setInterval(checkAIStatus, 2000);
}

// Attach event listener when DOM is ready (works even if DOMContentLoaded already fired)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePopup);
} else {
  // DOM is already ready
  initializePopup();
}
