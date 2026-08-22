// Redeploy vapeove-site to Netlify via CDP
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const SITE_DIR = 'D:/新建文件夹 (4)/2026-07-23-18-35-52/vapeove-site';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const contexts = browser.contexts();
  const ctx = contexts[0];
  
  console.log('Opening Netlify...');
  const page = await ctx.newPage();
  
  // Go to the sites list to find existing site
  await page.goto('https://app.netlify.com/teams/connor/sites', { waitUntil: 'networkidle', timeout: 30000 });
  console.log('URL:', page.url());
  
  // Check if we need to login
  if (page.url().includes('login') || page.url().includes('signup')) {
    console.log('Login required. Waiting for you to log in...');
    console.log('Please log in to Netlify in the Chrome window.');
    await page.waitForURL(url => !url.includes('login') && !url.includes('signup'), { timeout: 180000 });
    console.log('Logged in!');
  }
  
  // Now navigate to the deploy drop page
  await page.goto('https://app.netlify.com/drop', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Take screenshot for debugging
  await page.screenshot({ path: path.join(SITE_DIR, 'deploy_step1.png') });
  
  // Find the file input (Netlify drop page has a hidden file input)
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    console.log('Found file input. Uploading folder...');
    
    // Get all files to upload
    const files = [];
    function collectFiles(dir, baseDir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
        if (entry.isDirectory()) {
          // Skip hidden dirs
          if (!entry.name.startsWith('.')) {
            collectFiles(fullPath, baseDir);
          }
        } else {
          // Skip hidden files, screenshots, and large screenshots
          if (!entry.name.startsWith('.') && !entry.name.endsWith('.png') && entry.name !== 'deploy_netlify.js' && entry.name !== 'netlify_auto.py' && entry.name !== 'netlify_dns.py') {
            files.push(fullPath);
          }
        }
      }
    }
    collectFiles(SITE_DIR, SITE_DIR);
    console.log(`Collected ${files.length} files to upload`);
    
    // Set the file input to all files — this triggers Netlify's folder upload
    await fileInput.setInputFiles(files);
    console.log('Files set. Waiting for Netlify to process...');
    
    // Wait for the deploy to complete (look for success URL or deploy progress)
    await page.waitForTimeout(10000);
    
    // Take screenshot to see status
    await page.screenshot({ path: path.join(SITE_DIR, 'deploy_step2.png') });
    
    // Look for the deploy URL
    const currentUrl = page.url();
    console.log('Current URL after upload:', currentUrl);
    
    // Wait a bit more for processing
    await page.waitForTimeout(15000);
    await page.screenshot({ path: path.join(SITE_DIR, 'deploy_step3.png') });
    
    // Try to find the site URL on the page
    const deployUrl = await page.$eval('a[href*="netlify.app"]', el => el.href).catch(() => null);
    if (deployUrl) {
      console.log('Deploy URL found:', deployUrl);
    }
    
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
  } else {
    console.log('No file input found. Trying alternative approach...');
    await page.screenshot({ path: path.join(SITE_DIR, 'deploy_fail.png') });
  }
  
  console.log('\nDone. Check the Chrome window for deploy status.');
  await page.close();
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
