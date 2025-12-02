// ===================================
// FIREBASE SERVICE MODULE
// For authentication and data storage
// ===================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    updateDoc,
    doc,
    where,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase Configuration
// IMPORTANT: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===================================
// SUBMISSION FUNCTIONS
// ===================================

export async function saveSubmission(data) {
    try {
        const docRef = await addDoc(collection(db, 'submissions'), {
            ...data,
            timestamp: Timestamp.now(),
            reviewed: false
        });

        console.log('Submission saved with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving submission:', error);
        throw error;
    }
}

export async function getAllSubmissions() {
    try {
        const q = query(
            collection(db, 'submissions'),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const submissions = [];

        querySnapshot.forEach((doc) => {
            submissions.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return submissions;
    } catch (error) {
        console.error('Error getting submissions:', error);
        throw error;
    }
}

export async function searchSubmissions(searchTerm) {
    try {
        const allSubmissions = await getAllSubmissions();

        // Client-side filtering
        return allSubmissions.filter(submission => {
            const name = submission.customerDetails?.fullName?.toLowerCase() || '';
            const email = submission.customerDetails?.email?.toLowerCase() || '';
            const search = searchTerm.toLowerCase();

            return name.includes(search) || email.includes(search);
        });
    } catch (error) {
        console.error('Error searching submissions:', error);
        throw error;
    }
}

export async function filterSubmissionsByDate(startDate, endDate) {
    try {
        const allSubmissions = await getAllSubmissions();

        return allSubmissions.filter(submission => {
            const eventDate = new Date(submission.customerDetails?.eventDate);
            const start = new Date(startDate);
            const end = new Date(endDate);

            return eventDate >= start && eventDate <= end;
        });
    } catch (error) {
        console.error('Error filtering submissions:', error);
        throw error;
    }
}

export async function markAsReviewed(submissionId, reviewed = true) {
    try {
        const submissionRef = doc(db, 'submissions', submissionId);
        await updateDoc(submissionRef, {
            reviewed,
            reviewedAt: reviewed ? Timestamp.now() : null
        });

        console.log('Submission marked as reviewed:', submissionId);
    } catch (error) {
        console.error('Error updating submission:', error);
        throw error;
    }
}

// ===================================
// AUTHENTICATION FUNCTIONS
// ===================================

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        console.log('User logged out');
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth.currentUser;
}
