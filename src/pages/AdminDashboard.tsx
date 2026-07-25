import React from 'react';
import { useRouter } from 'next/router';
import VerifiedBadge from "@/components/VerifiedBadge";
import { Phone } from "lucide-react";

const AdminDashboard = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <button
        onClick={() => router.push('/admin/settings')}
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
      >
        Go to Settings
      </button>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">User Information</h2>
        <div className="flex items-center space-x-4">
          <img src="/user-avatar.png" alt="User Avatar" className="w-16 h-16 rounded-full" />
          <div>
            <p className="text-xl font-bold">John Doe</p>
            <p className="text-gray-500">john.doe@example.com</p>
            <VerifiedBadge />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;