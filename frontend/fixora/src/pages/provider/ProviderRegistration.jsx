import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { listServices } from "../../assistance/userAssistance";
import { registerProvider } from "../../assistance/providerAssistance";
import { useDispatch } from "react-redux";
import { saveUser } from "../../redux/features/userSlice";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../axios/axiosinstance";

const initialFormState = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  serviceCategory: "",
  services: [],
  experience: "",
  bio: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  serviceAreas: "",
  aadharNumber: "",
  aadharDocument: "",
  panNumber: "",
  panDocument: "",
  licenseNumber: "",
  licenseDocument: "",
};

export default function ProviderRegistration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialFormState);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const userState = useSelector((state) => state.user);
  const loggedIn =
    userState && userState.user && Object.keys(userState.user).length > 0;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await listServices();
        setServices(response.data?.services || []);
      } catch (error) {
        console.error("Error fetching services", error);
        toast.error("Failed to load services", { position: "top-right" });
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    if (loggedIn) {
      const u = userState.user || {};
      setFormData((prev) => ({
        ...prev,
        name: u.name || prev.name,
        email: u.email || prev.email,
        phone: u.phone || prev.phone,
      }));
    }
  }, [loggedIn]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    // If the primary service category changes, attempt to auto-select services in that category
    if (name === "serviceCategory") {
      const selectedCategory = (value || "").toString().trim().toLowerCase();
      const matchedServiceIds = selectedCategory
        ? services
            .filter((s) => String(s.category || "").toString().trim().toLowerCase() === selectedCategory)
            .map((s) => String(s._id || s.id))
        : [];

      // Only auto-select if we actually matched services; otherwise keep existing selections
      if (matchedServiceIds.length) {
        setFormData((prev) => ({ ...prev, [name]: value, services: matchedServiceIds }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // FIXED SERVICE SELECTION HANDLER
  const handleServiceToggle = (serviceId) => {
    serviceId = String(serviceId); // normalize to string

        setFormData((prev) => {
          const exists = prev.services.includes(serviceId);
          return {
            ...prev,
            services: exists
              ? prev.services.filter((id) => id !== serviceId)
              : [...prev.services, serviceId],
          };
        });
      };
  
  

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Determine selected services: prefer explicit selections, otherwise derive from chosen category
    const selectedServiceIds = (formData.services && formData.services.length)
      ? formData.services
      : (formData.serviceCategory
          ? services
              .filter((s) => String(s.category || "").toString().trim().toLowerCase() === String(formData.serviceCategory || "").toString().trim().toLowerCase())
              .map((s) => String(s._id || s.id))
          : []);

    // If neither services nor a primary category are provided, block submission
    if (!selectedServiceIds.length && !formData.serviceCategory) {
      toast.error("Please select at least one service", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    try {
      let response;

      if (loggedIn) {
        const payload = {
          businessName: formData.businessName,
          services: selectedServiceIds,
          primaryCategory: formData.serviceCategory || undefined,
          experience: Number(formData.experience) || 0,
          bio: formData.bio,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          serviceAreas: formData.serviceAreas
            ? formData.serviceAreas
                .split(",")
                .map((area) => area.trim())
                .filter(Boolean)
            : [],
          documents: {
            aadhar: {
              number: formData.aadharNumber,
              document: formData.aadharDocument,
            },
            pan: {
              number: formData.panNumber,
              document: formData.panDocument,
            },
            license: {
              number: formData.licenseNumber,
              document: formData.licenseDocument,
            },
          },
        };

        response = await axiosInstance.post("/provider/become", payload);
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          services: selectedServiceIds,
          primaryCategory: formData.serviceCategory || undefined,
          experience: Number(formData.experience) || 0,
          bio: formData.bio,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          serviceAreas: formData.serviceAreas
            ? formData.serviceAreas
                .split(",")
                .map((area) => area.trim())
                .filter(Boolean)
            : [],
          documents: {
            aadhar: {
              number: formData.aadharNumber,
              document: formData.aadharDocument,
            },
            pan: {
              number: formData.panNumber,
              document: formData.panDocument,
            },
            license: {
              number: formData.licenseNumber,
              document: formData.licenseDocument,
            },
          },
        };

        response = await registerProvider(payload);
      }

      const { token, user, provider, role } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "provider");
      if (provider) {
        localStorage.setItem("provider", JSON.stringify(provider));
      }

      dispatch(
        saveUser({
          user,
          role: role || "provider",
          provider,
        })
      );

      toast.success("Registration submitted successfully!", {
        position: "top-right",
      });

      setTimeout(() => {
        navigate("/provider/dashboard");
      }, 1200);
    } catch (error) {
      console.error("Provider registration error", error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed";
      toast.error(message, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-10">
      <ToastContainer />
      <div className="max-w-5xl mx-auto bg-base-100 shadow-xl rounded-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Become a Fixora Partner</h1>
          <p className="mt-2 text-base-content/70">
            Join our network of trusted professionals. Complete the form below to
            submit your application for verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* PERSONAL DETAILS */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="input input-bordered w-full"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* BUSINESS INFORMATION */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  className="input input-bordered w-full"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="label">Primary Service Category</label>
                <select
                  name="serviceCategory"
                  className="select select-bordered w-full"
                  value={formData.serviceCategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="electrical">Electrical</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="appliance">Appliance</option>
                  <option value="salon">Salon</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="label">Experience (years)</label>
                <input
                  type="number"
                  min="0"
                  name="experience"
                  className="input input-bordered w-full"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">About Your Services</label>
                <textarea
                  name="bio"
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Tell us about yourself and the services you provide"
                  value={formData.bio}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            {/* FIXED SERVICES LIST */}
            <div className="mt-4">
              <label className="label">Services Offered</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {services.map((service) => {
                  const id = String(service._id || service.id); // FIX
                  const isSelected = formData.services.includes(id);

                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => handleServiceToggle(id)}
                      className={`btn btn-sm justify-start ${
                        isSelected ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {service.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ADDRESS */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Street</label>
                <input
                  type="text"
                  name="street"
                  className="input input-bordered w-full"
                  value={formData.street}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  name="city"
                  className="input input-bordered w-full"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  name="state"
                  className="input input-bordered w-full"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  className="input input-bordered w-full"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Service Areas (comma separated)</label>
                <input
                  type="text"
                  name="serviceAreas"
                  className="input input-bordered w-full"
                  placeholder="Example: Kakkanad, Edappally, Panampilly"
                  value={formData.serviceAreas}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          {/* DOCUMENTS */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Verification Documents</h2>
            <p className="text-sm text-base-content/70 mb-4">
              Provide your document numbers and share URLs to uploaded copies
              (Google Drive, Dropbox, etc.).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  className="input input-bordered w-full"
                  value={formData.aadharNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="label">Aadhar Document URL</label>
                <input
                  type="text"
                  name="aadharDocument"
                  className="input input-bordered w-full"
                  placeholder="https://"
                  value={formData.aadharDocument}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  className="input input-bordered w-full"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="label">PAN Document URL</label>
                <input
                  type="text"
                  name="panDocument"
                  className="input input-bordered w-full"
                  placeholder="https://"
                  value={formData.panDocument}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">Service License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  className="input input-bordered w-full"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="label">License Document URL</label>
                <input
                  type="text"
                  name="licenseDocument"
                  className="input input-bordered w-full"
                  placeholder="https://"
                  value={formData.licenseDocument}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`btn btn-primary btn-lg ${
                loading ? "loading" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
