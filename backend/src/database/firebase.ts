import { mockAdmin } from './firebase-local-mock.js';

/**
 * WildGuard AI Database Wrapper
 * This file is configured to use a local MOCK database by default to ensure
 * the system runs even if firebase-admin or network connectivity is missing.
 */
let admin: any = mockAdmin;

// Initializing the mock or real admin
if (!admin.apps || !admin.apps.length) {
  admin.initializeApp();
}

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;
