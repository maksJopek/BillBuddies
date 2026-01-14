import { downloadDir } from '@tauri-apps/api/path';
import { readFile } from '@tauri-apps/plugin-fs';
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { formatDateStandard } from '$lib/date';

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

type BankType = 'ing' | 'pko' | 'pekao';

const ING_LABEL = 'ING Bank Śląski S.A.';
const PKO_LABEL = 'Powszechna Kasa Oszczędności Bank Polski SA';
const PEKAO_LABEL = 'Bank Pekao S.A.';

function detectBank(text: string[]): BankType | null {
	for (const item of text) {
		if (item.includes(ING_LABEL)) {
			return 'ing';
		}
		if (item.includes(PKO_LABEL)) {
			return 'pko';
		}
		if (item.includes(PEKAO_LABEL)) {
			return 'pekao';
		}
	}
	return null;
}

export interface PaymentData {
	amount: number | null;
	date: string | null;
}

const ING_AMOUNT_LABEL = 'Amount';
const ING_DATE_LABEL = 'Transaction date:';

function extractINGPaymentData(text: string[]): PaymentData {
	const data: PaymentData = { amount: null, date: null };
	let nextAmount = false;
	let nextDate = false;
	for (const item of text) {
		if (nextAmount) {
			const amount = parseFloat(item.replaceAll(',', '.'));
			if (!Number.isNaN(amount)) {
				data.amount = amount;
			}
			nextAmount = false;
		} else if (nextDate) {
			const date = Date.parse(item.split('.').reverse().join('-'));
			if (!Number.isNaN(date)) {
				data.date = formatDateStandard(new Date(date));
			}
			nextDate = false;
		} else if (item.includes(ING_AMOUNT_LABEL)) {
			nextAmount = true;
		} else if (item.includes(ING_DATE_LABEL)) {
			nextDate = true;
		}
	}
	return data;
}

const PKO_AMOUNT_PREFIX = 'Oryginalna kwota operacji : ';
const PKO_DATE_PREFIX = 'Data i czas operacji : ';

function extractPKOPaymentData(text: string[]): PaymentData {
	const data: PaymentData = { amount: null, date: null };
	for (const item of text) {
		if (item.startsWith(PKO_AMOUNT_PREFIX)) {
			const amount = parseFloat(
				item.substring(PKO_AMOUNT_PREFIX.length).replaceAll(',', '.')
			);
			if (!Number.isNaN(amount)) {
				data.amount = amount;
			}
		} else if (item.startsWith(PKO_DATE_PREFIX)) {
			const date = Date.parse(item.substring(PKO_DATE_PREFIX.length));
			if (!Number.isNaN(date)) {
				data.date = formatDateStandard(new Date(date));
			}
		}
	}
	return data;
}

const PEKAO_AMOUNT_LABEL = 'Kwota operacji:';
const PEKAO_DATE_LABEL = 'Data księgowania:';

function extractPekaoPaymentData(text: string[]): PaymentData {
	const data: PaymentData = { amount: null, date: null };
	let nextAmount = false;
	let nextDate = false;
	for (const item of text) {
		if (nextAmount) {
			let amount = parseFloat(item.replaceAll(',', '.'));
			if (!Number.isNaN(amount)) {
				if (amount < 0) {
					amount *= -1;
				}
				data.amount = amount;
			}
			nextAmount = false;
		} else if (nextDate) {
			const date = Date.parse(item.split('/').reverse().join('-'));
			if (!Number.isNaN(date)) {
				data.date = formatDateStandard(new Date(date));
			}
			nextDate = false;
		} else if (item.includes(PEKAO_AMOUNT_LABEL)) {
			nextAmount = true;
		} else if (item.includes(PEKAO_DATE_LABEL)) {
			nextDate = true;
		}
	}
	return data;
}

function extractPaymentData(text: string[]): PaymentData {
	const type = detectBank(text);
	if (!type) {
		return { amount: null, date: null };
	}
	switch (type) {
		case 'ing': {
			return extractINGPaymentData(text);
		}
		case 'pko': {
			return extractPKOPaymentData(text);
		}
		case 'pekao': {
			return extractPekaoPaymentData(text);
		}
	}
}

export async function extractPayment(file: Uint8Array<ArrayBuffer>) {
	const pdf = await getDocument(file).promise;
	const page = await pdf.getPage(1);
	const content = await page.getTextContent();
	const text = content.items
		.map((item) => ('str' in item ? item.str : ''))
		.filter((str) => str.trim() !== '');
	return extractPaymentData(text);
}

export async function extractPaymentFile(
	file: string
): Promise<PaymentData | null> {
	const buffer = await readFile(file);
	return extractPayment(buffer);
}

export async function openPayment(): Promise<PaymentData | null> {
	const path = await openDialog({
		defaultPath: await downloadDir(),
		directory: false,
		multiple: false,
		filters: [{ name: 'PDF', extensions: ['pdf'] }]
	});
	if (path === null) {
		return null;
	}
	const buffer = (await readFile(path)).buffer;
	if (!buffer) {
		return null;
	}
	return extractPayment(new Uint8Array(buffer));
}
