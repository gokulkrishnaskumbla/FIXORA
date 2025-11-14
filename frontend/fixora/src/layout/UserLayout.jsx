import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'

export default function UserLayout() {
  return (
    <div className='flex flex-col min-h-screen'>
        <Navbar/>
        <div className='grow'><Outlet/></div>
        <Footer/>
    </div>
  )
}
