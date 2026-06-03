import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faMinus,
  faLock,
  faPlus,
  faArrowLeft,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // If user is not logged in, show empty state with prompt to log in

  const [showAuthAlert, setShowAuthAlert] = useState(false);

  // The fixed checkout function
  const verifyAndCheckout = () => {
    if (!currentUser) {
      setShowAuthAlert(true);

      // Auto-hide the alert after 3 seconds so it doesn't get annoying
      setTimeout(() => setShowAuthAlert(false), 3000);
      return;
    }

    navigate("/checkout");
  };

  // A quick helper to extract numbers from your string prices (e.g., "150 Pounds" -> 150)
  const parsePrice = (priceString) => {
    const num = parseFloat(priceString.replace(/[^\d.-]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const subtotal = cart.reduce(
    (total, item) => total + parsePrice(item.price) * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 50 : 0; // Flat dummy shipping fee
  const orderTotal = subtotal + shipping;

  // Render Empty State
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
        <FontAwesomeIcon
          icon={faBoxOpen}
          className="text-6xl text-gray-300 dark:text-gray-700 mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your archives are empty.
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The gray mist holds no items for you yet.
        </p>
        <Link
          to="/"
          className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all hover:-translate-y-1"
        >
          Explore the Vortex
        </Link>
      </div>
    );
  }

  // Render Populated Cart
  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="text-gray-500 hover:text-amber-500 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </Link>
        <h1 className="text-3xl font-extrabold font-sans text-gray-900 dark:text-white tracking-tight">
          Your Cart
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              // FIX 1: Changed to flex-row on mobile so it looks like a proper list, added font-sans to lock typography
              className="flex flex-row items-center gap-4 p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-sm mb-4 font-sans"
            >
              {/* Image Placeholder */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/50">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                      No Visage
                    </span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col flex-grow min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                  <a href={`./product/${item.id}`}>{item.name}</a>
                </h3>
                <p className="text-amber-600 dark:text-amber-500 font-bold mt-0.5">
                  ₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN') : parsePrice(item.price).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                  {item.tag || "Artifact"}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-6">
                {/* Quantity */}
                <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-3 py-2 text-gray-500 hover:text-amber-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faMinus} size="sm" />
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-900 dark:text-white text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-3 py-2 text-gray-500 hover:text-amber-500 transition-colors"
                  >
                    <FontAwesomeIcon icon={faPlus} size="sm" />
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{Math.round(subtotal).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Dimensional Transit (Shipping)</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{shipping.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-500">
                ₹{Math.round(orderTotal).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* The Sleek Tailwind Alert */}
          {showAuthAlert && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <FontAwesomeIcon icon={faLock} className="text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                You must authenticate to proceed.
                <Link
                  to="/auth"
                  className="ml-1 underline hover:text-red-500 dark:hover:text-red-300"
                >
                  Login here.
                </Link>
              </p>
            </div>
          )}

          <button
            onClick={verifyAndCheckout}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-300 transform active:scale-95"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
