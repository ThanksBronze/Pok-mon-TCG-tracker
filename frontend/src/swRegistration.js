import { Workbox } from 'workbox-window';

export function registerSW() {
	if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
		const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
		const wb = new Workbox(swUrl);

		wb.addEventListener('waiting', () => {
			wb.messageSkipWaiting();
		});

		wb.register();
	}
}