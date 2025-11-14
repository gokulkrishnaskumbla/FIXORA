import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../redux/features/userSlice';
import { axiosInstance } from '../axios/axiosinstance';
import { presistor } from '../redux/store';

function AdminNavbar() {
  const _userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/admin/logout');
    } catch (error) {
      console.log(error);
    } finally {
      // Clear local state regardless of API call result
      presistor.purge();
      dispatch(clearUser());
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  return (
  <div className="navbar bg-linear-to-br from-primary/10 to-base-200 shadow-lg">
      {/* Navbar Start */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-linear-to-br from-primary/10 to-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow">
            <li onClick={() => navigate('/admin/dashboard')}><a>Dashboard</a></li>
            <li onClick={() => navigate('/admin/services')}><a>Services</a></li>
            <li onClick={() => navigate('/admin/bookings')}><a>Bookings</a></li>
            <li onClick={() => navigate('/admin/users')}><a>Users</a></li>
            <li onClick={() => navigate('/admin/providers')}><a>Providers</a></li>
            <li onClick={() => navigate('/admin/contacts')}><a>Contacts</a></li>
            <li onClick={() => navigate('/admin/reviews')}><a>Reviews</a></li>
          </ul>
        </div>
<a
  className="btn btn-ghost p-0"
  onClick={() => navigate("/admin/dashboard")}
>
  <img
    src="/Gemini_Generated_Image_gdzs6fgdzs6fgdzs-removebg-preview.png"
    alt="Fixora Logo"
    className="h-20 sm:h-25 md:h-30 w-auto object-contain"
  />
</a>
      </div>

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li onClick={() => navigate('/admin/dashboard')}>
            <a className={window.location.pathname === '/admin/dashboard' ? 'active' : ''}>Dashboard</a>
          </li>
          <li onClick={() => navigate('/admin/services')}>
            <a className={window.location.pathname === '/admin/services' ? 'active' : ''}>Services</a>
          </li>
          <li onClick={() => navigate('/admin/bookings')}>
            <a className={window.location.pathname === '/admin/bookings' ? 'active' : ''}>Bookings</a>
          </li>
          <li onClick={() => navigate('/admin/users')}>
            <a className={window.location.pathname === '/admin/users' ? 'active' : ''}>Users</a>
          </li>
          <li onClick={() => navigate('/admin/providers')}>
            <a className={window.location.pathname === '/admin/providers' ? 'active' : ''}>Providers</a>
          </li>
          <li onClick={() => navigate('/admin/contacts')}>
            <a className={window.location.pathname === '/admin/contacts' ? 'active' : ''}>Contacts</a>
          </li>
          <li onClick={() => navigate('/admin/reviews')}>
            <a className={window.location.pathname === '/admin/reviews' ? 'active' : ''}>Reviews</a>
          </li>
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end gap-3">
        <div className="flex items-center gap-2">
          <div className="badge badge-primary">Admin</div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <button className="btn btn-sm btn-error" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AdminNavbar;

