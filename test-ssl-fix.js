#!/usr/bin/env node

/**
 * Test script to verify SSL certificate bypass for Rupee Rush API
 * Run this script to test if the SSL configuration works
 */

import axios from 'axios';
import https from 'https';

const testSSLBypass = async () => {
  console.log('🔧 Testing SSL certificate bypass for Rupee Rush API...\n');

  const PAY_URL = "https://api.rupeerush.cc/payin/create";
  
  // Test data (this will fail validation but should pass SSL)
  const testParams = {
    merNo: "TEST123",
    currencyCode: "INR",
    payType: "INRO",
    randomNo: "12345678901234",
    outTradeNo: "TEST123456789",
    totalAmount: "100.00",
    notifyUrl: "https://example.com/callback",
    payCardNo: "123456",
    payBankCode: "PAY",
    payName: "test",
    payEmail: "test@email.com",
    payPhone: "+919876543210",
    sign: "TESTSIGNATURE"
  };

  try {
    console.log('📡 Testing without SSL bypass (should fail)...');
    
    // Test without SSL bypass (should fail)
    try {
      await axios.post(PAY_URL, testParams, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      console.log('❌ Unexpected: Request succeeded without SSL bypass');
    } catch (error) {
      if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
        console.log('✅ Expected SSL error occurred:', error.code);
      } else {
        console.log('⚠️  Different error (not SSL):', error.message);
      }
    }

    console.log('\n📡 Testing with SSL bypass (should work)...');
    
    // Test with SSL bypass (should work)
    const rupeeRushAxios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
      }),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js/Test-Client'
      }
    });

    const response = await rupeeRushAxios.post(PAY_URL, testParams);
    console.log('✅ SSL bypass successful! Response received:', response.status);
    console.log('📄 Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('✅ SSL bypass successful! API responded with:', error.response.status);
      console.log('📄 Response data:', JSON.stringify(error.response.data, null, 2));
      console.log('💡 This is expected - the test data should fail validation');
    } else if (error.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
      console.log('❌ SSL bypass failed - still getting certificate error');
    } else {
      console.log('⚠️  Other error:', error.message);
    }
  }

  console.log('\n🎉 SSL test completed!');
  console.log('💡 If you see "SSL bypass successful" above, the integration should work.');
};

// Run the test
testSSLBypass().catch(console.error);

