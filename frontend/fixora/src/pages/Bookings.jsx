import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getClientRequests, cancelServiceRequest, confirmServiceCompletion, getUserBookings, cancelBooking, completeLegacyBooking } from "../assistance/userAssistance";

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Fetch both service-requests and legacy bookings and merge
      const [reqRes, bookRes] = await Promise.allSettled([getClientRequests(), getUserBookings()]);

      const requests = reqRes.status === "fulfilled" && reqRes.value.data?.success ? (reqRes.value.data.requests || []) : [];
      const bookingsLegacy = bookRes.status === "fulfilled" && bookRes.value.data?.success ? (bookRes.value.data.bookings || []) : [];

      // Normalize service requests into booking-like shape
      const normalizedRequests = requests.map((r) => ({
        _id: r._id,
        service: r.service,
        status: r.status,
        paymentStatus: r.paymentStatus,
        totalAmount: r.totalAmount,
        bookingDate: r.preferredDate || r.requestDate || r.createdAt,
        createdAt: r.createdAt,
        paymentMethod: r.paymentMethod || "online",
        isServiceRequest: true,
        raw: r,
      }));

      const normalizedBookings = bookingsLegacy.map((b) => ({
        _id: b._id,
        service: b.service,
        status: b.status,
        paymentStatus: b.paymentStatus,
        totalAmount: b.totalAmount,
        bookingDate: b.bookingDate,
        createdAt: b.createdAt,
        paymentMethod: b.paymentMethod || "online",
        isServiceRequest: false,
        raw: b,
      }));

      // Merge by id (prefer serviceRequest when ids overlap)
      const merged = [...normalizedRequests];
      const existingIds = new Set(merged.map((i) => i._id));
      for (const nb of normalizedBookings) {
        if (!existingIds.has(nb._id)) merged.push(nb);
      }

      setBookings(merged);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to view your bookings");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to load bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setCancellingId(bookingId);
      let response;
      if (bookingId && bookings.find(b => b._id === bookingId && b.isServiceRequest)) {
        response = await cancelServiceRequest(bookingId);
      } else {
        response = await cancelBooking(bookingId);
      }
      if (response.data.success) {
        toast.success("Booking cancelled successfully");
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel booking"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirmCompletion = async (requestId) => {
    if (!window.confirm("Mark this service as completed?")) return;

    try {
      // determine if the id is a service-request or a legacy booking
      const item = bookings.find((b) => b._id === requestId);
      let res;
      if (item && item.isServiceRequest) {
        res = await confirmServiceCompletion(requestId);
      } else {
        // For legacy bookings (created via Booking model), call new endpoint
        res = await completeLegacyBooking(requestId);
      }

      if (res.data.success) {
        toast.success("Service marked as completed. Provider will be paid.");
        fetchBookings();
      }
    } catch (error) {
      console.error("Confirm completion error:", error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to confirm completion");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: "badge-warning", text: "Pending" },
      confirmed: { class: "badge-success", text: "Confirmed" },
      cancelled: { class: "badge-error", text: "Cancelled" },
      completed: { class: "badge-info", text: "Completed" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`badge ${config.class} badge-lg`}>{config.text}</span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { class: "badge-warning", text: "Payment Pending" },
      paid: { class: "badge-success", text: "Paid" },
      failed: { class: "badge-error", text: "Payment Failed" },
      refunded: { class: "badge-info", text: "Refunded" },
    };
    const config = statusConfig[paymentStatus] || statusConfig.pending;
    return (
      <span className={`badge ${config.class} badge-sm`}>{config.text}</span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBookingDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <ToastContainer position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-2">
            My Bookings
          </h1>
          <p className="text-base-content/70">
            {bookings.length === 0
              ? "You don't have any bookings yet"
              : `You have ${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}`}
          </p>
        </div>

        {bookings.length === 0 ? (
          /* Empty State */
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-base-content mb-4">
                No Bookings Yet
              </h2>
              <p className="text-base-content/70 mb-8">
                Start booking services to see them here.
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
          /* Bookings List */
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-base-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Service Image */}
                    {booking.service?.image && (
                      <div className="shrink-0">
                        <img
                          src={booking.service.image}
                          alt={booking.service.title || "Service"}
                          className="w-full md:w-48 h-48 object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-base-content mb-2">
                            {booking.service?.title || "Service"}
                          </h3>
                          {booking.service?.description && (
                            <p className="text-base-content/70 mb-3 line-clamp-2">
                              {booking.service.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(booking.status)}
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </div>
                      </div>

                      {/* Booking Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3">
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
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-base-content/60">
                              Booking Date
                            </p>
                            <p className="font-medium text-base-content">
                              {formatBookingDate(booking.bookingDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-base-content/60">
                              Amount
                            </p>
                            <p className="font-bold text-primary text-lg">
                              ₹{booking.totalAmount?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
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
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm text-base-content/60">
                              Payment Method
                            </p>
                            <p className="font-medium text-base-content capitalize">
                              {booking.paymentMethod}
                            </p>
                          </div>
                        </div>

                        {booking.service?.duration && (
                          <div className="flex items-center gap-3">
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <div>
                              <p className="text-sm text-base-content/60">
                                Duration
                              </p>
                              <p className="font-medium text-base-content">
                                {booking.service.duration}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Booking ID and Created Date */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60 pt-4 border-t border-base-300">
                        <span>Booking ID: {booking._id.slice(-8)}</span>
                        <span>•</span>
                        <span>Created: {formatDate(booking.createdAt)}</span>
                      </div>

                      {/* Action Buttons */}
                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              disabled={cancellingId === booking._id}
                              className="btn btn-error btn-sm"
                            >
                              {cancellingId === booking._id ? (
                                <>
                                  <span className="loading loading-spinner loading-sm"></span>
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="h-4 w-4 mr-2"
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
                                  Cancel Booking
                                </>
                              )}
                            </button>
                            {booking.paymentStatus === "paid" && (
                              <button
                                onClick={() => handleConfirmCompletion(booking._id)}
                                className="btn btn-success btn-sm"
                              >
                                Confirm Completion
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
