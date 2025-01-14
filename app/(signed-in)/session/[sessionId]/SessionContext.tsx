"use client";

import { createContext, useContext } from "react";
import { SessionContextType } from "@/types/types";

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined,
);

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
