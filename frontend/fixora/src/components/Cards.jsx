import React from "react";
import { addToCart } from "../assistance/userAssistance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

export default function Cards({ data }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);

  const addServiceToCart = async (serviceId) => {
    if (!userData || !userData.user || Object.keys(userData.user).length === 0) {
      toast.error('please login to continue');
      navigate('/login');
      return;
    }

    try {
      console.log("🛒 Adding to cart:", serviceId);
      const res = await addToCart(serviceId);
      toast.success(res.data.message || "Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);
      if (error.response?.status === 401) {
        toast.error('please login to continue');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Failed to add to cart");
      } else if (error.response?.status === 404) {
        toast.error("Service not found");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div
      className="card bg-linear-to-br from-primary/10 to-base-200 shadow-sm hover:shadow-lg transition-all cursor-pointer rounded-2xl overflow-hidden"
      onClick={() => {
        if (!userData || !userData.user || Object.keys(userData.user).length === 0) {
          toast.error('please login to continue');
          navigate('/login');
          return;
        }
        navigate(`/services/${data._id}`);
      }}
    >
      <figure className="w-full h-48 overflow-hidden">
        <img
          src={
            data.image ||
            "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          }
          alt={data.title || data.name || "Service"}
          className="w-full h-full object-cover object-center"
        />
      </figure>
      <div className="card-body flex flex-col justify-between p-5 h-56">
        <div>
          <h2 className="card-title text-lg font-semibold">
            {data.title || data.name || "Unnamed Service"}
          </h2>

          <div className="text-sm text-gray-600 h-16 overflow-hidden">
            {(() => {
              const desc = data.description || "No description available.";
              const max = 120;
              if (desc.length > max) {
                const short = desc.slice(0, max) + "...";
                return (
                  <>
                    <span>{short}</span>
                    <button
                      className="link ml-2 text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/services/${data._id}`);
                      }}
                    >
                      Read more
                    </button>
                  </>
                );
              }
              return <span>{desc}</span>;
            })()}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="font-bold text-primary text-lg">
            ₹{data.price || "N/A"}
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              addServiceToCart(data._id);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
