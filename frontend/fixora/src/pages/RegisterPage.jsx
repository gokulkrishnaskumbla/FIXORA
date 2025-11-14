import React, { useState } from 'react';
import { axiosInstance } from '../axios/axiosinstance';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // 🔹 Simple Regex Patterns
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const indianPhonePattern = /^[6-9]\d{9}$/; // Starts w/6-9 and 10 digits
  const passwordPattern = /^.{6,}$/; // Min 6 chars

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 🔹 Inline Validation
    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: emailPattern.test(value) ? "" : "Enter a valid email address",
      }));
    }

    if (name === "phone") {
      setErrors((prev) => ({
        ...prev,
        phone: indianPhonePattern.test(value)
          ? ""
          : "Enter valid 10-digit Indian number",
      }));
    }

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: passwordPattern.test(value)
          ? ""
          : "Password must be at least 6 characters",
      }));
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value === formData.password ? "" : "Passwords do not match",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submit if validation errors exist
    if (Object.values(errors).some((err) => err !== "")) {
      toast.error("Please fix the form errors!", { position: "top-right" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!", { position: "top-right" });
      return;
    }

    try {
      const res = await axiosInstance.post("/user/register", formData);
      toast.success("Registration successful!", { position: "top-right" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <ToastContainer />
      <div className="hero-content flex-col lg:flex-row">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Register now!</h1>
          <p className="py-6">
            Create an account to access our premium car rental service and enjoy exclusive offers.
          </p>
        </div>

        <div className="card bg-base-100 w-full max-w-sm shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            <fieldset className="fieldset">

              {/* Name */}
              <label className="label">Full Name</label>
              <input
                name="name"
                type="text"
                className="input"
                placeholder="Your Name"
                onChange={handleChange}
                required
              />

              {/* Email */}
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="Email"
                onChange={handleChange}
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

              {/* Phone */}
              <label className="label">Phone</label>
              <input
                name="phone"
                type="tel"
                className="input"
                placeholder="Phone Number"
                onChange={handleChange}
                required
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

              {/* Password */}
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                className="input"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

              {/* Confirm Password */}
              <label className="label">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                className="input"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}

              <button className="btn btn-neutral mt-4" type="submit">
                Register
              </button>

              <p className="text-sm text-center mt-3">
                Already have an account?{" "}
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>
              </p>

            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
