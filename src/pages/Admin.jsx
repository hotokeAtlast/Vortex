import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faCheck, faTimes, faUserShield } from '@fortawesome/free-solid-svg-icons';

export default function Admin() {
  const { currentUser, userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin' || currentUser?.email === 'hotoke.atlast@gmail.com';
  const [loading, setLoading] = useState(true);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchModeration();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchModeration = async () => {
    setLoading(true);
    try {
      const sellerQuery = query(
        collection(db, 'users'),
        where('role', '==', 'seller'),
        where('sellerStatus', '==', 'pending')
      );
      const productQuery = query(collection(db, 'products'), where('approved', '==', false));
      const activeProductQuery = query(
        collection(db, 'products'),
        where('approved', '==', true),
        orderBy('updatedAt', 'desc')
      );

      const [sellerSnap, productSnap, activeSnap] = await Promise.all([
        getDocs(sellerQuery),
        getDocs(productQuery),
        getDocs(activeProductQuery),
      ]);

      setPendingSellers(sellerSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPendingProducts(productSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setActiveProducts(activeSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading moderation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const notify = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 5000);
  };

  const updateSellerStatus = async (userId, status) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { sellerStatus: status });
    notify(`Seller account ${status === 'active' ? 'approved' : 'rejected'}.`);
    fetchModeration();
  };

  const updateProductApproval = async (productId, approved) => {
    const productRef = doc(db, 'products', productId);
    await updateDoc(productRef, {
      approved,
      rejected: !approved,
      status: approved ? 'approved' : 'rejected',
      reviewedAt: new Date().toISOString(),
    });
    notify(`Product ${approved ? 'approved' : 'rejected'}.`);
    fetchModeration();
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently?')) return;
    await deleteDoc(doc(db, 'products', productId));
    notify('Product deleted.');
    fetchModeration();
  };

  if (!currentUser || !isAdmin) {
    return (
      <div className="text-center mt-20 text-red-500 font-bold">Access Denied. You are not the admin.</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Moderation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Review seller applications and approve marketplace listings.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Pending Sellers</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingSellers.length}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Review Queue</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingProducts.length}</p>
          </div>
          <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Active Listings</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeProducts.length}</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-950/20 p-4 text-sm text-emerald-900 dark:text-emerald-100">
          {message}
        </div>
      )}

      <div className="space-y-10">
        <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seller Applications</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approve or reject new seller requests.</p>
            </div>
            {loading && (
              <div className="inline-flex items-center gap-2 text-amber-600">
                <FontAwesomeIcon icon={faCircleNotch} spin /> Loading
              </div>
            )}
          </div>

          {pendingSellers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
              No seller applications are waiting at the moment.
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingSellers.map((seller) => (
                <div key={seller.id} className="rounded-3xl border border-gray-200 dark:border-gray-800 p-5 bg-gray-50 dark:bg-gray-950">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{seller.displayName || seller.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{seller.email}</p>
                      <p className="text-xs uppercase tracking-[0.2em] mt-2 text-amber-600 dark:text-amber-400">Requested seller access</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => updateSellerStatus(seller.id, 'active')} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
                        <FontAwesomeIcon icon={faCheck} className="mr-2" /> Approve
                      </button>
                      <button onClick={() => updateSellerStatus(seller.id, 'rejected')} className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Review Queue</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approve or reject new seller listings before they appear publicly.</p>
            </div>
          </div>

          {pendingProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 dark:text-gray-400">
              No product submissions are waiting for review.
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingProducts.map((product) => (
                <div key={product.id} className="grid gap-4 lg:grid-cols-[1fr_auto] rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-5">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-500">No image</div>}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.tag || 'Uncategorized'} • {product.price}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{product.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Seller: {product.sellerName || product.sellerEmail}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-start sm:items-end">
                    <div className="rounded-full bg-purple-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">Pending review</div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateProductApproval(product.id, true)} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
                        <FontAwesomeIcon icon={faCheck} className="mr-2" /> Approve
                      </button>
                      <button onClick={() => updateProductApproval(product.id, false)} className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" /> Reject
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
