import React, { useEffect, useState } from "react";
import {
  getPendingProviders,
  getAllProviders,
  getProviderDetails,
  verifyProvider,
} from "../../assistance/adminAssistance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FILTER_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

export default function ProvidersManagement() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProviders(filter);
  }, [filter]);

  const fetchProviders = async (status) => {
    try {
      setLoading(true);
      let response;
      if (status === "pending") {
        response = await getPendingProviders();
      } else {
        response = await getAllProviders(status);
      }
      setProviders(response.data?.providers || []);
      if (response.data?.providers?.length) {
        setSelectedProvider(response.data.providers[0]);
      } else {
        setSelectedProvider(null);
      }
    } catch (error) {
      console.error("Failed to fetch providers", error);
      toast.error("Unable to load providers", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedProvider = async (providerId) => {
    try {
      const response = await getProviderDetails(providerId);
      setSelectedProvider(response.data?.provider || null);
      fetchProviders(filter);
    } catch (error) {
      console.error("Failed to refresh provider", error);
    }
  };

  const handleVerification = async (providerId, status) => {
    if (!providerId) return;

    setActionLoading(true);
    try {
      await verifyProvider(providerId, { status, notes });
      toast.success(`Provider ${status} successfully`, { position: "top-right" });
      setNotes("");
      await refreshSelectedProvider(providerId);
    } catch (error) {
      console.error("Verification error", error);
      const message = error.response?.data?.error || "Action failed";
      toast.error(message, { position: "top-right" });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "--";
    return new Date(isoDate).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-base-content">Providers Management</h1>
          <p className="text-base-content/70">
            Review provider applications, verify documents, and manage partner status.
          </p>
        </div>
        <div className="join">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`btn join-item ${filter === option.value ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,3fr] gap-6">
        {/* Providers List */}
        <div className="bg-base-100 rounded-xl shadow-lg">
          <div className="p-4 border-b border-base-300">
            <h2 className="text-xl font-semibold">Applications</h2>
            <p className="text-sm text-base-content/60">Select a provider to view details</p>
          </div>

          {providers.length === 0 ? (
            <div className="p-6 text-center text-base-content/60">
              No providers found for the selected filter.
            </div>
          ) : (
            <ul className="max-h-[600px] overflow-y-auto">
              {providers.map((provider) => (
                <li
                  key={provider._id}
                  className={`p-4 border-b border-base-200 cursor-pointer transition-colors hover:bg-base-200 ${
                    selectedProvider?._id === provider._id ? "bg-primary/10" : ""
                  }`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base-content">{provider.businessName}</h3>
                      <p className="text-sm text-base-content/70">
                        {provider.user?.name} • {provider.user?.email}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="badge badge-outline uppercase">{provider.verificationStatus}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Provider Details */}
        <div className="bg-base-100 rounded-xl shadow-lg p-6">
          {selectedProvider ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-base-content">
                    {selectedProvider.businessName}
                  </h2>
                  <p className="text-base-content/70">{selectedProvider.bio || "No bio provided"}</p>
                  <div className="mt-3 space-y-1 text-sm text-base-content/70">
                    <p>
                      <span className="font-semibold">Applicant:</span> {selectedProvider.user?.name} ({" "}
                      {selectedProvider.user?.email})
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {selectedProvider.user?.phone || "--"}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span className="badge badge-primary badge-sm uppercase ml-2">
                        {selectedProvider.verificationStatus}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Applied on:</span> {formatDate(selectedProvider.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Experience</div>
                    <div className="stat-value text-primary">
                      {selectedProvider.experience || 0} yrs
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Services</div>
                    <div className="stat-value text-secondary">
                      {selectedProvider.services?.length || 0}
                    </div>
                  </div>
                </div>
              </div>

              <section>
                <h3 className="text-lg font-semibold mb-2">Services Offered</h3>
                {selectedProvider.services?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.services.map((service) => (
                      <span key={service._id || service} className="badge badge-outline">
                        {service.title || service}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-base-content/60">No services selected.</p>
                )}
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Service Areas</h3>
                {selectedProvider.serviceAreas?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.serviceAreas.map((area) => (
                      <span key={area} className="badge badge-primary badge-outline">
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-base-content/60">No service areas provided.</p>
                )}
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="card bg-base-200 card-compact">
                    <div className="card-body">
                      <h4 className="card-title text-sm">Aadhar</h4>
                      <p className="text-sm text-base-content/70">
                        {selectedProvider.documents?.aadhar?.number || "--"}
                      </p>
                      {selectedProvider.documents?.aadhar?.document && (
                        <a
                          className="link link-primary text-sm"
                          href={selectedProvider.documents.aadhar.document}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View document
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="card bg-base-200 card-compact">
                    <div className="card-body">
                      <h4 className="card-title text-sm">PAN</h4>
                      <p className="text-sm text-base-content/70">
                        {selectedProvider.documents?.pan?.number || "--"}
                      </p>
                      {selectedProvider.documents?.pan?.document && (
                        <a
                          className="link link-primary text-sm"
                          href={selectedProvider.documents.pan.document}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View document
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="card bg-base-200 card-compact">
                    <div className="card-body">
                      <h4 className="card-title text-sm">License</h4>
                      <p className="text-sm text-base-content/70">
                        {selectedProvider.documents?.license?.number || "--"}
                      </p>
                      {selectedProvider.documents?.license?.document && (
                        <a
                          className="link link-primary text-sm"
                          href={selectedProvider.documents.license.document}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View document
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Verification Notes</h3>
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Add notes for the provider"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                ></textarea>
              </section>

              <div className="flex flex-col md:flex-row gap-3 justify-end">
                <button
                  className="btn btn-error"
                  disabled={actionLoading}
                  onClick={() => handleVerification(selectedProvider._id, "rejected")}
                >
                  {actionLoading ? "Updating..." : "Reject Application"}
                </button>
                <button
                  className="btn btn-success"
                  disabled={actionLoading}
                  onClick={() => handleVerification(selectedProvider._id, "verified")}
                >
                  {actionLoading ? "Updating..." : "Approve Provider"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-base-content/60">
              Select a provider to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


