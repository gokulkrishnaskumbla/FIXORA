import React, { useState } from "react";
import axios from "axios";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const email = localStorage.getItem("fpEmail");

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/verify-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        alert("OTP Verified!");
        window.location.href = "/reset-password";
      } else {
        alert("Invalid OTP. Try again!");
      }
    } catch (error) {
      console.log(error);
      alert("Error verifying OTP");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 w-96 shadow-lg border rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Verify OTP</h2>

        <p className="mb-2 text-gray-600">Email: {email}</p>

        <input
          type="number"
          placeholder="Enter OTP"
          className="w-full p-2 border rounded mb-4"
          onChange={(e) => setOtp(e.target.value)}
        />

        <button
          onClick={handleVerifyOtp}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
