import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect } from "react";

/**
 * Silently signs the user in with Internet Identity on app load.
 * No visible login prompt — the user sees only a loading screen.
 */
export function useAuth() {
  const { loginStatus, login, clear, identity } = useInternetIdentity();

  useEffect(() => {
    if (loginStatus === "idle") {
      login();
    }
  }, [loginStatus, login]);

  const isLoading = loginStatus === "initializing" || loginStatus === "idle";
  const isReady = loginStatus === "success";

  return { loginStatus, isLoading, isReady, identity, logout: clear };
}
