import React, { useEffect, useState } from 'react';
import { getAllReviews, deleteReviewAdmin } from '../../assistance/adminAssistance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, positive, negative

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getAllReviews();
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReviewAdmin(reviewId);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'positive') return review.rating >= 4;
    if (filter === 'negative') return review.rating <= 2;
    return true;
  });

  const stats = {
    total: reviews.length,
    positive: reviews.filter((r) => r.rating >= 4).length,
    negative: reviews.filter((r) => r.rating <= 2).length,
    average: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
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
      <h1 className="text-4xl font-bold mb-8 text-base-content">Reviews Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Total Reviews</div>
          <div className="stat-value text-primary">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Average Rating</div>
          <div className="stat-value text-success">{stats.average}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Positive (4+)</div>
          <div className="stat-value text-success">{stats.positive}</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Negative (≤2)</div>
          <div className="stat-value text-error">{stats.negative}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setFilter('positive')}
          className={`btn ${filter === 'positive' ? 'btn-primary' : 'btn-outline'}`}
        >
          Positive (4+)
        </button>
        <button
          onClick={() => setFilter('negative')}
          className={`btn ${filter === 'negative' ? 'btn-primary' : 'btn-outline'}`}
        >
          Negative (≤2)
        </button>
      </div>

      {/* Reviews Table */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow-lg">
        <table className="table w-full">
          <thead>
            <tr>
              <th>User</th>
              <th>Service</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-base-content/70">
                  No reviews found
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                          <span>{review.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{review.user?.name || 'Unknown'}</div>
                        <div className="text-sm opacity-50">{review.user?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold">{review.service?.title || 'N/A'}</div>
                    {review.service?.description && (
                      <div className="text-sm opacity-70 line-clamp-1">
                        {review.service.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span className="font-bold">({review.rating})</span>
                    </div>
                  </td>
                  <td>
                    <div className="max-w-xs">
                      <p className="line-clamp-2">{review.comment}</p>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{formatDate(review.createdAt)}</div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



