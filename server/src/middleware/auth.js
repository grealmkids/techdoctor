const admin = require('firebase-admin');

// Initialize Firebase Admin (Wrapped in try-catch to avoid crashing if env vars missing during dev)
try {
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log('🔥 Firebase Admin Initialized');
    } else {
        console.warn('⚠️ Firebase credentials not found. Auth middleware will run in mockup mode.');
    }
} catch (error) {
    console.error('❌ Firebase Init Error:', error);
}

const verifyToken = async (req, res, next) => {
    // For development without Firebase credentials, allow bypass if needed (remove in production)
    if (!process.env.FIREBASE_PROJECT_ID) {
        // MOCK ADMIN
        req.user = { email: 'ochalfie@gmail.com', uid: 'mock-admin-uid' };
        return next();
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.warn('⚠️ [Auth] No token provided in headers');
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        // Admin check as per PRD
        if (req.user.email !== 'ochalfie@gmail.com') {
            console.warn(`⛔ [Auth] Unauthorized email access attempt: ${req.user.email}`);
            return res.status(403).json({ error: 'Unauthorized access. Admin only.' });
        }

        console.log(`✅ [Auth] Verified user: ${req.user.email}`);
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;
