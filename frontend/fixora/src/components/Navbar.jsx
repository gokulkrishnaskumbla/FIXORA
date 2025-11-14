import React, { useEffect, useRef, useState } from 'react';
import DarkMode from './shared/DarkMode';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userLogout } from '../assistance/userAssistance';
import { presistor } from '../redux/store';
import { clearUser } from '../redux/features/userSlice';
import { FaShoppingCart, FaUserCircle, FaEnvelope } from "react-icons/fa";
import { getConversations } from "../assistance/messageAssistance";

function Navbar() {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const detailsRef = useRef(null);

  // Auto-close dropdown on page change
  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.removeAttribute("open");
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await userLogout();
      presistor.purge();
      dispatch(clearUser());
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('provider');
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        if (userData && userData.user && Object.keys(userData.user).length > 0) {
          const res = await getConversations();
          const conv = res.data?.conversations || [];
          const totalUnread = conv.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadCount(totalUnread);
        } else {
          setUnreadCount(0);
        }
      } catch (err) {
        console.warn('Failed to fetch conversations for unread count', err);
      }
    };

    fetchUnread();
  }, [userData]);

  return (
    <div className="navbar bg-linear-to-br from-primary/10 to-base-200 shadow-sm">
      {/* Navbar Start */}
      <div className="navbar-start">
        {/* Mobile Menu */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
            <li onClick={() => navigate("/")}><a>Home</a></li>
            <li onClick={() => navigate("/about")}><a>About</a></li>
            <li>
              <a>Services</a>
              <ul className="p-2">
                <li onClick={() => navigate("/services")}><a>All</a></li>
                <li onClick={() => navigate(`/services/category/cleaning`)}><a>Cleaning</a></li>
                <li onClick={() => navigate(`/services/category/plumbing`)}><a>Plumbing</a></li>
                <li onClick={() => navigate(`/services/category/electrical`)}><a>Electrical</a></li>
                <li onClick={() => navigate(`/services/category/carpenter`)}><a>Carpenter</a></li>
                <li onClick={() => navigate(`/services/category/appliance`)}><a>Ac & Appliance repair</a></li>
                <li onClick={() => navigate(`/services/category/others`)}><a>Others</a></li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Logo */}
<a
  className="btn btn-ghost p-0"
  onClick={() => navigate("/")}
>
  <img
    src="/Gemini_Generated_Image_gdzs6fgdzs6fgdzs-removebg-preview.png"
    alt="Fixora Logo"
    className="h-30 w-auto object-contain"
  />
</a>

      </div>

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex relative z-50">
        <ul className="menu menu-horizontal px-1">
          <li onClick={() => navigate("/")}><a>Home</a></li>
          <li onClick={() => navigate("/about")}><a>About</a></li>

          {/* Dropdown menu */}
          <li>
            <details ref={detailsRef}>
              <summary className="cursor-pointer">Services</summary>
              <ul className="p-2 bg-base-100 shadow-lg rounded-lg absolute z-50">
                <li onClick={() => navigate("/services")}><a>All</a></li>
                <li onClick={() => navigate(`/services/category/cleaning`)}><a>Cleaning</a></li>
                <li onClick={() => navigate(`/services/category/plumbing`)}><a>Plumbing</a></li>
                <li onClick={() => navigate(`/services/category/electrical`)}><a>Electrical</a></li>
                <li onClick={() => navigate(`/services/category/carpenter`)}><a>Carpenter</a></li>
                <li onClick={() => navigate(`/services/category/appliance`)}><a>Appliance</a></li>
                <li onClick={() => navigate(`/services/category/others`)}><a>Others</a></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end gap-5">
        <DarkMode />

        {userData.user && Object.keys(userData.user).length > 0 ? (
          <div className="flex items-center space-x-3">
            {userData.role === 'admin' ? (
              <>
                <div className="badge badge-primary">Admin</div>
                <button className="btn btn-sm btn-primary" onClick={() => navigate("/admin/dashboard")}>
                  Admin Panel
                </button>
                <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                {/* Cart */}
                <button onClick={() => navigate("/cart")}>
                  <FaShoppingCart className="text-2xl" />
                </button>

                {/* Messages */}
                <button onClick={() => navigate('/messages')} className="relative">
                  <FaEnvelope className="text-2xl" />
                  {unreadCount > 0 && (
                    <span className="badge badge-xs badge-error absolute -top-1 -right-2">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User dropdown */}
                <div className="dropdown dropdown-end">
                  <button
                    tabIndex={0}
                    role="button"
                    aria-haspopup="true"
                  >
                    <FaUserCircle className="text-3xl" />
                  </button>

                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52"
                  >
                    <li onClick={() => navigate('/profile')}><a>Profile</a></li>
                    <li onClick={() => navigate('/bookings')}><a>My Bookings</a></li>
                    <li onClick={() => navigate((userData.role === 'provider' || userData.providerProfile) ? '/provider/dashboard' : '/provider/register')}>
                      <a>{(userData.role === 'provider' || userData.providerProfile) ? 'Provider Panel' : 'Become a Provider'}</a>
                    </li>
                    <li onClick={() => handleLogout()}><a>Logout</a></li>
                  </ul>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button className="btn btn-sm" onClick={() => navigate("/login")}>Login</button>
            <button className="btn btn-sm btn-primary" onClick={() => navigate("/register")}>Register</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
