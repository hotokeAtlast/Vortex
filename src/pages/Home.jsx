import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where('approved', '==', true),
          orderBy("price", "desc")
        );

        const querySnapshot = await getDocs(q);
        const productsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching artifacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-amber-500">
        <FontAwesomeIcon icon={faCircleNotch} spin size="3x" className="mb-4" />
        <p className="text-gray-400 animate-pulse">Syncing with the archives...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 drop-shadow-sm">
          The <span className="text-amber-500">Vortex</span> Archives
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover rare artifacts, mystical charms, and high-performance technology forged across different epochs.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <FontAwesomeIcon icon={faBoxOpen} className="text-6xl text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The archives are empty.</h2>
          <p className="text-gray-500 mt-2">Visit The Forge to add new artifacts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-amber-900/20 transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-64 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No Image Formed
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                  {product.tag}
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-amber-500 transition-colors">
                    {product.name}
                  </h3>
                </div>
                {product.sequence && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                    {product.sequence}
                  </p>
                )}
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-500">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}