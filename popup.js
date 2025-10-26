// Check Chrome AI summarizer availability
async function checkAIStatus() {
  const statusElement = document.getElementById('ai-status');

  try {
    if ('ai' in self && 'summarizer' in self.ai) {
      const availability = await self.ai.summarizer.capabilities();

      if (availability.available === 'readily') {
        statusElement.className = 'status-value status-available';
        statusElement.textContent = '✓ Available';
      } else if (availability.available === 'after-download') {
        statusElement.className = 'status-value status-download';
        statusElement.textContent = '⬇ Needs Download';
      } else {
        statusElement.className = 'status-value status-unavailable';
        statusElement.textContent = '✗ Not Available';
      }
    } else {
      statusElement.className = 'status-value status-unavailable';
      statusElement.textContent = '✗ Not Supported';
    }
  } catch (error) {
    console.error('Error checking AI status:', error);
    statusElement.className = 'status-value status-unavailable';
    statusElement.textContent = '✗ Error';
  }
}

// Run check when popup opens
checkAIStatus();
