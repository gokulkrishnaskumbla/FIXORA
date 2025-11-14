import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getServiceDetails, addToCart } from "../../assistance/userAssistance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginPage from "../LoginPage";

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    getServiceDetails(serviceId)
      .then((res) => {
        setService(res.data.service || res.data || null);
      })
      .catch((err) => {
        console.error("Failed to load service details", err);
        toast.error("Failed to load service details");
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleBook = async () => {
    if (!service?._id) return;
    try {
      const res = await addToCart(service._id);
      toast.success(res.data.message || "Added to cart");
      setTimeout(() => navigate("/cart"), 800);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to add to cart");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!service) return <div><LoginPage/></div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-base-200 p-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto bg-linear-to-br from-primary/10 to-base-200 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <img src={service.image || "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"} alt={service.title} className="w-full h-64 object-cover rounded-md" />
          </div>
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold">{service.title}</h1>
            <p className="text-sm text-base-content/70 mt-2">{service.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">₹{service.price}</div>
                <div className="text-sm text-base-content/70">Duration: {service.duration || 'N/A'}</div>
              </div>

              <div className="flex gap-2">
                <button className="btn" onClick={() => navigate(-1)}>Back</button>
                <button className="btn btn-primary" onClick={handleBook}>Book Now</button>
              </div>
            </div>

            {/* Provider info if available */}
            {service.provider && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-semibold">Provider</h3>
                <p>{service.provider.businessName || service.provider.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
