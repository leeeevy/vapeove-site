// Connect to user's Chrome via CDP and deploy to Netlify
const { chromium } = require('playwright-core');

(async () => {
  // Connect to running Chrome
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  
  // List existing tabs
  const contexts = browser.contexts();
  const pages = contexts[0]?.pages() || [];
  console.log(`Found ${pages.length} tabs:`);
  pages.forEach((p, i) => console.log(`  [${i}] ${p.url()}`));
  
  // Open Netlify in a new tab
  const page = await contexts[0].newPage();
  await page.goto('https://app.netlify.com/', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Check if logged in (look for dashboard or login button)
  const url = page.url();
  console.log('Current URL:', url);
  
  if (url.includes('login') || url.includes('signup')) {
    console.log('\n=== NOT LOGGED IN ===');
    console.log('Please log in to Netlify in the Chrome window that just opened.');
    console.log('You can sign up with GitHub or email.');
    console.log('\nAfter logging in, the script will continue automatically...');
    
    // Wait for login to complete (watch for URL change away from login)
    await page.waitForURL(url => !url.includes('login') && !url.includes('signup'), { timeout: 120000 });
    console.log('Login detected! Continuing...');
  }
  
  console.log('Logged in! Current URL:', page.url());
  
  // Go to the deploy drop page
  await page.goto('https://app.netlify.com/drop', { waitUntil: 'networkidle', timeout: 15000 });
  console.log('On deploy page:', page.url());
  
  // Take screenshot to see what's there
  await page.screenshot({ path: 'D:/新建文件夹 (4)/2026-07-23-18-35-52/vapeove-site/netlify_before.png', fullPage: false });
  console.log('Screenshot saved. Looking for upload/deploy button...');
  
  // Try clicking "Deploy manually" or similar link
  // Netlify drop page: there should be a drag-drop zone or a "browse" link
  const getPageContent = await page.content();
  
  // Look for file input or browse link
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    console.log('Found file input! Will upload the site folder.');
    // For folder upload, we need webkitdirectory attribute
    // Netlify drop page accepts both files and folders
    // Let's try to set the file input
    await fileInput.setInputFiles('D:/新建文件夹 (4)/2026-07-23-18-35-52/vapeove-site/index.html');
    console.log('Set input file. Waiting for upload...');
  } else {
    console.log('No file input found. Taking another screenshot...');
    await page.screenshot({ path: 'D:/新建文件夹 (4)/2026-07-23-18-35-52/vapeove-site/netlify_no_input.png', fullPage: false });
    
    // Try clicking on the drop zone text or button
    const possibleButtons = await page.$$('button, a, [role="button"]');
    console.log(`Found ${possibleButtons.length} clickable elements`);
    for (let i = 0; i < Math.min(possibleButtons.length, 10); i++) {
      const text = await possibleButtons[i].textContent();
      console.log(`  [${i}] "${text?.trim()}"`);
    }
  }
  
  console.log('\nDeployment script finished. Check the Chrome window.');
  
  // Don't close browser since it's the user's Chrome
  await page.close();
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
