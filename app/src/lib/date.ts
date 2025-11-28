function pad(n: number) {
	if (n > 9) {
		return `${n}`;
	}
	return `0${n}`;
}

export function formatDateStandard(date: Date) {
	const d = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	const t = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
	return `${d}T${t}`;
}

const MONTHS = [
	'Sty',
	'Lut',
	'Mar',
	'Kwi',
	'Maj',
	'Cze',
	'Lip',
	'Sie',
	'Wrz',
	'Paź',
	'Lis',
	'Gru'
];

export function formatDatePretty(date: Date) {
	const d = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
	const t = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
	return `${d} ${t}`;
}
