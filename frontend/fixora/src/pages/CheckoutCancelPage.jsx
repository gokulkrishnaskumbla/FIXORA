import React from "react";
import { useNavigate } from "react-router-dom";

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 to-base-300 flex items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
        {/* Cancel Header */}
        <div className="bg-linear-to-r from-warning to-warning/80 p-8 text-center text-white">
          <div className="mb-4">
            <svg
              className="mx-auto h-24 w-24"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-xl opacity-90">
            No charges were made to your account
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <svg
                className="h-6 w-6 text-warning mt-1 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-base-content mb-2">
                  What happened?
                </h3>
                <p className="text-base-content/70">
                  You cancelled the payment process. Your cart items are still
                  saved and ready for checkout whenever you're ready to complete
                  your purchase.
                </p>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-base-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="h-5 w-5 text-primary"
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
                <h4 className="font-semibold text-base-content">
                  Secure Payment
                </h4>
              </div>
              <p className="text-sm text-base-content/70">
                Your payment information is always secure with our encrypted
                checkout process.
              </p>
            </div>

            <div className="bg-base-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <h4 className="font-semibold text-base-content">
                  Cart Saved
                </h4>
              </div>
              <p className="text-sm text-base-content/70">
                Your items are still in your cart. You can continue shopping or
                complete your purchase later.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/cart")}
              className="btn btn-primary btn-lg w-full text-lg"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Return to Cart
            </button>
            <button
              onClick={() => navigate("/services")}
              className="btn btn-outline btn-lg w-full text-lg"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Continue Shopping
            </button>
            <button
              onClick={() => navigate("/")}
              className="btn btn-ghost w-full"
            >
              Go to Home
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-base-300 text-center">
            <p className="text-sm text-base-content/60 mb-2">
              Need assistance with your order?
            </p>
            <p className="text-sm text-base-content/60">
              Contact our support team - we're here to help!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

