import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ProviderNavbar from "../components/ProviderNavbar";

export default function ProviderLayout() {
  const navigate = useNavigate();
  const userState = useSelector((state) => state.user || {});
  const provider = userState.providerProfile || null;
  const role = userState.role || null;

  useEffect(() => {
    // If user is not logged in, send them to login
    if (!userState.user || Object.keys(userState.user).length === 0) {
      toast.info("Please login to access the provider panel", { position: "top-right" });
      navigate("/login");
      return;
    }

    // If user has no provider profile or is not verified, redirect to registration
    if (!provider || provider.verificationStatus !== "verified") {
      // If provider exists but pending or rejected, show informative message
      if (provider && provider.verificationStatus === "pending") {
        toast.info("Your provider application is pending admin approval.", { position: "top-right" });
      } else if (provider && provider.verificationStatus === "rejected") {
        toast.error("Your provider application was rejected. Please update your profile or contact support.", { position: "top-right" });
      }
      // Redirect to provider registration/profile page so they can see status or resubmit
      navigate("/provider/register");
    }
  }, [userState, provider, navigate, role]);

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <ProviderNavbar />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}


