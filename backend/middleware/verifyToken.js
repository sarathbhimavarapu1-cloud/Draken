let admin = null;

// ── Firebase Admin Init (optional) ───────────────────────────────────────────
// When the service account is present, all tokens are verified against Firebase.
// Without it the middleware runs in "dev-passthrough" mode — perfect for local dev.
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const firebaseAdmin = require('firebase-admin');
    const serviceAccount = require(require('path').resolve(serviceAccountPath));
    if (!firebaseAdmin.apps.length) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });
    }
    admin = firebaseAdmin;
    console.log('✅ Firebase Admin SDK initialized — tokens will be verified');
  } else {
    console.log('⚠️  FIREBASE_SERVICE_ACCOUNT_PATH not set — running in dev-passthrough mode');
  }
} catch (err) {
  console.warn('⚠️  Firebase Admin init failed:', err.message, '— running in dev-passthrough mode');
}

/**
 * Express middleware that verifies a Firebase ID token from the Authorization header.
 * In dev mode (no Firebase Admin), it passes through with a demo user object.
 */
const verifyToken = async (req, res, next) => {
  // Dev-passthrough: no Firebase Admin configured
  if (!admin) {
    req.user = { uid: 'demo-user', email: 'demo@draken.ai', name: 'Demo User' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
