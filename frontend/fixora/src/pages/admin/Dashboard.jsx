import React, { useEffect, useState } from 'react';
import { getAllUsers, getAllBookings } from '../../assistance/adminAssistance';
import { listServices } from '../../assistance/userAssistance';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalServices: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, bookingsRes, servicesRes] = await Promise.all([
        getAllUsers(),
        getAllBookings(),
        listServices(),
      ]);

      const bookings = bookingsRes.data.bookings || [];
      const totalRevenue = bookings
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalUsers: usersRes.data.users?.length || 0,
        totalBookings: bookings.length,
        totalServices: servicesRes.data?.length || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-base-content">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{stats.totalUsers}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Total Bookings</div>
          <div className="stat-value text-secondary">{stats.totalBookings}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-accent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Total Services</div>
          <div className="stat-value text-accent">{stats.totalServices}</div>
        </div>

        <div className="stat bg-base-100 rounded-lg shadow-lg">
          <div className="stat-figure text-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Total Revenue</div>
          <div className="stat-value text-success">₹{stats.totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/admin/services')}
          className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title">Manage Services</h2>
            <p>Add, edit, or delete services</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary">Go to Services</button>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/bookings')}
          className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title">Manage Bookings</h2>
            <p>View and manage all bookings</p>
            <div className="card-actions justify-end">
              <button className="btn btn-secondary">Go to Bookings</button>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/users')}
          className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title">Manage Users</h2>
            <p>View all registered users</p>
            <div className="card-actions justify-end">
              <button className="btn btn-accent">Go to Users</button>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/providers')}
          className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title">Provider Verification</h2>
            <p>Review and approve provider applications</p>
            <div className="card-actions justify-end">
              <button className="btn btn-info">Go to Providers</button>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/contacts')}
          className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title">Contact Messages</h2>
            <p>View and manage contact messages</p>
            <div className="card-actions justify-end">
              <button className="btn btn-info">Go to Contacts</button>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/reviews')}
          className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        >
          <div className="card-body">
            <h2 className="card-title">Manage Reviews</h2>
            <p>View and manage customer reviews</p>
            <div className="card-actions justify-end">
              <button className="btn btn-warning">Go to Reviews</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

