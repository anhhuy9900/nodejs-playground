// Initialize keys for both local and public tokens
export let localKey: any;
export let privateKey: any;
export let publicKey: any;

export interface CustomPayload extends Record<string, unknown> {
  sub: string; // Subject (user ID)
  name: string; // User name
  admin: boolean; // Admin flag
  iat: number; // Issued At (Unix timestamp in seconds)
  exp: number; // Expiration (Unix timestamp in seconds)
}
