import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../axios/axiosinstance";
import { clearUser } from "../redux/features/userSlice";
import { presistor } from "../redux/store";
import { FaUserTie, FaPlus, FaList, FaEnvelope } from 'react-icons/fa';
import { getConversations } from '../assistance/messageAssistance';

export default function ProviderNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.user);
  const user = userState.user || {};
  const providerProfile = userState.providerProfile || null;
  const displayName = providerProfile?.businessName || user?.name || 'Provider';
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout");
    } catch (error) {
      console.error("Provider logout error", error);
    } finally {
      presistor.purge();
      dispatch(clearUser());
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("provider");
      navigate("/");
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getConversations();
        const conv = res.data?.conversations || [];
        const totalUnread = conv.reduce((s, c) => s + (c.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch (err) {
        console.warn('Failed to load message counts', err);
      }
    };

    load();
  }, []);

  const isActive = (path) => window.location.pathname === path;

  return (
    <div className="navbar bg-linear-to-br from-primary/10 to-base-200 shadow-md">
      <div className="navbar-start">
        <button
          className="btn btn-ghost text-xl flex items-center gap-2"
          onClick={() => navigate("/provider/dashboard")}
        >
          <FaUserTie className="text-xl" />
          <span className="hidden sm:inline">{displayName}</span>
        </button>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li onClick={() => navigate("/provider/dashboard")}>
            <a className={isActive("/provider/dashboard") ? "active" : ""}>Dashboard</a>
          </li>

          <li onClick={() => navigate("/provider/requests")}>
            <a className={isActive("/provider/requests") ? "active" : ""}>Requests</a>
          </li>

          <li onClick={() => navigate("/provider/services")}>
            <a className={isActive("/provider/services") ? "active" : ""}>
              <FaList className="inline mr-2" />Service List
            </a>
          </li>

          <li onClick={() => navigate("/provider/services/add")}>
            <a className={isActive("/provider/services/add") ? "active" : ""}>
              <FaPlus className="inline mr-2" />Add Service
            </a>
          </li>

          <li onClick={() => navigate("/provider/availability")}>
            <a className={isActive("/provider/availability") ? "active" : ""}>Availability</a>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-3">

        {/* Provider Badge */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="badge badge-secondary">Provider</div>
        </div>

        {/* Messages Icon */}
        <button className="btn btn-ghost" onClick={() => navigate('/messages')}>
          <div className="relative">
            <FaEnvelope className="text-lg" />
            {unreadCount > 0 && (
              <span className="badge badge-xs badge-error absolute -top-1 -right-2">
                {unreadCount}
              </span>
            )}
          </div>
        </button>

        {/* User Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-8 rounded-full bg-primary text-white flex items-center justify-center">
              <FaUserTie />
            </div>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-40 p-2 shadow"
          >
            <li>
              <a onClick={() => navigate("/")}>User Panel</a>
            </li>
          </ul>
        </div>

        {/* Mobile menu */}
        <div className="dropdown dropdown-end lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            Menu
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-linear-to-br from-primary/10 to-base-200 rounded-box mt-3 w-52 p-2 shadow"
          >
            <li onClick={() => navigate("/provider/dashboard")}><a>Dashboard</a></li>
            <li onClick={() => navigate("/provider/requests")}><a>Requests</a></li>
            <li onClick={() => navigate("/provider/services")}><a>Service List</a></li>
            <li onClick={() => navigate("/provider/services/add")}><a>Add Service</a></li>
            <li onClick={() => navigate("/provider/availability")}><a>Availability</a></li>
          </ul>
        </div>

        {/* Logout */}
        <button className="btn btn-sm" onClick={handleLogout}>
          Logout
        </button>

      </div>
    </div>
  );
}
