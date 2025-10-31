# Drag to Summarize

A minimal Chrome extension that summarizes selected text using Chrome's built-in AI (Summarizer API).

## Features

- Select any text on a webpage to get an instant AI-generated summary
- Adaptive color themes that match the current webpage
- Loading state with visual feedback
- Auto-dismissing popup after 8 seconds
- Status indicator for Chrome AI availability

## Requirements

- Chrome 127+ with built-in AI features enabled
- Chrome AI Summarizer API support

## Installation

1. Clone this repository or download the files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the directory containing this extension

## Usage

1. Navigate to any webpage
2. Select text by clicking and dragging
3. A popup will appear showing the AI-generated summary
4. The popup will automatically disappear after 8 seconds

## Testing Instructions

### Manual Testing

#### 1. Installation Test
- [ ] Load the extension in Chrome
- [ ] Verify the extension appears in `chrome://extensions/`
- [ ] Check that no errors appear in the console

#### 2. AI Availability Test
- [ ] Click the extension icon to open the popup
- [ ] Verify the AI status shows one of:
  - ✓ Available (green)
  - ⬇ Needs Download (yellow)
  - ✗ Not Available (red)
  - ✗ Not Supported (red)

#### 3. Text Selection Test
- [ ] Navigate to any webpage with text content
- [ ] Select a short paragraph (50-100 words)
- [ ] Verify a popup appears in the top-right corner
- [ ] Check that the popup shows a loading spinner initially
- [ ] Confirm the summary appears after generation

#### 4. Color Palette Test
- [ ] Test on websites with different color schemes:
  - [ ] Dark theme website (e.g., GitHub dark mode)
  - [ ] Light theme website (e.g., Wikipedia)
  - [ ] Colorful website (e.g., product landing pages)
- [ ] Verify the popup gradient matches the page color scheme
- [ ] Check that colors remain consistent for the same tab

#### 5. Edge Cases
- [ ] Select very short text (< 10 words) - should still show popup
- [ ] Select very long text (> 1000 words) - should handle gracefully
- [ ] Select text containing special characters and HTML entities
- [ ] Rapidly select different text snippets - verify popups don't stack
- [ ] Start a new selection while popup is visible - verify old popup is removed

#### 6. Error Handling
- [ ] Test on a browser without AI support
- [ ] Verify error message displays appropriately
- [ ] Check that error messages are user-friendly

#### 7. Auto-Dismiss Test
- [ ] Select text and wait 8 seconds
- [ ] Verify popup automatically disappears
- [ ] Confirm no console errors after auto-dismiss

#### 8. Multiple Tab Test
- [ ] Open multiple tabs with different websites
- [ ] Select text in each tab
- [ ] Verify each tab has its own color palette
- [ ] Check that colors persist when switching between tabs

#### 9. Performance Test
- [ ] Test on pages with many elements (>1000 DOM nodes)
- [ ] Verify color analysis doesn't freeze the page
- [ ] Check console for any performance warnings

### Developer Testing

#### Console Testing
```javascript
// In the browser console on any page:

// 1. Check AI availability
if ('ai' in self && 'summarizer' in self.ai) {
  const availability = await self.ai.summarizer.capabilities();
  console.log('AI availability:', availability);
}

// 2. Test summarizer directly
const session = await self.ai.summarizer.create();
const summary = await session.summarize('Your long text here...');
console.log('Summary:', summary);

// 3. Check session storage for color palette
console.log('Tab color:', sessionStorage.getItem('tabColor'));
```

#### Extension Console Testing
1. Open `chrome://extensions/`
2. Find "Drag to summarize" extension
3. Click "Inspect views: background page" or "service worker"
4. Check for any initialization errors

### Automated Testing Checklist

While this extension doesn't include automated tests, you could add:

- [ ] Unit tests for color parsing functions (parseRGB, rgbToHue)
- [ ] Unit tests for palette matching logic (findMatchingPalette)
- [ ] Integration tests for AI summarization flow
- [ ] E2E tests using Puppeteer or Playwright

## Known Limitations

- Requires Chrome 127+ with AI features enabled
- AI summarizer may not be available in all regions
- Color analysis may fail on some pages with CORS restrictions
- Auto-dismiss timer is fixed at 8 seconds

## File Structure

```
.
├── manifest.json       # Extension configuration
├── content.js          # Main content script (AI logic, UI)
├── popup.html          # Extension popup UI
├── popup.js            # Popup AI status checker
├── resources/          # Extension icons and assets
└── README.md           # This file
```

## Troubleshooting

**AI shows "Not Available"**
- Ensure you're using Chrome 127 or later
- Check if AI features are enabled in chrome://flags
- Verify your region supports Chrome's AI features

**Popup doesn't appear**
- Check the browser console for errors
- Verify the extension is enabled
- Make sure you're selecting text, not just clicking

**Colors look wrong**
- Clear the session storage and reload the page
- Check browser console for color analysis errors

## Contributing

Feel free to submit issues or pull requests to improve this extension.

## License

MIT
