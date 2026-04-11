const PAYPACK_API_BASE = 'https://payments.paypack.rw/api';

export type PaymentResponse = {
  ref: string;
  status: 'pending' | 'successful' | 'failed';
  amount: number;
  phone: string;
  kind: string;
};

export const paymentService = {
  /**
   * Initiates a Mobile Money Cash-in (receiving payment)
   * @param phone - Rwandan phone number (078..., 079..., 072..., 073...)
   * @param amount - Amount in RWF
   */
  async initiateMomoPayment(phone: string, amount: number): Promise<string | null> {
    try {
      // 1. Get Access Token (In a production app, this should be done server-side or cached)
      // Since this is a client-side call for now, we'll try to use the public key if supported,
      // or assume a proxy/edge function will handle the secret-based auth.
      // For this implementation, we will use the direct endpoint.
      
      const response = await fetch(`${PAYPACK_API_BASE}/transactions/cashin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYPACK_PUBLISHABLE_KEY || ''}`,
        },
        body: JSON.stringify({
          amount,
          number: phone,
        }),
      });

      const data = await response.json();

      if (data && data.ref) {
        return data.ref;
      }

      console.error('Paypack Initiation Error:', data);
      return null;
    } catch (err) {
      console.error('Payment Service Error:', err);
      return null;
    }
  },

  /**
   * Polls the status of a transaction
   */
  async checkPaymentStatus(ref: string): Promise<PaymentResponse['status']> {
    try {
      const response = await fetch(`${PAYPACK_API_BASE}/transactions/find/${ref}`, {
        method: 'GET',
        headers: {
          'X-Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYPACK_PUBLISHABLE_KEY || ''}`,
        },
      });

      const data = await response.json();
      
      if (data && data.status) {
        return data.status as PaymentResponse['status'];
      }

      return 'pending';
    } catch (err) {
      console.error('Status Check Error:', err);
      return 'pending';
    }
  }
};
