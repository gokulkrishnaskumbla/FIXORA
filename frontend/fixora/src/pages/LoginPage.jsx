import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../axios/axiosinstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { saveUser } from '../redux/features/userSlice';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;

      try {
        res = await axiosInstance.post('/user/login', formData);
      } catch (userError) {

        if (userError.response?.status === 400 || userError.response?.status === 401) {
          res = await axiosInstance.post('/admin/login', formData);
        } else {
          throw userError;
        }
      }

      console.log('✅ Login Success:', res.data);

      const userData = res.data.user || res.data.admin;
      const token = res.data.token;
      const isAdmin = !!res.data.admin;
      const role = res.data.role || (isAdmin ? 'admin' : 'user');
      const providerProfile = res.data.provider || null;

      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      if (providerProfile) {
        localStorage.setItem('provider', JSON.stringify(providerProfile));
      } else {
        localStorage.removeItem('provider');
      }

      dispatch(saveUser({ user: userData, role, provider: providerProfile }));
      toast.success('Login successful!', { position: 'top-right' });
      setTimeout(() => {
        if (isAdmin) {
          navigate('/admin/dashboard');
        } else {
          // All non-admin users (including providers) go to the user's profile/dashboard
          navigate('/');
        }
      }, 1500);

    } catch (err) {
      console.error('❌ Login Error:', err);
      toast.error(
        err.response?.data?.error || 'Login failed! Please check your credentials.',
        { position: 'top-right' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <ToastContainer />
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">Login now!</h1>
          <p className="py-6 text-gray-600">
            Access your <span className="font-semibold text-blue-600">Fixora</span> account to explore
            services and manage your bookings easily.
          </p>
        </div>

        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
          <form className="card-body" onSubmit={handleSubmit}>
            <fieldset className="fieldset space-y-3">
              <label className="label font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="input input-bordered w-full"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <label className="label font-medium">Password</label>
              <input
                type="password"
                name="password"
                className="input input-bordered w-full"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <div className="flex justify-between items-center mt-2">
                <a
                  className="link link-hover text-sm text-blue-500"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </a>
              </div>

              <button
                className="btn btn-neutral mt-4 w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-sm text-center mt-3">
                Don’t have an account?{' '}
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate('/register')}
                >
                  Sign up
                </span>
              </p>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
