import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

export default function AdminLayout() {
  return (
    <div className='flex flex-col min-h-screen bg-base-200'>
      <AdminNavbar />
      <div className='grow p-4'>
        <Outlet />
      </div>
    </div>
  );
}



