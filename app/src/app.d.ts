import type { User } from '$lib/server/users';
import type { ExtendedWebSocketServer } from '$lib/server/webSocketUtils';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			wss?: ExtendedWebSocketServer;
            user?: User;
            sswsId?: string;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
