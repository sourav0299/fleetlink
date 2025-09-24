'use client';

import { useCallback } from 'react';

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, unknown>;
}

interface PaymentConfig {
  amount: number;
  bookingId: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  vehicleNumber?: string;
  description?: string;
}

export const useRazorpay = () => {
  const loadRazorpayScript = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  // Create Razorpay order
  const createOrder = useCallback(async (paymentConfig: PaymentConfig) => {
    try {
      console.log('Creating payment order for amount:', paymentConfig.amount);
      
      if (!paymentConfig.amount || paymentConfig.amount <= 0) {
        throw new Error(`Invalid amount: ₹${paymentConfig.amount}`);
      }
      
      const response = await fetch('/api/create-payment-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentConfig.amount * 100,
          currency: 'INR'
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        throw new Error(`Invalid response from payment service (${response.status}): ${response.statusText}`);
      }
      
      if (!response.ok) {
        console.error('Payment order creation failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details,
          fullResponse: data
        });
        
        const errorMessage = data.error || data.message || `Payment service error (${response.status}: ${response.statusText})`;
        throw new Error(errorMessage);
      }

      console.log('Payment order created successfully:', data);
      
      return {
        id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt
      };
    } catch (error) {
      console.error('Error creating payment order:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to payment service. Please check your internet connection.');
      }
      throw error;
    }
  }, []);

  const initiatePayment = useCallback(async (
    paymentConfig: PaymentConfig,
    onSuccess: (response: RazorpayResponse) => void,
    onFailure: (error: RazorpayError) => void
  ) => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // Create order
      const orderData = await createOrder(paymentConfig);

      console.log('Creating Razorpay options:', {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'FleetLink',
        description: paymentConfig.description || 'Booking Payment',
        order_id: orderData.id,
        handler: (response: RazorpayResponse) => {
          console.log('Payment successful:', response);
          onSuccess(response);
        },
        prefill: {
          name: paymentConfig.customerName,
          contact: paymentConfig.customerMobile,
          email: paymentConfig.customerEmail || '',
        },
        notes: {
          bookingId: paymentConfig.bookingId,
          vehicleNumber: paymentConfig.vehicleNumber || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            onFailure({
              code: 'PAYMENT_CANCELLED',
              description: 'Payment cancelled by user',
              source: 'razorpay',
              step: 'checkout',
              reason: 'user_cancelled',
              metadata: {},
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      onFailure({
        code: 'INIT_ERROR',
        description: error instanceof Error ? error.message : 'Failed to initialize payment',
        source: 'useRazorpay',
        step: 'initialization',
        reason: 'hook_error',
        metadata: { error },
      });
    }
  }, [loadRazorpayScript, createOrder]);

  const verifyPayment = useCallback(async (
    paymentId: string,
    orderId: string,
    signature: string
  ) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }, []);

  return {
    loadRazorpayScript,
    createOrder,
    initiatePayment,
    verifyPayment,
  };
};