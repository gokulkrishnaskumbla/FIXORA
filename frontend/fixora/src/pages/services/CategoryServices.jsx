import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cards from '../../components/Cards';
import { listServicesByCategory } from '../../assistance/userAssistance';

export default function CategoryServices() {
  const { category } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    listServicesByCategory(category)
      .then((res) => {
        setServices(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 bg-base-100 rounded-2xl shadow-md p-8 w-full overflow-hidden">
  {loading ? (
    <p className="text-center text-gray-500 col-span-full">Loading services...</p>
  ) : services.length > 0 ? (
    services.map((service, i) => (
      <div key={service._id || i} className="flex justify-center">
        <Cards data={service} />
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500 col-span-full">
      No services found in this category.
    </p>
  )}
</div>
  );
}
