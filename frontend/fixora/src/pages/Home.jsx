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

  // Get most booked services (first 8 services)
  const mostBookedServices = services.slice(0, 4);

  // Filter services by category
  const getServicesByCategory = (categoryKeywords) => {
    return services.filter(service =>
      categoryKeywords.some(keyword =>
        service.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        service.description?.toLowerCase().includes(keyword.toLowerCase())
      )
    ).slice(0, 4);
  };

  const salonServices = getServicesByCategory(['salon', 'waxing', 'hair', 'cleanup', 'beauty']);
  // Show only services explicitly categorized as 'cleaning' and 'appliance'
  const cleaningServices = services.filter(s => String(s.category || '').toLowerCase() === 'cleaning').slice(0, 4);
  const applianceServices = services.filter(s => String(s.category || '').toLowerCase() === 'appliance').slice(0, 4);
  const repairServices = getServicesByCategory(['repair', 'installation', 'drill', 'switchboard', 'fan', 'cupboard']);

  const toSlug = (text) => {
    if (!text) return "";
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const handleServiceClick = (service) => {
    // Prefer navigating to the service's primary category page when available
    if (service && (service.category || service.primaryCategory)) {
      const category = service.category || service.primaryCategory;
      const slug = toSlug(category);
      if (slug) return navigate(`/services/category/${slug}`);
    }

    // Fallback to generic services list or service details
    if (service && service._id) {
      return navigate(`/services/${service._id}`);
    }

    navigate('/services');
  };

  const handleCategoryClick = (category) => {
    const slug = toSlug(category);
    if (!slug) return navigate('/services');
    navigate(`/services/category/${slug}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-base-200">
      {/* Hero Section */}
    <section className="bg-base-100 ">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Left Section */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-6">
            Home services at your doorstep
          </h1>

          {/* Search Bar */}
          <div className="max-w-md mt-6">
            <p className="text-lg text-base-content/70 mb-3">
              What are you looking for?
            </p>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate("/services");
                  }
                }}
                className="input input-bordered input-lg w-full bg-linear-to-br from-primary/10 to-base-200 text-base-content"
              />
              <button
                onClick={() => navigate("/services")}
                className="absolute right-2 top-2 btn btn-primary btn-sm"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Category Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              "Salon for women",
              "Bathroom & Kitchen Cleaning",
              "Electricians & Carpenters",
              "AC & Appliance Repair",
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
              <div className="text-sm text-base-content/70">
                Service Rating*
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">12M+</div>
              <div className="text-sm text-base-content/70">
                Customers Globally*
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Image Grid */}
        <div className="flex flex-cols-2 gap-4">
          <img
            src="MixCollage-13-Nov-2025-04-45-PM-6675.jpg"
            alt="Salon Service"
            className="rounded-lg w-full h-full object-cover"
          />
        </div>
      </div>
    </section>

      {/* Most Booked Services */}
  <section className="bg-base-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-base-content mb-8">Most booked services</h2>

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
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-medium ml-1">4.79</span>
                    </div>
                    <span className="text-xs text-base-content/60">(3.5M)</span>
                  </div>
                  <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      ₹{service.price}
                    </span>
                  </div>
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

      {/* Salon for Women Section */}
      {salonServices.length > 0 && (
  <section className="py-12 px-4 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-base-content mb-6">Salon for men & Women</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Waxing', 'Cleanup', 'Hair care'].map((subcategory) => (
                <button
                  key={subcategory}
                  onClick={() => handleCategoryClick(subcategory)}
                  className="btn btn-ghost btn-sm"
                >
                  {subcategory}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {salonServices.map((service) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-linear-to-br from-primary/10 to-base-200 border border-base-300 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">₹{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cleaning & Pest Control Section */}
  {cleaningServices.length > 0 && (
  <section className="py-12 px-4 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-base-content mb-6">Cleaning & pest control</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cleaningServices.map((service) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-linear-to-br from-primary/10 to-base-200 border border-base-300 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">₹{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Appliance Repair & Service Section */}
  {applianceServices.length > 0 && (
  <section className="py-12 px-4 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-base-content">Appliance repair & service</h2>
              <button
                onClick={() => navigate('/services/category/appliance')}
                className="btn btn-ghost btn-sm"
              >
                See all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {applianceServices.map((service) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-linear-to-br from-primary/10 to-base-200 border border-base-300 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-medium ml-1">4.85</span>
                    </div>
                    <span className="text-xs text-base-content/60">(69K)</span>
                  </div>
                  <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">₹{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Home Repair & Installation Section */}
  {repairServices.length > 0 && (
  <section className="py-12 px-4 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-base-content">Home repair & installation</h2>
              <button
                onClick={() => navigate('/services/category/electrical')}
                className="btn btn-ghost btn-sm"
              >
                See all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {repairServices.map((service) => (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service)}
                  className="bg-linear-to-br from-primary/10 to-base-200 border border-base-300 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {service.image && (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="text-sm font-medium ml-1">4.86</span>
                    </div>
                    <span className="text-xs text-base-content/60">(100K)</span>
                  </div>
                  <h3 className="font-semibold text-base-content mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">₹{service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  );
}
