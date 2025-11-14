import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getProviderRequests,
  respondToRequest,
} from "../../assistance/providerAssistance";

const statusColorMap = {
  pending: "badge-warning",
  accepted: "badge-info",
  "in-progress": "badge-secondary",
  completed: "badge-success",
  cancelled: "badge-neutral",
  declined: "badge-error",
};

export default function ProviderRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getProviderRequests();
      console.log("getProviderRequests response:", response?.data);
      setRequests(response.data?.requests || []);
    } catch (error) {
      console.error("Failed to fetch requests", error);
      toast.error("Unable to load service requests", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    setActionLoadingId(requestId);
    try {
      await respondToRequest(requestId, action);
      toast.success(`Request ${action === "accept" ? "accepted" : "declined"}`, {
        position: "top-right",
      });
      await fetchRequests();
    } catch (error) {
      console.error("Failed to update request", error);
      const message = error.response?.data?.error || "Action failed";
      toast.error(message, { position: "top-right" });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl shadow-lg p-6">
      <ToastContainer />
      <div className="flex items-center justify-between mb-4">
        <div>
            <h1 className="text-2xl font-bold text-base-content">Service Requests</h1>
            <p className="text-base-content/70">Requests made by users for your services.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={fetchRequests} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center text-base-content/60 py-10">No service requests available.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="card bg-base-100 shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-base-content/60">Request ID: <span className="font-mono text-xs">{request._id}</span></div>
                    <h2 className="text-lg font-semibold mt-1">{request.service?.title || 'Service'}</h2>
                    <div className="text-sm text-base-content/70">Amount: ₹{request.totalAmount || '0'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">Requested: {request.requestDate ? new Date(request.requestDate).toLocaleString() : '--'}</div>
                    <div className="mt-1"><span className={`badge ${statusColorMap[request.status] || 'badge-ghost'}`}>{request.status}</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="font-semibold">Client</div>
                    <div className="text-sm">{request.client?.name || '--'}</div>
                    <div className="text-sm text-base-content/60">{request.client?.email || '--'}</div>
                    <div className="text-sm text-base-content/60">{request.client?.phone || '--'}</div>
                  </div>

                  <div>
                    <div className="font-semibold">Preferred Schedule</div>
                    <div className="text-sm">Date: {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : '--'}</div>
                    <div className="text-sm">Time: {request.preferredTime || '--'}</div>
                  </div>

                  <div>
                    <div className="font-semibold">Address</div>
                    <div className="text-sm">{request.address?.street || request.address?.city || '--'}</div>
                    <div className="text-sm text-base-content/60">{request.address?.city ? `${request.address.city}, ${request.address.state || ''}` : ''}</div>
                    <div className="text-sm">Pincode: {request.address?.pincode || '--'}</div>
                  </div>
                </div>

                {request.description && (
                  <div className="mt-4">
                    <div className="font-semibold">Description</div>
                    <div className="text-sm text-base-content/70">{request.description}</div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {request.status === 'pending' ? (
                    <>
                      <button
                        className={`btn btn-success btn-sm ${actionLoadingId === request._id ? 'loading' : ''}`}
                        onClick={() => handleAction(request._id, 'accept')}
                        disabled={actionLoadingId === request._id}
                      >
                        Confirm
                      </button>
                      <button
                        className={`btn btn-error btn-sm ${actionLoadingId === request._id ? 'loading' : ''}`}
                        onClick={() => handleAction(request._id, 'decline')}
                        disabled={actionLoadingId === request._id}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }


