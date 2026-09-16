// Mock implementation of firebase-admin to prevent MODULE_NOT_FOUND errors
export const mockAdmin = {
  apps: [],
  initializeApp: (config?: any) => {
    console.log('--- FIRESBASE MOCK INITIALIZED ---');
    return { name: '[DEFAULT]' };
  },
  credential: {
    cert: (serviceAccount: any) => ({})
  },
  auth: () => ({
    verifyIdToken: async (token: string) => ({ uid: 'mock-user' }),
    getUser: async (uid: string) => ({ uid, email: 'mock@example.com' })
  }),
  firestore: () => ({
    collection: (name: string) => ({
      doc: (id: string) => ({
        set: async (data: any) => { console.log(`Mock DB [${name}] Set:`, id); return data; },
        get: async () => ({ exists: false, data: () => null }),
        update: async (data: any) => { console.log(`Mock DB [${name}] Update:`, id); return data; },
        delete: async () => { console.log(`Mock DB [${name}] Delete:`, id); }
      }),
      add: async (data: any) => { console.log(`Mock DB [${name}] Add`); return { id: 'mock-id-' + Date.now() }; },
      get: async () => ({ docs: [], empty: true }),
      where: function() { return this; },
      limit: function() { return this; },
      orderBy: function() { return this; }
    })
  })
};

export default mockAdmin;
