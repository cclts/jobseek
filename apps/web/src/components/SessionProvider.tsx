"use client";

import { createContext, useContext, type ReactNode } from "react";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  username?: string | null;
  displayUsername?: string | null;
};

type SessionContextValue = {
  user: SessionUser | null;
  isLoggedIn: boolean;
};

const SessionContext = createContext<SessionContextValue>({
  user: null,
  isLoggedIn: false,
});

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={{ user, isLoggedIn: Boolean(user) }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
