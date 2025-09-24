// Test the payment flow with the exact same data structure
async function testPaymentFlow() {
  console.log('=== Testing Payment Flow ===');
  
  // Simulate the exact payment config that would be generated
  const testPaymentConfig = {
    amount: 150, // Sample amount
    bookingId: 'TEST_' + Date.now(),
    customerName: 'Test Customer',
    customerMobile: '9876543210',
    vehicleNumber: 'KA01AB1234',
    description: 'FleetLink Booking Payment - KA01AB1234'
  };

  console.log('Test payment config:', testPaymentConfig);

  try {
    // Test the API call directly
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPaymentConfig),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('❌ Payment order creation failed:', data.error);
      return false;
    } else {
      console.log('✅ Payment order created successfully!');
      return true;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Run test
if (typeof window !== 'undefined') {
  window.testPaymentFlow = testPaymentFlow;
  console.log('💡 Payment test function loaded. Run: testPaymentFlow()');
}