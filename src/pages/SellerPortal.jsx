import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faTrash,
  faUpload,
  faCircleNotch,
  faEdit,
  faTimes,
  faBox,
} from '@fortawesome/free-solid-svg-icons';

export default function SellerPortal() {
  const { currentUser, userProfile } = useAuth();
  const isSeller = userProfile?.role === 'seller';
  const isSellerActive = isSeller && userProfile?.sellerStatus === 'active';
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    price: '',
    tag: '',
    description: '',
    stock: 1,
  });
  const [specs, setSpecs] = useState([{ label: '', value: '' }]);
  const [imageUpload, setImageUpload] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [note, setNote] = useState([]);

  useEffect(() => {
    if (currentUser && isSellerActive) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [currentUser, isSellerActive]);

  const fetchProducts = async () => {
    setLoading(true);
    const productsQuery = query(
      collection(db, 'products'),
      where('sellerId', '==', currentUser.uid)
    );
    const querySnapshot = await getDocs(productsQuery);
    setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const addSpecRow = () => setSpecs([...specs, { label: '', value: '' }]);
  const removeSpecRow = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const resetForm = () => {
    setProduct({ name: '', price: '', tag: '', description: '', stock: 1 });
    setSpecs([{ label: '', value: '' }]);
    setImageUpload(null);
    setExistingImageUrl('');
    setIsEditing(false);
    setEditId(null);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setProduct({
      name: item.name || '',
      price: item.price || '',
      tag: item.tag || '',
      description: item.description || '',
      stock: item.stock || 1,
    });
    setSpecs(item.specs && item.specs.length ? item.specs : [{ label: '', value: '' }]);
    setExistingImageUrl(item.imageUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this listing from your seller catalog?')) {
      await deleteDoc(doc(db, 'products', id));
      fetchProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = existingImageUrl;

      if (imageUpload) {
        const formData = new FormData();
        formData.append('file', imageUpload);
        formData.append('upload_preset', 'vortex_artifacts');
        formData.append('cloud_name', 'dp4op4jg1');

        const response = await fetch('https://api.cloudinary.com/v1_1/dp4op4jg1/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        imageUrl = data.secure_url;
      }

      const cleanedSpecs = specs.filter((spec) => spec.label && spec.value);

      const productData = {
        ...product,
        stock: Number(product.stock),
        specs: cleanedSpecs,
        imageUrl,
        sellerId: currentUser.uid,
        sellerEmail: currentUser.email,
        sellerName: currentUser.displayName || currentUser.email,
        approved: false,
        rejected: false,
        status: 'pending',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      if (isEditing) {
        const productRef = doc(db, 'products', editId);
        await updateDoc(productRef, productData);
        setNote((prev) => [...prev, `Updated ${productData.name}`]);
      } else {
        await addDoc(collection(db, 'products'), productData);
        setNote((prev) => [...prev, `Created ${productData.name}`]);
      }

      resetForm();
      fetchProducts();
      setTimeout(() => setNote([]), 5000);
    } catch (error) {
      console.error(error);
      setNote((prev) => [...prev, `Error: ${error.message}`]);
      setTimeout(() => setNote([]), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        <p>You must sign in to access the seller portal.</p>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 px-4">
        <div className="max-w-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Seller access required</h2>
          <p className="text-gray-500 dark:text-gray-400">Only users registered as sellers can access this portal. Register with a seller account to manage listings.</p>
        </div>
      </div>
    );
  }
  if (!isSellerActive) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-2xl rounded-3xl border border-amber-300 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-950/20 p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Seller onboarding pending</h2>
          <p className="text-gray-600 dark:text-amber-100 mb-4">
            Your seller application is under review. Once approved by the admin, your listings will be visible and you can manage your catalog from this portal.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you believe this is a mistake, contact the admin or try again later.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-6 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Seller Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your catalog, inventory, and listing details from one place.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Your products</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
          </div>
          <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-400">Seller</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{currentUser.displayName || 'Unnamed'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 mb-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New listing</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add or update your seller product details below.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isEditing && (
              <button type="button" onClick={resetForm} className="rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
              </button>
            )}
            <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-500 transition-colors">
              <FontAwesomeIcon icon={faPlus} /> {isEditing ? 'Update listing' : 'Create listing'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 mt-8 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Listing Image</label>
            <label className="flex flex-col items-center justify-center h-40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 text-gray-500 dark:text-gray-400 cursor-pointer overflow-hidden transition-colors hover:border-amber-400">
              {existingImageUrl && !imageUpload ? (
                <img src={existingImageUrl} alt="Current" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3">
                  <FontAwesomeIcon icon={faUpload} size="lg" />
                  <p>{imageUpload ? imageUpload.name : 'Click to upload an image'}</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={(e) => setImageUpload(e.target.files[0])} />
            </label>
          </div>

          <div className="space-y-5">
            <input required value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} placeholder="Product name" className="w-full rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
            <input required value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} placeholder="Price (e.g. 149 Credits)" className="w-full rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
            <div className="grid grid-cols-2 gap-4">
              <input required value={product.tag} onChange={(e) => setProduct({ ...product, tag: e.target.value })} placeholder="Category / Tag" className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              <input required type="number" min="0" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} placeholder="Stock" className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
            </div>
            <textarea required value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows="4" placeholder="Description" className="w-full rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Specs & Attributes</h3>
            <button type="button" onClick={addSpecRow} className="inline-flex items-center gap-2 rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
              <FontAwesomeIcon icon={faPlus} /> Add spec
            </button>
          </div>
          {specs.map((spec, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-4">
              <input value={spec.label} onChange={(e) => handleSpecChange(index, 'label', e.target.value)} placeholder="Attribute" className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              <input value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} placeholder="Value" className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" />
              <button type="button" onClick={() => removeSpecRow(index)} className="rounded-full bg-red-50 text-red-600 px-3 py-2 text-sm hover:bg-red-100 transition-colors">
                Remove
              </button>
            </div>
          ))}
        </div>
      </form>

      {note.length > 0 && (
        <div className="mb-6 space-y-3">
          {note.map((message, index) => (
            <div key={index} className="rounded-3xl border border-amber-300/40 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-100">
              {message}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your listings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Only your seller products appear here.</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-amber-600">
              <FontAwesomeIcon icon={faCircleNotch} spin /> Loading
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {products.length === 0 && !loading ? (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-10 text-center text-gray-500 dark:text-gray-400">
              You don't have any published listings yet. Create one above to appear in the marketplace.
            </div>
          ) : (
            products.map((item) => (
              <div key={item.id} className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                <div className="h-52 overflow-hidden bg-gray-100 dark:bg-gray-950">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.tag || 'Uncategorized'}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{item.stock} in stock</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {item.specs?.map((spec, index) => (
                      <span key={index} className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
                        {spec.label}: {spec.value}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button type="button" onClick={() => handleEdit(item)} className="inline-flex items-center gap-2 rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
