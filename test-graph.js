// Debug script for the Canvas-based graph renderer.
// Usage: node test-graph.js  (requires a local server running on port 8080)
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

  const debugInfo = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return {
      canvasPresent: !!canvas,
      canvasWidth: canvas?.width,
      canvasHeight: canvas?.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    };
  });

  console.log('Debug Info:', JSON.stringify(debugInfo, null, 2));
  await browser.close();
})();
