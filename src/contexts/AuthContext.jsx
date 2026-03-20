import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, collection, addDoc, updateDoc,
  query, where, onSnapshot, serverTimestamp, writeBatch, arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);
  const unsubInvitesRef = useRef(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);

      // Tear down previous invite listener
      if (unsubInvitesRef.current) { unsubInvitesRef.current(); unsubInvitesRef.current = null; }

      if (u) {
        // Ensure user profile doc exists
        const profileRef = doc(db, 'users', u.uid);
        const snap = await getDoc(profileRef);
        if (!snap.exists()) {
          const firstName = u.displayName?.split(' ')[0] || u.email.split('@')[0];
          await setDoc(profileRef, { firstName, email: u.email, linkedWith: [], createdAt: serverTimestamp() });
        }

        // Listen for pending link invites addressed to this email
        const q = query(
          collection(db, 'linkRequests'),
          where('toEmail', '==', u.email),
          where('status', '==', 'pending')
        );
        unsubInvitesRef.current = onSnapshot(q, (snap) => {
          setPendingInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }, () => setPendingInvites([]));
      } else {
        setPendingInvites([]);
      }
    });

    return () => {
      unsubAuth();
      if (unsubInvitesRef.current) unsubInvitesRef.current();
    };
  }, []);

  async function login(email, password) {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(friendlyError(err.code));
      throw err;
    }
  }

  async function signup(firstName, email, password) {
    setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: firstName });
      await setDoc(doc(db, 'users', cred.user.uid), {
        firstName,
        email,
        linkedWith: [],
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError(friendlyError(err.code));
      throw err;
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function sendLinkRequest(toEmail) {
    if (!user) return;
    const firstName = user.displayName?.split(' ')[0] || user.email.split('@')[0];
    await addDoc(collection(db, 'linkRequests'), {
      fromUid:   user.uid,
      fromName:  firstName,
      fromEmail: user.email,
      toEmail:   toEmail.trim().toLowerCase(),
      status:    'pending',
      createdAt: serverTimestamp(),
    });
  }

  async function acceptLinkRequest(requestId, fromUid) {
    if (!user) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', user.uid), { linkedWith: arrayUnion(fromUid) });
    batch.update(doc(db, 'users', fromUid),  { linkedWith: arrayUnion(user.uid) });
    batch.update(doc(db, 'linkRequests', requestId), { status: 'accepted' });
    await batch.commit();
  }

  async function declineLinkRequest(requestId) {
    await updateDoc(doc(db, 'linkRequests', requestId), { status: 'declined' });
  }

  function friendlyError(code) {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || '';

  return (
    <AuthContext.Provider value={{
      user, loading, error, firstName,
      pendingInvites,
      login, signup, logout,
      sendLinkRequest, acceptLinkRequest, declineLinkRequest,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
