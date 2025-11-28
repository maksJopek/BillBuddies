import type { PaymentData } from '$lib/pdf';

export interface PDFShare {
	roomId: string | null;
	data: PaymentData;
}

export const pdfShare = $state<PDFShare>({
	roomId: null,
	data: { amount: null, date: null }
});
