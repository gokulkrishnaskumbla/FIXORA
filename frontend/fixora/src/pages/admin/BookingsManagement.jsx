import React, { useEffect, useState } from 'react';
import { getAllBookings, cancelBookingAdmin } from '../../assistance/adminAssistance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBookingAdmin(bookingId);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      cancelled: 'badge-error',
      completed: 'badge-info',
    };
    return <span className={`badge ${statusConfig[status] || 'badge-ghost'}`}>{status}</span>;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: 'badge-warning',
      paid: 'badge-success',
      failed: 'badge-error',
      refunded: 'badge-info',
    };
    return (
      <span className={`badge badge-sm ${statusConfig[paymentStatus] || 'badge-ghost'}`}>
        {paymentStatus}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer position="top-right" />
      <h1 className="text-4xl font-bold mb-8 text-base-content">Bookings Management</h1>

      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Service</th>
              <th>Booking Date</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>
                  <div>
                    <div className="font-bold">{booking.user?.name || 'N/A'}</div>
                    <div className="text-sm opacity-50">{booking.user?.email || 'N/A'}</div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    {booking.service?.image && (
                      <img
                        src={booking.service.image}
                        alt={booking.service.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{booking.service?.title || 'N/A'}</div>
                      <div className="text-sm opacity-50">₹{booking.service?.price || '0'}</div>
                    </div>
                  </div>
                </td>
                <td>{formatDate(booking.bookingDate)}</td>
                <td className="font-bold text-primary">₹{booking.totalAmount?.toFixed(2)}</td>
                <td className="capitalize">{booking.paymentMethod}</td>
                <td>{getStatusBadge(booking.status)}</td>
                <td>{getPaymentStatusBadge(booking.paymentStatus)}</td>
                <td>
                  {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn btn-sm btn-error"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-12 text-base-content/70">
            No bookings found
          </div>
        )}
      </div>
    </div>
  );
}



