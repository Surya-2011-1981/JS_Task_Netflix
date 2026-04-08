// Firebase Service
// Authentication and user management

// Firebase configuration placeholder
// Replace with your actual Firebase credentials
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDemoKey123456789',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-project-id',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'
};

let firebaseInitialized = false;
let auth = null;

/**
 * Initialize Firebase (lazy load)
 */
async function initializeFirebase() {
    if (firebaseInitialized) return auth;

    try {
        // Dynamic import to avoid errors if Firebase config is incomplete
        const firebase = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');

        // Initialize Firebase only if valid config
        if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('Demo')) {
            firebase.default.initializeApp(firebaseConfig);
            auth = getAuth(firebase.default.app());
            firebaseInitialized = true;
        } else {
            console.warn('Firebase not configured with valid credentials');
        }

        return auth;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return null;
    }
}

/**
 * Sign up with email and password
 */
export async function signUp(email, password) {
    try {
        const authInstance = await initializeFirebase();

        if (!authInstance) {
            return {
                success: false,
                error: 'Firebase not configured. Using guest mode.',
                user: null
            };
        }

        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const result = await createUserWithEmailAndPassword(authInstance, email, password);

        return {
            success: true,
            user: {
                id: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            user: null
        };
    }
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
    try {
        const authInstance = await initializeFirebase();

        if (!authInstance) {
            return {
                success: false,
                error: 'Firebase not configured. Using guest mode.',
                user: null
            };
        }

        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const result = await signInWithEmailAndPassword(authInstance, email, password);

        return {
            success: true,
            user: {
                id: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            user: null
        };
    }
}

/**
 * Sign in as guest
 */
export async function signInAsGuest() {
    try {
        const { signInAnonymously } = await import('firebase/auth');
        const authInstance = await initializeFirebase();

        if (!authInstance) {
            // Return guest user without Firebase
            return {
                success: true,
                user: {
                    id: 'guest-' + Date.now(),
                    email: null,
                    displayName: 'Guest User',
                    isAnonymous: true
                }
            };
        }

        const result = await signInAnonymously(authInstance);

        return {
            success: true,
            user: {
                id: result.user.uid,
                email: result.user.email,
                displayName: 'Guest User',
                isAnonymous: true
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            user: null
        };
    }
}

/**
 * Sign out
 */
export async function signOut() {
    try {
        const authInstance = await initializeFirebase();

        if (authInstance) {
            const { signOut: firebaseSignOut } = await import('firebase/auth');
            await firebaseSignOut(authInstance);
        }

        return {
            success: true,
            message: 'Signed out successfully'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Listen to auth state changes
 */
export async function onAuthStateChanged(callback) {
    try {
        const authInstance = await initializeFirebase();

        if (!authInstance) {
            // Simulate auth state if Firebase not available
            callback(null);
            return () => { };
        }

        const { onAuthStateChanged: firebaseOnAuthStateChanged } = await import('firebase/auth');
        return firebaseOnAuthStateChanged(authInstance, callback);
    } catch (error) {
        console.error('Auth state listener error:', error);
        callback(null);
        return () => { };
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(displayName) {
    try {
        const authInstance = await initializeFirebase();

        if (!authInstance || !authInstance.currentUser) {
            return {
                success: false,
                error: 'No user logged in'
            };
        }

        const { updateProfile } = await import('firebase/auth');
        await updateProfile(authInstance.currentUser, { displayName });

        return {
            success: true,
            user: {
                id: authInstance.currentUser.uid,
                email: authInstance.currentUser.email,
                displayName: authInstance.currentUser.displayName
            }
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
    try {
        const authInstance = await initializeFirebase();

        if (!authInstance || !authInstance.currentUser) {
            return null;
        }

        return {
            id: authInstance.currentUser.uid,
            email: authInstance.currentUser.email,
            displayName: authInstance.currentUser.displayName,
            isAnonymous: authInstance.currentUser.isAnonymous
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
