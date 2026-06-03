import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword ,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLock, faCircleNotch,faUser } from '@fortawesome/free-solid-svg-icons';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Starts true to catch mobile redirects
  
  const navigate = useNavigate();

  // 1. Catch Mobile Users returning from Google
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          navigate('/'); 
        }

      })
      .catch((err) => {
        // Ignore user cancellation, show other errors
        if (err.code !== 'auth/redirect-cancelled-by-user') {
          setError(err.message.replace('Firebase: ', ''));
          console.log(err.message);
        }
      })
      .finally(() => {
        setLoading(false); // Stop loading spinner whether it succeeded, failed, or was null
      });
  }, [navigate]);

  // 2. The Hybrid Google Auth Function
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    setError('');
    
    // Basic mobile detection regex
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Execute Mobile strategy (Redirect)
      setLoading(true);
      signInWithRedirect(auth, provider);
    } else {
      // Execute Desktop strategy (Popup)
      try {
        setLoading(true);
        await signInWithPopup(auth, provider);
        navigate('/');
      } catch (err) {
        if (err.code === 'auth/popup-closed-by-user') {
          setError('You closed the gateway before the connection was established.');
        } else {
          setError(err.message.replace('Firebase: ', ''));
        }
        setLoading(false);
      }
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const chosenName = name || `User${Math.floor(Math.random() * 1000)}`;
        await updateProfile(userCredential.user, {
          displayName: chosenName,
        });
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          displayName: chosenName,
          email,
          role: accountType,
          sellerStatus: accountType === 'seller' ? 'pending' : 'active',
          createdAt: serverTimestamp(),
          createdVia: 'email',
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-amber-500">
        <FontAwesomeIcon icon={faCircleNotch} spin size="3x" className="mb-4" />
        <p className="text-gray-400 animate-pulse">Establishing connection to the astral realm...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden">
        
        <div className="p-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-2">
            {isLogin ? 'Enter the Vortex' : 'Join the Archives'}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8 text-sm">
            Authenticate your spirit body to continue.
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            {/* Only show Name field if they are signing up */}
{!isLogin && (
  <>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
        <FontAwesomeIcon icon={faUser} />
      </div>
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
        placeholder="Display Name"
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:border-amber-400 transition-colors">
        <input
          type="radio"
          name="accountType"
          value="buyer"
          checked={accountType === 'buyer'}
          onChange={() => setAccountType('buyer')}
          className="h-4 w-4 text-amber-500 focus:ring-amber-400"
        />
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Buyer account</span>
          <p className="text-gray-500 dark:text-gray-400">Browse products and manage orders.</p>
        </div>
      </label>
      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:border-amber-400 transition-colors">
        <input
          type="radio"
          name="accountType"
          value="seller"
          checked={accountType === 'seller'}
          onChange={() => setAccountType('seller')}
          className="h-4 w-4 text-amber-500 focus:ring-amber-400"
        />
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">Seller account</span>
          <p className="text-gray-500 dark:text-gray-400">Create products and manage your seller portal.</p>
        </div>
      </label>
    </div>
    {accountType === 'seller' && (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-950/30 p-4 text-sm text-amber-700 dark:text-amber-100">
        Seller accounts require admin approval before your listings appear in the marketplace.
      </div>
    )}
  </>
)}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Email Address"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-500 transition-colors">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="Password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-amber-500/25 transition-all duration-300 transform active:scale-95"
            >
              {isLogin ? 'Authenticate' : 'Forge Account'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <span className="border-b border-gray-300 dark:border-gray-700 w-1/5 lg:w-1/4"></span>
            <span className="text-xs text-center text-gray-500 dark:text-gray-400 uppercase tracking-widest">Or connect with</span>
            <span className="border-b border-gray-300 dark:border-gray-700 w-1/5 lg:w-1/4"></span>
          </div>

          <button
            onClick={handleGoogleAuth}
            className="mt-6 w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faGoogle} className="text-amber-500" />
            Google
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an anchor?" : "Already anchored?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-amber-600 hover:text-amber-500 transition-colors focus:outline-none"
            >
              {isLogin ? 'Create one here.' : 'Login here.'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}