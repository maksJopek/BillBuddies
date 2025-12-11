import type { PaymentData } from '$lib/pdf';

export interface PaymentShare {
	roomId: string | null;
	data: PaymentData;
}

export const paymentShare = $state<PaymentShare>({
	roomId: null,
	data: { amount: null, date: null }
});
