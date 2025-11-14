import React from 'react';
import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-base-200 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">Professional Services on Fixora</h1>
          <p className="mt-4 text-lg text-base-content/70 max-w-3xl mx-auto">
            Fixora connects local professionals with customers who need trusted, high-quality services.
            Create a professional profile, list your services, manage bookings and grow your business.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-base-100 p-6 shadow">
            <h3 className="text-xl font-semibold">Why Join as a Professional?</h3>
            <ul className="mt-3 space-y-2 text-sm text-base-content/80">
              <li>• Reach more local customers actively searching for services.</li>
              <li>• Easy scheduling and booking management.</li>
              <li>• Secure payments and earnings dashboard.</li>
            </ul>
          </div>

          <div className="card bg-base-100 p-6 shadow">
            <h3 className="text-xl font-semibold">How It Works</h3>
            <ol className="mt-3 space-y-2 text-sm text-base-content/80 list-decimal list-inside">
              <li>Create a user account (if you don't have one).</li>
              <li>Complete your professional profile using "Become a Provider".</li>
              <li>Add services, set pricing and availability.</li>
              <li>Accept bookings, deliver services and get paid.</li>
            </ol>
          </div>

          <div className="card bg-base-100 p-6 shadow">
            <h3 className="text-xl font-semibold">Benefits & Tools</h3>
            <ul className="mt-3 space-y-2 text-sm text-base-content/80">
              <li>• Provider dashboard with earnings and bookings overview.</li>
              <li>• Simple service management (add/remove/update).</li>
              <li>• Messaging and notifications to stay in touch with clients.</li>
            </ul>
          </div>
        </section>

        <section className="bg-base-100 rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create a Professional Profile</h2>
          <p className="text-base-content/80 mb-4">
            If you already have an account, use the "Become a Provider" flow to create your professional profile and list services.
            If you're new, register first and then complete your provider profile.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-primary" onClick={() => navigate('/provider/register')}>Register as Provider (New)</button>
            <button className="btn btn-outline" onClick={() => navigate('/become-provider')}>Become a Provider (Existing User)</button>
            <button className="btn" onClick={() => navigate('/provider/dashboard')}>Provider Dashboard</button>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tips for a Strong Professional Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base-content/80">
            <ul className="space-y-2 list-disc list-inside">
              <li>Use a clear business name and high-quality profile photo or logo.</li>
              <li>Write a concise bio highlighting your experience and specialties.</li>
              <li>Add real photos of your work and accurate pricing/duration.</li>
            </ul>
            <ul className="space-y-2 list-disc list-inside">
              <li>Keep your availability up to date to avoid double-bookings.</li>
              <li>Respond quickly to requests — good response times increase bookings.</li>
              <li>Collect reviews from satisfied customers to build trust.</li>
            </ul>
          </div>
        </section>

        <section className="bg-base-100 rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
          <p className="text-base-content/80 mb-4">Create a professional profile and start receiving bookings in your area.</p>
          <div>
            <button className="btn btn-primary mr-3" onClick={() => navigate('/register')}>Create Account</button>
            <button className="btn btn-outline" onClick={() => navigate('/become-provider')}>Become a Provider</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;