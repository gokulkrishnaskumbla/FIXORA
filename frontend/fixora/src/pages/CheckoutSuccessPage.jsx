import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verifyPayment } from "../assistance/userAssistance";

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    // Handle double slash in URL by normalizing
    const currentPath = window.location.pathname;
    if (currentPath.includes("//")) {
      const normalizedPath = currentPath.replace(/\/+/g, "/");
      window.history.replaceState({}, "", normalizedPath + window.location.search);
    }

    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      verifyPaymentStatus(sessionId);
    } else {
      toast.error("Invalid session");
      setTimeout(() => navigate("/cart"), 2000);
    }
  }, [searchParams]);

  const verifyPaymentStatus = async (sessionId) => {
    const maxAttempts = 6; // retry a few times to allow Stripe to settle
    let attempt = 0;
    let lastError = null;

    try {
      while (attempt < maxAttempts) {
        attempt += 1;
        try {
          const response = await verifyPayment(sessionId);

          if (response?.data?.success) {
            setVerified(true);
            setBookingDetails(response.data);
            toast.success("Payment successful! Your bookings have been confirmed.");
            lastError = null;
            break;
          }

          // If backend returned payment_status info, and it's not paid, wait and retry
          const paymentStatus = response?.data?.payment_status || response?.data?.paymentStatus;
          if (paymentStatus && paymentStatus !== "paid") {
            lastError = response?.data?.error || `Payment status: ${paymentStatus}`;
            // wait before retrying
            await new Promise((r) => setTimeout(r, 1500 * attempt));
            continue;
          }

          // If backend responded without success and without payment_status, treat as final
          lastError = response?.data?.error || "Payment verification failed";
          break;
        } catch (err) {
          // network / server error - retry a couple times
          console.error("Verification attempt error:", err?.response?.data || err.message || err);
          lastError = err?.response?.data?.error || err.message || "Verification failed";
          // if server error (5xx) retry after short wait
          const status = err?.response?.status;
          if (status && status >= 500 && attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1500 * attempt));
            continue;
          }
          break;
        }
      }

      if (!verified && lastError) {
        toast.error(lastError || "Failed to verify payment");
        setTimeout(() => navigate("/cart"), 3000);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 to-base-300 flex items-center justify-center py-12 px-4">
      <ToastContainer position="top-right" />
      <div className="max-w-3xl w-full">
        {verifying ? (
          <div className="bg-base-100 rounded-2xl shadow-2xl p-12 text-center">
            <div className="flex flex-col items-center">
              <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
              <h2 className="text-3xl font-bold text-base-content mb-2">
                Verifying Payment...
              </h2>
              <p className="text-base-content/70 text-lg">
                Please wait while we confirm your payment
              </p>
              <div className="mt-6 w-full max-w-xs">
                <progress className="progress progress-primary w-full"></progress>
              </div>
            </div>
          </div>
        ) : verified ? (
          <div className="bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
            {/* Success Header */}
            <div className="bg-linear-to-r from-success to-success/80 p-8 text-center text-white">
              <div className="mb-4 animate-bounce">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
              <p className="text-xl opacity-90">
                Thank you for your purchase
              </p>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="bg-success/10 border border-success/20 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="h-6 w-6 text-success"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-base-content">
                    Your bookings have been confirmed
                  </h3>
                </div>
                <p className="text-base-content/70">
                  {bookingDetails?.bookings?.length > 0
                    ? `You have successfully booked ${bookingDetails.bookings.length} service${bookingDetails.bookings.length > 1 ? "s" : ""}. A confirmation email has been sent to your registered email address.`
                    : "Your booking has been confirmed. A confirmation email has been sent to your registered email address."}
                </p>
              </div>

              {/* Booking Summary */}
              {bookingDetails?.bookings && bookingDetails.bookings.length > 0 && (
                <div className="bg-base-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-base-content">
                    Booking Summary
                  </h3>
                  <div className="space-y-3">
                    {bookingDetails.bookings.map((booking, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-base-100 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-base-content">
                            Booking #{index + 1}
                          </p>
                          <p className="text-sm text-base-content/70">
                            Status: <span className="text-success font-medium">Confirmed</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            ₹{booking.totalAmount?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/bookings")}
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  View My Bookings
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
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  Continue Shopping
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t border-base-300 text-center">
                <p className="text-sm text-base-content/60">
                  Need help? Contact our support team
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-base-100 rounded-2xl shadow-2xl p-12 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-error"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-error mb-4">
              Payment Verification Failed
            </h2>
            <p className="text-lg text-base-content/70 mb-8">
              We couldn't verify your payment. Please contact support if you
              were charged. Your payment may still be processing.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/cart")}
                className="btn btn-primary btn-lg w-full"
              >
                Return to Cart
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn btn-ghost w-full"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

