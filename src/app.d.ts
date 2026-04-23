import type { RetailerSession, AdminSession } from '$lib/types/database';

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			retailerSession: RetailerSession & { retailer_mobile: string } | null;
			adminSession: AdminSession | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
