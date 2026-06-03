import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { db } from "../config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBars,
  faTimes,
  faSun,
  faMoon,
  faShoppingCart,
  faUser,
  faSignOutAlt,
  faBox,
} from "@fortawesome/free-solid-svg-icons";

// --- NEW REUSABLE SEARCH COMPONENT ---
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all products for the search index
  useEffect(() => {
    const fetchProducts = async () => {
      const approvedProductsQuery = query(
        collection(db, "products"),
        where('approved', '==', true)
      );
      const querySnapshot = await getDocs(approvedProductsQuery);
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllProducts(productsList);
    };
    fetchProducts();
  }, []);

  // Filter logic
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([]);
      setIsOpen(false);
    } else {
      const results = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredResults(results.slice(0, 5)); // Show max 5 results
      setIsOpen(true);
    }
  }, [searchTerm, allProducts]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (id) => {
    setIsOpen(false);
    setSearchTerm("");
    navigate(`/product/${id}`);
  };

  return (
    <div className="relative w-full group" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchTerm && setIsOpen(true)}
        placeholder="Search the archives..."
        className="w-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-full pl-10 pr-4 py-2.5 border border-transparent dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner"
      />
      <button className="absolute left-4 top-3 text-gray-400 group-focus-within:text-amber-500 transition-colors">
        <FontAwesomeIcon icon={faSearch} />
      </button>

      {/* The Live Dropdown Box */}
      {/* The Live Dropdown Box */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          {filteredResults.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto custom-scrollbar py-2">
              {filteredResults.map((product, index) => (
                // Added a staggered fade-in based on index so they cascade down
                <li
                  key={product.id}
                  className="animate-in fade-in slide-in-from-right-4 fill-mode-both"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <button
                    onClick={() => handleSelect(product.id)}
                    className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-4 transition-all duration-300 group"
                  >
                    {/* Image Container with hover scale */}
                    <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faBox}
                            className="text-gray-400 text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* Text Container with slide-right on hover */}
                    <div className="flex-1 transform group-hover:translate-x-2 transition-transform duration-300">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 font-medium mt-0.5">
                        {product.price}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 animate-in fade-in duration-300">
              The mist reveals nothing matching your query.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// --- END SEARCH COMPONENT ---

export default function Navbar({ toggleTheme, theme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userProfile, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-950 shadow-md dark:shadow-gray-800/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link
              to="/"
              onClick={closeMenu}
              className="text-2xl font-bold tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
            >
              VORTEX
            </Link>
          </div>

          <div className="flex-1 max-w-2xl px-4 hidden sm:block">
            <SearchBar />
          </div>

          <div className="relative flex items-center gap-4">
            {/* Desktop Cart Icon (Optional, outside dropdown) */}
            <Link
              to="/cart"
              className="hidden sm:flex relative text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors"
            >
              <FontAwesomeIcon icon={faShoppingCart} size="lg" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-all"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-12 mt-3 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-2xl py-2 border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 fade-in duration-200 z-50">
                {/* User Greeting if Logged In */}
                {currentUser && (
                  <div className="px-5 py-2 mb-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500">Anchored as:</p>
                    {/* Prioritize displayName, fallback to email if none exists */}
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {currentUser.displayName || currentUser.email}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    toggleTheme();
                    closeMenu();
                  }}
                  className="w-full text-left px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center transition-colors"
                >
                  Theme
                  <FontAwesomeIcon
                    icon={theme === "dark" ? faSun : faMoon}
                    className="text-amber-500"
                  />
                </button>

                {currentUser && (
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center transition-colors"
                  >
                    Account{" "}
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </Link>
                )}

                {currentUser && (
                  <Link
                    to="/orders"
                    onClick={closeMenu}
                    className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center transition-colors"
                  >
                    Orders
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBox} className="text-gray-400" />
                    </span>
                  </Link>
                )}

                {currentUser && userProfile?.role === 'seller' && (
                  <Link
                    to="/seller"
                    onClick={closeMenu}
                    className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center transition-colors"
                  >
                    Seller Portal
                    <span className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBox} className="text-amber-500" />
                    </span>
                  </Link>
                )}

                <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>

                {/* Dynamic Auth Button */}
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex justify-between items-center"
                  >
                    Disengage <FontAwesomeIcon icon={faSignOutAlt} />
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    onClick={closeMenu}
                    className="block w-full text-left px-5 py-3 text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                  >
                    Authenticate
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navbar (Search + Cart) */}
      <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 flex items-center gap-4">
        <div className="flex-1">
          <SearchBar />
        </div>

        <Link
          to="/cart"
          className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm"
        >
          <FontAwesomeIcon icon={faShoppingCart} size="lg" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile Sub-Navbar (Search + Cart) */}
      {/* <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 py-3 flex items-center gap-4">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
          <button className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-amber-500 hover:text-amber-400">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <Link
          to="/cart"
          className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-amber-500 transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm"
        >
          <FontAwesomeIcon icon={faShoppingCart} size="lg" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
              {cartCount}
            </span>
          )}
        </Link>
      </div> */}
    </nav>
  );
}
