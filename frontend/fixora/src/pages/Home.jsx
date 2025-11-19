import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listServices } from '../assistance/userAssistance';

export default function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await listServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert text → URL friendly slug
  const toSlug = (text) => {
    if (!text) return '';
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  // Navigate to service or category page
  const handleServiceClick = (service) => {
    if (service && (service.category || service.primaryCategory)) {
      const category = service.category || service.primaryCategory;
      return navigate(`/services/category/${toSlug(category)}`);
    }
    if (service && service._id) {
      return navigate(`/services/${service._id}`);
    }
    navigate('/services');
  };

  const handleCategoryClick = (category) => {
    navigate(`/services/category/${toSlug(category)}`);
  };

  // Search navigation
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/services?search=${searchQuery}`);
    } else {
      navigate('/services');
    }
  };

  // Extract featured services
  const mostBookedServices = services.slice(0, 4);

  // Improved keyword-based category filter
  const getServicesByCategory = (keywords) => {
    return services
      .filter((service) => {
        const text =
          `${service.title} ${service.description} ${service.category}`.toLowerCase();
        return keywords.some((k) => text.includes(k.toLowerCase()));
      })
      .slice(0, 4);
  };

  const salonServices = getServicesByCategory([
    'salon',
    'waxing',
    'hair',
    'beauty',
    'cleanup',
  ]);

  const cleaningServices = services
    .filter((s) => String(s.category).toLowerCase() === 'cleaning')
    .slice(0, 4);

  const applianceServices = services
    .filter((s) => String(s.category).toLowerCase() === 'appliance')
    .slice(0, 4);

  const repairServices = getServicesByCategory([
    'repair',
    'installation',
    'drill',
    'switchboard',
    'fan',
    'cupboard',
  ]);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-base-200">

      {/* Hero Section */}
      <section className="bg-base-100 py-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-6">
              Home services at your doorstep
            </h1>

            {/* Search */}
{/* Search Bar */}
<div className="max-w-md mt-6">
  <p className="text-lg text-base-content/70 mb-3">
    What are you looking for?
  </p>

  <div className="relative w-full">
    <input
      type="text"
      placeholder="Search for services..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      className="input input-bordered input-lg w-full bg-linear-to-br from-primary/10 to-base-200 text-base-content pr-20"
    />

    {/* Search button FIXED to right — NO DISAPPEAR */}
    <button
      onClick={handleSearch}
      className="btn btn-primary btn-sm absolute top-1/2 right-2 -translate-y-1/2"
    >
      Search
    </button>
  </div>
</div>


            {/* Quick Category Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                'Salon for women',
                'Bathroom & Kitchen Cleaning',
                'Electricians & Carpenters',
                'AC & Appliance Repair',
              ].map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="btn btn-outline btn-sm md:btn-md"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-12 mt-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8</div>
                <div className="text-sm text-base-content/70">Service Rating*</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">12M+</div>
                <div className="text-sm text-base-content/70">Customers Globally*</div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex w-full">
            <img
              src="MixCollage-13-Nov-2025-04-45-PM-6675.jpg"
              alt="Hero"
              className="rounded-lg w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* **************************** */}
      {/* MOST BOOKED SERVICES */}
      {/* **************************** */}

      <section className="bg-base-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-base-content mb-8">
            Most booked services
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : mostBookedServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mostBookedServices.map((service) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-linear-to-br from-primary/10 to-base-200 border border-base-300 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <img
                    src={service.image || '/placeholder.png'}
                    onError={(e) => (e.target.src = '/placeholder.png')}
                    alt={service.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm font-medium ml-1">4.79</span>
                    <span className="text-xs text-base-content/60">(3.5M)</span>
                  </div>
                  <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <span className="text-lg font-bold text-primary">₹{service.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-base-content/70">
              No services available at the moment
            </div>
          )}
        </div>
      </section>

      {/* Salon */}
      {salonServices.length > 0 && (
        <Section
          title="Salon for men & women"
          list={salonServices}
          handleServiceClick={handleServiceClick}
        />
      )}

      {/* Cleaning */}
      {cleaningServices.length > 0 && (
        <Section
          title="Cleaning & pest control"
          list={cleaningServices}
          handleServiceClick={handleServiceClick}
        />
      )}

      {/* Appliances */}
      {applianceServices.length > 0 && (
        <Section
          title="Appliance repair & service"
          list={applianceServices}
          handleServiceClick={handleServiceClick}
          seeAll="/services/category/appliance"
        />
      )}

      {/* Home Repair */}
      {repairServices.length > 0 && (
        <Section
          title="Home repair & installation"
          list={repairServices}
          handleServiceClick={handleServiceClick}
          seeAll="/services/category/electrical"
        />
      )}
    </div>
  );
}

/* --------------------------
  REUSABLE SECTION COMPONENT
----------------------------*/
function Section({ title, list, handleServiceClick, seeAll }) {
  const navigate = useNavigate();

  return (
    <section className="py-12 px-4 bg-base-100">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-base-content">{title}</h2>

          {seeAll && (
            <button
              onClick={() => navigate(seeAll)}
              className="btn btn-ghost btn-sm"
            >
              See all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((service) => (
            <div
              key={service._id}
              onClick={() => handleServiceClick(service)}
              className="bg-linear-to-br from-primary/10 to-base-200 border border-base-300 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <img
                src={service.image || '/placeholder.png'}
                onError={(e) => (e.target.src = '/placeholder.png')}
                alt={service.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                {service.title}
              </h3>
              <span className="text-lg font-bold text-primary">
                ₹{service.price}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
