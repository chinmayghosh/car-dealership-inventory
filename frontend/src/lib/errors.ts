import { ApiError } from '../api/client';

/** Turns anything thrown by an API call into a message that is safe to show the user. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}
