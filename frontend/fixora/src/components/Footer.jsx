import React from 'react'
import { useNavigate } from 'react-router-dom';

function Footer() {
    const navigate = useNavigate();
  return (
    <footer className="bg-linear-to-br from-primary/10 to-base-200 py-12 px-4 mt-12">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4 text-base-content">Company</h3>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li><a href="#" className="hover:text-primary" onClick={() => navigate("/about")}>About us</a></li>
            <li><a href="#" className="hover:text-primary"onClick={() => navigate("/about")}>Terms & conditions</a></li>
            <li><a href="#" className="hover:text-primary" onClick={() => navigate("/about")}>Privacy policy</a></li>
            <li><a href="#" className="hover:text-primary"onClick={() => navigate("/provider/register")}>Careers</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-base-content">For customers</h3>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li><a href="#" className="hover:text-primary"onClick={() => navigate("/constact")}>Contact us</a></li>
            <li><a href="#" className="hover:text-primary"onClick={() => navigate("/services")}>Categories</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-4 text-base-content">For professionals</h3>
          <ul className="space-y-2 text-sm text-base-content/70">
            <li><a href="#" className="hover:text-primary" onClick={() => navigate("/provider/register")}>Register as a professional</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-base-300 text-center text-sm text-base-content/60">
        <p>* As on December 31, 2024</p>
        <p className="mt-2">© Copyright 2025 FIXORA. All rights reserved.</p>
      </div>
    </div>
  </footer>
  )
}

export default Footer