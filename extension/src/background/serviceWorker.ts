/**
 * LISTIVO Chrome Extension - Manifest V3 Background Service Worker
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Listivo Extension] Service Worker Installed.');
  chrome.storage.local.set({
    extensionConnected: true,
    serverUrl: 'http://localhost:3000',
    selectedMarketplace: 'meesho',
  });
});

// Listener for content script and popup messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'PING_APP') {
    fetch('http://localhost:3000/api/extension/status')
      .then((res) => res.json())
      .then((data) => sendResponse({ status: 'connected', data }))
      .catch((err) => sendResponse({ status: 'disconnected', error: err.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'FETCH_TEMPLATES') {
    fetch('http://localhost:3000/api/templates')
      .then((res) => res.json())
      .then((data) => sendResponse(data))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
