"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:5000/api/auth/", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setUserId(data.userId);
      } else {
        setUserId(null);
      }

      setLoading(false);
    })();
  }, []);

  return { loading, userId, loggedIn: !!userId };
}
