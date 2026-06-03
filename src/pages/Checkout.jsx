import { useState, useEffect } from 'react'; // <-- Make sure useEffect is imported
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faCircleNotch, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Checkout() {
  const [error, setError] = useState('');
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Address State
  const [shippingDetails, setShippingDetails] = useState({
    name: '', address: '', city: '', pin: ''
  });

  // --- NEW: Safely handle unauthenticated users ---
  useEffect(() => {
    if (!currentUser) {
      const timer = setTimeout(() => {
        navigate('/auth');
      }, 4000); // Redirects after 4 seconds
      return () => clearTimeout(timer); // Cleanup
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <FontAwesomeIcon icon={faCircleNotch} spin size="3x" className="mb-6 text-amber-500" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-red-500 font-medium">
          You must be logged in to access the checkout.
        </p>
        <p className="text-gray-500 mt-2">
          Redirecting to Authentication Chamber...
        </p>
      </div>
    );
  }
  // ------------------------------------------------

  const parsePrice = (priceString) => {
    const num = parseFloat(String(priceString).replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  };
  
  const subtotal = cart.reduce((total, item) => total + (parsePrice(item.price) * item.quantity), 0);
  const orderTotal = subtotal + 50; 

  const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
  };

  const displayRazorpay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
        setError("Razorpay SDK failed to load. Check your connection.");
        setIsProcessing(false);
        return;
    }

    try {
        const data = await fetch("https://vortex-api-6wk1.onrender.com/api/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: orderTotal }),
        }).then((t) => t.json());

        const options = {
            key: "rzp_test_SdrKz0YdTAD6LG", 
            amount: data.amount,
            currency: data.currency,
            name: "The Vortex Archives",
            description: "Artifact Exchange Transaction",
            order_id: data.id, 
            handler: async function (response) {
                try {
                    setIsProcessing(true); 

                    const verifyRes = await fetch("https://vortex-api-6wk1.onrender.com/api/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.verified) {
                        if (currentUser) {
                            await addDoc(collection(db, "orders"), {
                                userId: currentUser.uid,
                                items: cart,
                                totalAmount: orderTotal,
                                shippingInfo: shippingDetails,
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                status: "Paid", 
                                createdAt: serverTimestamp()
                            });
                        }

                        setIsProcessing(false);
                        setIsSuccess(true);
                        clearCart(); 
                        
                        setTimeout(() => {
                            navigate('/orders');
                        }, 3000);
                    } else {
                        setError("Payment verification failed. Please contact support.");
                        setIsProcessing(false);
                    }

                } catch (error) {
                    console.error("Failed to verify or log order", error);
                    setIsProcessing(false);
                }
            },
            prefill: {
                name: shippingDetails.name,
                email: currentUser ? currentUser.email : "",
                contact: "9999999999", 
            },
            theme: {
                color: "#d97706", 
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

        paymentObject.on('payment.failed', function (response) {
            setError("Payment failed or cancelled.");

            // comment the line below before deployment, it's only for debugging purposes
            console.log(response.error); 
            setIsProcessing(false);
        });

    } catch (error) {
        console.error("Payment initiation failed", error);
        setIsProcessing(false);
    }
  };

  
  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">You cannot checkout an empty void.</p>
        <Link to="/" className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-bold transition-colors hover:underline">
          Return to Archives
        </Link>
      </div>
    );
  }


  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <FontAwesomeIcon icon={faCheckCircle} className="text-7xl text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]" />
        {/* Changed text-white to text-gray-900 dark:text-white */}
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Transaction Complete
        </h2>
        {/* Changed text-gray-400 to text-gray-600 dark:text-gray-400 */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          Payment secured via Razorpay. Your items are manifesting in your realm shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cart" className="text-gray-500 hover:text-amber-500 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Column: Form */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
          <form onSubmit={displayRazorpay} className="space-y-6">
            
            {/* Shipping Details */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Manifestation Coordinates (Shipping)</h3>
              <div className="space-y-4">
                <input required type="text" placeholder="Full Name" onChange={e => setShippingDetails({...shippingDetails, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <input required type="text" placeholder="Street Address" onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" placeholder="City" onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <input required type="text" placeholder="Postal Code" onChange={e => setShippingDetails({...shippingDetails, pin: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 my-6"></div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Secure Payment</h3>
              <FontAwesomeIcon icon={faShieldAlt} className="text-amber-500" />
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all duration-300 flex justify-center items-center gap-3
                ${isProcessing ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25 active:scale-95'}`}
            >
              {isProcessing ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} spin /> Securing Connection...
                </>
              ) : (
                `Pay ₹${Math.round(orderTotal).toLocaleString('en-IN')} via Razorpay`
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Recaps (Unchanged from before) */}
        <div className="hidden md:block">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 sticky top-24">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Order Summary</h3>
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">{item.quantity}x</span>
                    <span className="text-gray-900 dark:text-gray-200 truncate max-w-[150px]">{item.name}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{item.price}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between items-center">
               <span className="text-gray-900 dark:text-gray-200 font-bold">Total</span>
               <span className="text-xl font-extrabold text-amber-600 dark:text-amber-500">₹{Math.round(orderTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}