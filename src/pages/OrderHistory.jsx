import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBox,
  faClock,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

export default function OrderHistory() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const orderStats = {
    total: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    lastOrder: orders[0]?.createdAt,
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid),
          // Note: To use orderBy with 'where', Firebase requires a composite index.
          // If you get an error in the console, click the link Firebase provides to auto-create the index.
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort locally to avoid needing immediate Firebase Indexing
        fetchedOrders.sort(
          (a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis(),
        );

        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">You must be anchored to view past transactions.</p>
        <Link to="/auth" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-amber-500">
        <FontAwesomeIcon icon={faClock} spin size="3x" className="mr-4" />
        <p className="text-lg font-medium animate-pulse">Consulting the archives...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
          Order History
        </h1>
        {orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{orderStats.total}</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">₹{Math.round(orderStats.totalSpent).toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">Last Order</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(orderStats.lastOrder)}</p>
            </div>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
          <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-300 dark:text-gray-700 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">You have made no exchanges with the Vortex yet.</p>
          <Link to="/" className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all">
            Explore Artifacts
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
            >
              <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Order ID • Placed
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-300">
                      {order.id.substring(0, 12)}...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                      order.status === "Paid"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={order.status === "Paid" ? faCheckCircle : faClock}
                    />
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {item.quantity}x
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">
                    Total Exchanged
                  </span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-500">
                    ₹{Math.round(order.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
