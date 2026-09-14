#!/usr/bin/env node

/**
 * Helper script to generate Upstox OAuth authorization URL
 * Usage: node scripts/generate-auth-url.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n📱 Upstox OAuth URL Generator\n');
console.log('This will help you generate the authorization URL for getting your access token.\n');

rl.question('Enter your Upstox API Key (Client ID): ', (apiKey) => {
  if (!apiKey.trim()) {
    console.error('❌ API Key is required!');
    rl.close();
    return;
  }

  const redirectUri = 'http://localhost:3000';
  const authUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${apiKey.trim()}&redirect_uri=${redirectUri}`;

  console.log('\n✅ Your authorization URL:\n');
  console.log(authUrl);
  console.log('\n📋 Next steps:');
  console.log('1. Copy the URL above');
  console.log('2. Open it in your browser');
  console.log('3. Login to Upstox and authorize the app');
  console.log('4. You will be redirected to: http://localhost:3000?code=XXXXX');
  console.log('5. Copy the "code" parameter from the URL');
  console.log('6. Use that code to get your access token\n');

  rl.question('Do you want to generate the curl command for token? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      rl.question('Enter your API Secret: ', (apiSecret) => {
        rl.question('Enter the authorization code from redirect URL: ', (code) => {
          console.log('\n✅ Run this command to get your access token:\n');
          console.log(`curl -X POST https://api.upstox.com/v2/login/authorization/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "code=${code.trim()}" \\
  -d "client_id=${apiKey.trim()}" \\
  -d "client_secret=${apiSecret.trim()}" \\
  -d "redirect_uri=${redirectUri}" \\
  -d "grant_type=authorization_code"`);
          console.log('\n📝 The response will contain your access_token\n');
          rl.close();
        });
      });
    } else {
      console.log('\n👋 Done! Use the authorization URL above.\n');
      rl.close();
    }
  });
});
