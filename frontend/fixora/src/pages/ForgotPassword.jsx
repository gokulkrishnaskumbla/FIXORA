import React, { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSendOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/send-otp", { email });

      if (res.data.success) {
        alert("OTP sent to your email!");
        localStorage.setItem("fpEmail", email);
        window.location.href = "/verify-otp";
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error sending OTP");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="p-6 w-96 shadow-lg border rounded-xl">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 border rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSendOtp}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
