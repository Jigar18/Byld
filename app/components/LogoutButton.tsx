"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutFailed, setLogoutFailed] = useState(false);

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutFailed(false);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      window.location.replace("/");
    } catch {
      setLogoutFailed(true);
      setLoggingOut(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={logout} disabled={loggingOut}>
      <LogOut aria-hidden="true" />
      {loggingOut ? "Logging out…" : logoutFailed ? "Log out failed. Try again" : "Log out"}
    </Button>
  );
}
