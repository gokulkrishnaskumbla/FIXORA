import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createCheckoutSession } from "../assistance/userAssistance";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    preferredDate: "",
    preferredTime: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const addressObj = {
        street: form.street,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      };

      const payload = {
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime || undefined,
        address: addressObj,
      };

      const response = await createCheckoutSession(payload);

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to create checkout session");
        navigate("/cart");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.response?.data?.error || "Failed to proceed to checkout");
      setTimeout(() => navigate("/cart"), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
      <ToastContainer position="top-right" />
      <div className="w-full max-w-2xl bg-base-100 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Checkout Details</h1>
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="label font-medium">Preferred Date</label>
            <input
              type="date"
              name="preferredDate"
              value={form.preferredDate}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="label font-medium">Preferred Time</label>
            <input
              type="time"
              name="preferredTime"
              value={form.preferredTime}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="label font-medium">Delivery Address</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="Street Address"
                className="input input-bordered w-full"
                required
              />
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="input input-bordered w-full"
                required
              />
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                className="input input-bordered w-full"
                required
              />
              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              type="submit"
            >
              Proceed to Secure Checkout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
