import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";

interface Profile {
  id: string;
  full_name: string | null;
  location: string | null;
}

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { isAdmin, loading } = useAdmin();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("id, full_name, location");
    if (!error && data) {
      setProfiles(data as Profile[]);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Checking authorization...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Access Denied. You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
          Admin Active
        </span>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">User Profiles Management</h2>
        <div className="divide-y">
          {profiles.map((profile) => (
            <div key={profile.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{profile.full_name || "Unnamed User"}</p>
                <p className="text-sm text-gray-500">ID: {profile.id}</p>
                <p className="text-xs text-gray-400">Location: {profile.location || "N/A"}</p>
              </div>
            </div>
          ))}
          {profiles.length === 0 && (
            <p className="text-gray-500 text-sm py-2">No user profiles found.</p>
          )}
        </div>
      </div>
    </div>
  );
}