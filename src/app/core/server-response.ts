import { InjectionToken, inject } from '@angular/core';

export interface ServerResponseLike {
  status(code: number): unknown;
}

/** The Express response, provided by server.ts during server rendering only. */
export const SERVER_RESPONSE = new InjectionToken<ServerResponseLike>('SERVER_RESPONSE');

/** Sends a real 404 status when rendered on the server. Must be called in an injection context. */
export function markNotFound(): void {
  inject(SERVER_RESPONSE, { optional: true })?.status(404);
}
