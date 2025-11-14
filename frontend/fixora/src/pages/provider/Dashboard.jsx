import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProviderProfile,
  getProviderStats,
  getProviderRequests,
} from "../../assistance/providerAssistance";

export default function ProviderDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profileRes, statsRes, requestsRes] = await Promise.all([
          getProviderProfile(),
          getProviderStats(),
          getProviderRequests(),
        ]);

        setProfile(profileRes.data?.provider || null);
        setStats(statsRes.data?.stats || null);
        setRecentRequests((requestsRes.data?.requests || []).slice(0, 4));
      } catch (error) {
        // Log detailed error information to help debugging (response, status, message)
        console.error("Failed to load provider dashboard", {
          message: error.message,
          response: error.response?.data || null,
          status: error.response?.status || null,
        });

        // Show a friendly toast; include server message when available
        const serverMsg = error.response?.data?.error || error.response?.data?.message;
        toast.error(serverMsg || "Unable to load provider data. Check console for details.", { position: "top-right" });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto bg-base-100 rounded-xl shadow-lg p-10 text-center">
        <ToastContainer />
        <h1 className="text-3xl font-bold text-base-content mb-4">Complete your profile</h1>
        <p className="text-base-content/70">
          We couldn't load your provider profile. Please contact support if the issue persists.
        </p>
      </div>
    );
  }

  const statusColorMap = {
    pending: "badge-warning",
    verified: "badge-success",
    rejected: "badge-error",
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      <div className="bg-base-100 rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Welcome back, {profile.businessName}</h1>
          <p className="text-base-content/70">Manage your bookings, availability, and performance.</p>
        </div>
        <div className={`badge ${statusColorMap[profile.verificationStatus] || "badge-ghost"} p-4 text-lg`}
        >
          {profile.verificationStatus?.toUpperCase()}
        </div>
      </div>

      {profile.verificationStatus !== "verified" && (
        <div className="alert alert-warning">
          <div>
            <span className="font-semibold">Verification in Progress:</span> Our admin team is reviewing your
            documents. You will be notified once the verification is complete.
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Total Requests</div>
          <div className="stat-value text-primary">{stats?.totalRequests || 0}</div>
          <div className="stat-desc">All-time service requests</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Accepted</div>
          <div className="stat-value text-secondary">{stats?.acceptedRequests || 0}</div>
          <div className="stat-desc">Requests you've accepted</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Completed</div>
          <div className="stat-value text-success">{stats?.completedRequests || 0}</div>
          <div className="stat-desc">Successfully completed jobs</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Average Rating</div>
          <div className="stat-value text-warning">{stats?.averageRating || "0.0"}</div>
          <div className="stat-desc">From {stats?.totalReviews || 0} reviews</div>
        </div>
      </div>

      {/* Availability summary */}
      <div className="bg-base-100 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Availability Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-200 card-compact">
            <div className="card-body">
              <h3 className="card-title text-sm">Status</h3>
              <p className="text-2xl font-bold text-primary">
                {profile.availability?.isAvailable ? "Available" : "Not Available"}
              </p>
            </div>
          </div>
          <div className="card bg-base-200 card-compact">
            <div className="card-body">
              <h3 className="card-title text-sm">Working Hours</h3>
              <p className="text-lg font-semibold">
                {profile.availability?.workingHours?.start || "--"} - {" "}
                {profile.availability?.workingHours?.end || "--"}
              </p>
            </div>
          </div>
          <div className="card bg-base-200 card-compact">
            <div className="card-body">
              <h3 className="card-title text-sm">Working Days</h3>
              <p className="text-sm text-base-content/70">
                {profile.availability?.workingDays?.length
                  ? profile.availability.workingDays.join(", ")
                  : "No days configured"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-base-100 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Requests</h2>
          <button className="btn btn-sm btn-outline" onClick={() => (window.location.href = "/provider/requests")}
          >
            View all
          </button>
        </div>
        {recentRequests.length === 0 ? (
          <div className="text-center text-base-content/60">No recent requests.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr key={request._id}>
                    <td>{request.client?.name || "--"}</td>
                    <td>{request.service?.title || "--"}</td>
                    <td>{new Date(request.preferredDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-outline uppercase">{request.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


