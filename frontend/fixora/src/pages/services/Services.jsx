import React, { useEffect, useState, useMemo } from 'react';
import Cards from '../../components/Cards';
import { listServices, listServicesByCategory } from '../../assistance/userAssistance';

export default function Services() {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    "listing",
    "plumbing",
    "cleaning",
    "electrical",
    "carpenter",
    "appliance",
    "saloon",
    "others",
  ];

  useEffect(() => {
    const load = async () => {
      try {
        if (selectedCategory) {
          const res = await listServicesByCategory(selectedCategory);
          setServices(res.data || []);
        } else {
          const res = await listServices();
          setServices(res.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    if (!search) return services;
    const q = search.toLowerCase().trim();
    return services.filter((s) => (s.title || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
  }, [services, search]);

  return (
    <div className="min-h-screen bg-base-200 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="input input-bordered" />
            <button className="btn" onClick={() => setSearch('')}>Clear</button>
          </div>

          <div className="flex items-center gap-2">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="select select-bordered">
              <option value="">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {selectedCategory && <button className="btn btn-ghost" onClick={() => setSelectedCategory('')}>Show All</button>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-8 bg-base-100 rounded-2xl shadow-md">
          {filtered.length > 0 ? (
            filtered.map((service, i) => (
              <div key={i} className="flex justify-center">
                <Cards data={service} />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No services found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
