/**
 * Error Handling Utilities
 *
 * Displays user-friendly error overlays for critical errors.
 */

/**
 * Show a full-screen error overlay with error details
 * @param {string} title - Error title
 * @param {string} message - User-friendly error message
 * @param {Error} error - The error object with stack trace
 */
export function showErrorOverlay(title, message, error) {
  const overlay = document.createElement('div');
  overlay.id = 'error-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 800px;
    max-height: 90vh;
    overflow: auto;
    font-family: monospace;
  `;

  const heading = document.createElement('h1');
  heading.textContent = '🚨 ' + title;
  heading.style.cssText = 'color: #d32f2f; margin-top: 0;';

  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.cssText = 'font-size: 16px; line-height: 1.5;';

  const errorBox = document.createElement('pre');
  errorBox.style.cssText = `
    background: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 12px;
    border-left: 4px solid #d32f2f;
  `;
  errorBox.textContent = error ? (error.stack || error.toString()) : 'No error details available';

  const urlInfo = document.createElement('details');
  urlInfo.style.cssText = 'margin-top: 20px;';
  const urlSummary = document.createElement('summary');
  urlSummary.textContent = 'URL Parameters';
  urlSummary.style.cssText = 'cursor: pointer; font-weight: bold; margin-bottom: 10px;';
  const urlPre = document.createElement('pre');
  urlPre.style.cssText = 'background: #e3f2fd; padding: 10px; border-radius: 5px; font-size: 11px;';
  urlPre.textContent = window.location.search || '(no URL parameters)';
  urlInfo.appendChild(urlSummary);
  urlInfo.appendChild(urlPre);

  const reloadBtn = document.createElement('button');
  reloadBtn.textContent = 'Start Fresh Game (Clear URL)';
  reloadBtn.style.cssText = `
    margin-top: 20px;
    padding: 12px 24px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  `;
  reloadBtn.onclick = () => {
    window.location.href = window.location.pathname;
  };

  content.appendChild(heading);
  content.appendChild(msg);
  content.appendChild(errorBox);
  content.appendChild(urlInfo);
  content.appendChild(reloadBtn);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.showErrorOverlay = showErrorOverlay;
}
