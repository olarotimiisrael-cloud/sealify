import { useEffect, useState } from "react";
import { laravelApi, laravelAuth } from "@/lib/laravel-api";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = laravelAuth.getToken();

      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const user = await laravelApi.me();
        setIsAdmin(user?.role === 'admin');
      } catch {
        laravelAuth.clearSession();
        setIsAdmin(false);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, loading };
};
