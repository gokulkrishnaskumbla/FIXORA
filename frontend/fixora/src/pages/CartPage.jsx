import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartCard from "../components/CartCard";
import { getCartItems, removeFromCart, clearCart } from "../assistance/userAssistance";

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const res = await getCartItems();
      setCart(res.data.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to view your cart");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.error || "Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (serviceId) => {
    try {
      setRemovingId(serviceId);
      const res = await removeFromCart(serviceId);
      setCart(res.data.cart);
      toast.success("Service removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error(error.response?.data?.error || "Failed to remove service");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) {
      return;
    }

    try {
      setClearing(true);
      const res = await clearCart();
      setCart(res.data.cart);
      toast.success("Cart cleared successfully");
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error(error.response?.data?.error || "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.services.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const services = cart?.services || [];
  const totalPrice = cart?.totalPrice || 0;

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <ToastContainer position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-2">Shopping Cart</h1>
          <p className="text-base-content/70">
            {services.length} {services.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {services.length === 0 ? (
          /* Empty Cart */
          <div className="bg-base-100 rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-24 w-24 text-base-content/30 mb-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-base-content mb-4">
                Your cart is empty
              </h2>
              <p className="text-base-content/70 mb-8">
                Looks like you haven't added any services to your cart yet.
              </p>
              <button
                onClick={() => navigate("/services")}
                className="btn btn-primary btn-lg"
              >
                Browse Services
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClearCart}
                  disabled={clearing}
                  className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                >
                  {clearing ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Clearing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Clear Cart
                    </>
                  )}
                </button>
              </div>

              {/* Service Cards */}
              {services.map((service, index) => (
                <CartCard
                  key={service.serviceId?._id || service.serviceId || index}
                  service={service}
                  onRemove={handleRemove}
                  loading={removingId === (service.serviceId?._id || service.serviceId)}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-base-100 rounded-2xl shadow-lg p-6 sticky top-4">
                <h2 className="text-2xl font-bold text-base-content mb-6">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-base-content/70">
                    <span>Subtotal ({services.length} items)</span>
                    <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Tax</span>
                    <span className="font-medium">₹0.00</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between text-lg font-bold text-base-content">
                    <span>Total</span>
                    <span className="text-primary">₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary btn-block btn-lg mb-4"
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate("/services")}
                  className="btn btn-outline btn-block"
                >
                  Continue Shopping
                </button>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-base-300">
                  <div className="flex items-center gap-2 text-sm text-base-content/60">
                    <svg
                      className="h-5 w-5 text-success"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
