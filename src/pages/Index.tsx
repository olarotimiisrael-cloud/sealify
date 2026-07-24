"use client";

import React from 'react';
import RegisterForm from "@/components/RegisterForm";
import LoginForm from "@/components/LoginForm";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to My App</h1>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-6">
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        <RegisterForm />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default Home;