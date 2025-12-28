/**
 * Debug Logging Utilities
 *
 * Provides a minimizable debug log panel that appears in the top-right corner.
 * Useful for tracking game events and debugging during development.
 */

/**
 * Update debug log panel style based on minimized state
 * @param {HTMLElement} container - The debug log container
 * @param {HTMLElement} debugDiv - The debug content div
 * @param {boolean} isMinimized - Whether the panel is minimized
 */
function updateDebugLogStyle(container, debugDiv, isMinimized) {
  if (isMinimized) {
    debugDiv.style.display = 'none';
    container.style.width = 'auto';
  } else {
    debugDiv.style.display = 'block';
    debugDiv.style.maxHeight = 'calc(100vh - 60px)';
    debugDiv.style.width = '600px';
    debugDiv.style.maxWidth = '90vw';
  }
}

/**
 * Create the debug log UI element
 * @returns {HTMLElement} The debug log div element
 */
export function createDebugLog() {
  const container = document.createElement('div');
  container.id = 'debug-log-container';
  container.className = 'minimized';

  const header = document.createElement('div');
  header.id = 'debug-log-header';
  header.innerHTML = 'Debug';
  header.style.cssText = `
    background: white;
    color: blue;
    font-family: monospace;
    font-size: 11px;
    padding: 4px 8px;
    cursor: pointer;
    border: 1px solid blue;
    border-radius: 3px 0 0 3px;
    user-select: none;
  `;

  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-log';
  debugDiv.style.cssText = `
    background: white;
    color: #333;
    font-family: monospace;
    font-size: 11px;
    padding: 10px;
    overflow-y: auto;
    border: 1px solid blue;
    border-top: none;
    border-radius: 0 0 0 3px;
  `;

  container.style.cssText = `
    position: fixed;
    top: 10px;
    right: 0;
    z-index: 9999;
    transition: all 0.3s ease;
  `;

  // Minimized state
  container.classList.add('minimized');
  updateDebugLogStyle(container, debugDiv, true);

  // Toggle on click
  header.addEventListener('click', () => {
    const isMinimized = container.classList.toggle('minimized');
    updateDebugLogStyle(container, debugDiv, isMinimized);
  });

  container.appendChild(header);
  container.appendChild(debugDiv);
  document.body.appendChild(container);
  return debugDiv;
}

/**
 * Log a debug message to the debug panel
 * @param {string} message - The message to log
 * @param {boolean} [isError=false] - Whether this is an error message (red color)
 */
export function logDebug(message, isError = false) {
  let debugDiv = document.getElementById('debug-log');
  if (!debugDiv) {
    debugDiv = createDebugLog();
  }
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  const color = isError ? 'red' : '#333';
  const line = document.createElement('div');
  line.style.color = color;
  line.textContent = `[${timestamp}] ${message}`;
  debugDiv.appendChild(line);
  debugDiv.scrollTop = debugDiv.scrollHeight;
}

// Make globally available for browser backwards compatibility
if (typeof window !== 'undefined') {
  window.createDebugLog = createDebugLog;
  window.logDebug = logDebug;
}
