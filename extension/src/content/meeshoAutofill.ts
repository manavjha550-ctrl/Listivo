/**
 * LISTIVO Chrome Extension - Meesho Content Script Autofill Engine
 */

console.log('[Listivo Extension] Meesho Listing Companion Content Script Loaded.');

// Check if current page is supported Meesho Seller Catalog Upload page
function isMeeshoCatalogPage(): boolean {
  return window.location.href.includes('supplier.meesho.com');
}

// Inject floating Listivo quick-fill button when on Meesho seller panel
function injectListivoCompanionOverlay() {
  if (!isMeeshoCatalogPage() || document.getElementById('listivo-companion-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'listivo-companion-widget';
  widget.style.position = 'fixed';
  widget.style.bottom = '20px';
  widget.style.right = '20px';
  widget.style.zIndex = '999999';
  widget.style.backgroundColor = '#059669';
  widget.style.color = '#ffffff';
  widget.style.padding = '12px 18px';
  widget.style.borderRadius = '14px';
  widget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  widget.style.fontFamily = 'sans-serif';
  widget.style.fontSize = '13px';
  widget.style.fontWeight = 'bold';
  widget.style.cursor = 'pointer';
  widget.style.display = 'flex';
  widget.style.alignItems = 'center';
  widget.style.gap = '8px';

  widget.innerHTML = `
    <span style="background:#047857; padding:4px 8px; border-radius:8px;">L</span>
    <span>Autofill with Listivo Template</span>
  `;

  widget.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'FETCH_TEMPLATES' }, (response) => {
      if (response && response.data && response.data.length > 0) {
        const tpl = response.data[0];
        alert(`LISTIVO Companion:\nReady to autofill template "${tpl.name}" for Category: ${tpl.category}`);
      } else {
        alert('LISTIVO Companion:\nPlease log into Listivo Web App at http://localhost:3000');
      }
    });
  });

  document.body.appendChild(widget);
}

// Initialize floating widget
setTimeout(injectListivoCompanionOverlay, 1500);
