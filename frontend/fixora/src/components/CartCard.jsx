import React from "react";
// toast import removed (unused)

export default function CartCard({ service, onRemove, loading }) {
  const serviceData = service.serviceId || service;
  const serviceId = serviceData._id || serviceData;

  const handleRemove = async () => {
    if (window.confirm("Are you sure you want to remove this service from cart?")) {
      await onRemove(serviceId);
    }
  };

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border border-base-300">
      <div className="card-body p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Service Image */}
          <div className="shrink-0">
            <img
              src={
                serviceData.image ||
                "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              }
              alt={serviceData.title || "Service"}
              className="w-full md:w-32 h-32 object-cover rounded-lg"
            />
          </div>

          {/* Service Details */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="card-title text-lg font-semibold text-base-content mb-2">
                {serviceData.title || serviceData.name || "Unnamed Service"}
              </h3>
              <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                {serviceData.description || "No description available"}
              </p>
              {serviceData.duration && (
                <p className="text-xs text-base-content/60 mb-2">
                  <span className="font-medium">Duration:</span> {serviceData.duration}
                </p>
              )}
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-300">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  ₹{service.price || serviceData.price || "0"}
                </span>
              </div>
              <button
                onClick={handleRemove}
                disabled={loading}
                className="btn btn-sm btn-ghost text-error hover:bg-error/10 hover:text-error"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
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
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
