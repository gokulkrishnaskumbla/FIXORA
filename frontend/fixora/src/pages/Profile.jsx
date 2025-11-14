import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, ShieldCheck, Calendar, LogIn, Building2, LogOut, Camera } from "lucide-react";

export default function Profile() {
  const userState = useSelector((state) => state.user);
  const user = userState.user || {};
  const provider = userState.providerProfile || null;
  const navigate = useNavigate();
  const _dispatch = useDispatch();

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage") ||
      `https://ui-avatars.com/api/?name=${user.name || "User"}&background=random`
  );

  // handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem("profileImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // handle logout
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-100 via-white to-blue-100 flex flex-col items-center py-16 px-4">
      {/* Profile Card */}
      <div className="max-w-5xl w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-gray-200 transition-all hover:shadow-blue-200">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          {/* Avatar with Upload */}
          <div className="flex justify-center md:justify-start relative">
            <div className="relative group">
              <img
                src={profileImage}
                alt="User Avatar"
                className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-md object-cover"
              />
              <label
                htmlFor="profileUpload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow cursor-pointer hover:bg-blue-600 transition"
              >
                <Camera size={18} />
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="text-blue-500" /> Personal Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-gray-700">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-blue-400" />
                <span className="font-medium">Email:</span> {user.email || "-"}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-blue-400" />
                <span className="font-medium">Phone:</span> {user.phone || "-"}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-400" />
                <span className="font-medium">Role:</span> {userState.role || "User"}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-400" />
                <span className="font-medium">Registered:</span>{" "}
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
              </div>
              <div className="flex items-center gap-2">
                <LogIn size={18} className="text-blue-400" />
                <span className="font-medium">Last Login:</span>{" "}
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200" />

        {/* Provider Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="text-blue-500" /> Provider Information
          </h2>

          {provider ? (
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-inner">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold text-gray-900">Business Name:</span>{" "}
                {provider.businessName || "-"}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold text-gray-900">Bio:</span>{" "}
                {provider.bio || "-"}
              </p>
              <p className="text-gray-700 mb-4">
                <span className="font-semibold text-gray-900">Verification Status:</span>{" "}
                {provider.verificationStatus || "Pending"}
              </p>
              <button
                onClick={() => navigate("/provider/dashboard")}
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition shadow"
              >
                Go to Provider Dashboard
              </button>
            </div>
          ) : (
            <div className="bg-linear-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200 shadow-inner flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-700 mb-3 md:mb-0">
                You don’t have a provider profile yet.
              </p>
              <button
                onClick={() => navigate("/become-provider")}
                className="px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition shadow"
              >
                Become a Provider
              </button>
            </div>
          )}
        </div>

        {/* Buttons at Bottom */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition font-medium w-full sm:w-auto"
          >
            ← Back
          </button>

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-linear-to-r from-red-500 to-rose-600 text-white rounded-xl hover:opacity-90 transition shadow flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
