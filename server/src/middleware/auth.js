const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initError = null;

try {
    // STRATEGY: Try loading from JSON file first (Most Reliable)
    const keyFilePath = path.join(__dirname, '../../firebase-key.json');

    if (fs.existsSync(keyFilePath)) {
        console.log('🔑 Found firebase-key.json. Using file credentials.');
        const serviceAccount = require(keyFilePath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('🔥 Firebase Admin Initialized (via JSON file)');
    }
    // FALLBACK: Try .env (Legacy/Backup)
    else if (process.env.FIREBASE_PROJECT_ID) {
        console.log('⚠️ firebase-key.json not found. Falling back to .env variables.');

        let secretKey = process.env.FIREBASE_PRIVATE_KEY;
        if (secretKey) {
            secretKey = secretKey.replace(/\r/g, '').replace(/\\n/g, '\n');
            const match = secretKey.match(/-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/);
            if (match) secretKey = match[0];
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: secretKey,
            }),
        });
        console.log('🔥 Firebase Admin Initialized (via .env)');
    } else {
        console.warn('⚠️ No credentials found. Auth middleware will run in mockup mode.');
    }
} catch (error) {
    console.error('❌ Firebase Init Error:', error);
    initError = error;
}

const verifyToken = async (req, res, next) => {
    // 1. Diagnostic Check
    if (admin.apps.length === 0) {
        return res.status(500).json({
            error: 'Firebase Initialization Failed on Server',
            details: initError ? initError.message : 'Unknown Error',
            suggestion: 'Please upload firebase-key.json to the server root directory.'
        });
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        if (req.user.email !== 'ochalfie@gmail.com') {
            return res.status(403).json({ error: `Unauthorized access. Admin only. Email found: ${req.user.email}` });
        }

        next();
    } catch (error) {
        return res.status(403).json({ error: `Invalid token: ${error.message}` });
    }
};

module.exports = verifyToken;
