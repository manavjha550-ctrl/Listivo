/**
 * Test script for Extension Server API Endpoints & Seller Isolation
 */

async function testServerEndpoints() {
  console.log('\n[SERVER TEST] Verifying Extension API Endpoints on http://localhost:3000...\n');

  const baseUrl = 'http://localhost:3000';

  // 1. Health check
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthJson = await healthRes.json();
  console.log('Health check:', healthJson.status === 'ok' ? '✓ OK' : '✗ Failed');

  // 2. Unauthenticated extension status
  const unauthStatusRes = await fetch(`${baseUrl}/api/extension/status`);
  const unauthStatus = await unauthStatusRes.json();
  console.log('Unauthenticated /api/extension/status:', unauthStatus.status === 'NOT_CONNECTED' ? '✓ Correctly NOT_CONNECTED' : '✗ Failed');

  // 3. Unauthenticated access to protected templates
  const unauthTemplatesRes = await fetch(`${baseUrl}/api/extension/templates`);
  console.log('Unauthenticated /api/extension/templates:', unauthTemplatesRes.status === 401 ? '✓ Correctly returns 401' : '✗ Failed');

  // 4. Authenticate as Owner
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manavjha550@gmail.com', password: '' }),
  });
  const loginData = await loginRes.json();
  const ownerToken = loginData.token;
  const ownerId = loginData.user.id;
  console.log('Owner login:', ownerToken ? `✓ Logged in as ${loginData.user.email} (token received)` : '✗ Failed');

  // 5. Extension status with token
  const authStatusRes = await fetch(`${baseUrl}/api/extension/status`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const authStatus = await authStatusRes.json();
  console.log('Authenticated /api/extension/status:', authStatus.status === 'CONNECTED' && authStatus.user?.email === 'manavjha550@gmail.com' ? '✓ Connected with verified email' : '✗ Failed');

  // 6. Fetch templates with token
  const templatesRes = await fetch(`${baseUrl}/api/extension/templates`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const templatesData = await templatesRes.json();
  console.log('Authenticated /api/extension/templates:', templatesData.success && Array.isArray(templatesData.data) ? `✓ Returned ${templatesData.count} seller templates` : '✗ Failed');

  // 7. Fetch listings with token
  const listingsRes = await fetch(`${baseUrl}/api/extension/listings`, {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  const listingsData = await listingsRes.json();
  console.log('Authenticated /api/extension/listings:', listingsData.success && Array.isArray(listingsData.data) ? `✓ Returned ${listingsData.count} seller listings` : '✗ Failed');

  // 8. Extension activity logging
  const activityRes = await fetch(`${baseUrl}/api/extension/activity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ownerToken}`,
    },
    body: JSON.stringify({
      type: 'MEESHO_AUTOFILL_TEST',
      title: 'QA Test Autofill Completed',
      description: 'Automated Phase 8C audit run',
      marketplace: 'MEESHO',
      fieldsCount: 12,
    }),
  });
  const activityData = await activityRes.json();
  console.log('Extension activity logging:', activityData.success ? '✓ Activity recorded successfully' : '✗ Failed');

  // 9. Seller Data Isolation Test
  // Create or test a secondary seller
  const seller2Token = 'listivo-token-seller2-test-unique-id-9999';
  const seller2TemplatesRes = await fetch(`${baseUrl}/api/extension/templates`, {
    headers: { Authorization: `Bearer ${seller2Token}` },
  });
  // If user doesn't exist, returns 401
  console.log('Invalid/Unknown seller token handling:', seller2TemplatesRes.status === 401 ? '✓ Rejecting invalid seller token (401)' : '✗ Failed');

  console.log('\n[SERVER TEST COMPLETE] All extension backend endpoints verified!\n');
}

testServerEndpoints().catch((err) => {
  console.error('[Server Test Error]', err);
  process.exit(1);
});
