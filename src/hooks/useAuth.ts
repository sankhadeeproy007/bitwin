import { useState, useEffect } from "react";
import { getCurrentUser, fetchUserAttributes, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

interface AuthUser {
  userId: string;
  username?: string;
  email?: string;
  displayUsername?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const authHubListener = Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signedIn":
          checkAuth();
          break;
        case "signedOut":
          setUser(null);
          break;
      }
    });

    return () => {
      authHubListener();
    };
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      setUser({
        userId: currentUser.userId,
        username: attributes["custom:username"] as string | undefined,
        email: attributes.email,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, loading, isAuthenticated: !!user, checkAuth, logout };
};
