"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem("isLoggedIn");
    if (loginStatus === "true") {
      setIsAllowed(true);
    } else {
      router.replace("/login");
    }
    setChecked(true);
  }, [router]);

  // ✅ selama belum dicek, tampilkan placeholder yang SAMA antara server & client
  if (!checked) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Checking session...
      </div>
    );
  }

  // ✅ kalau tidak allowed, jangan render apa-apa (karena sudah redirect)
  if (!isAllowed) return null;

  return <>{children}</>;
}