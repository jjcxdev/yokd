"use client";
import React from "react";
import SessionLayout from "./SessionLayout";
import { useRouter } from "next/navigation";
import { completeWorkoutSession } from "@/app/actions/workout";

interface SessionWrapperProps {
  children: React.ReactNode;
  sessionId: string;
}

export default function SessionWrapper({
  children,
  sessionId,
}: SessionWrapperProps): JSX.Element {
  const router = useRouter();

  const handleFinish = () => {
    if (window.confirm("Are you sure you want to finish the session?")) {
      completeWorkoutSession(sessionId)
        .then(() => {
          router.push("/dashboard");
        })
        .catch((error) => {
          console.error("Error completing workout:", error);
          alert("Failed to complete workout. Please try again.");
        });
    }
  };

  return <SessionLayout onFinish={handleFinish}>{children}</SessionLayout>;
}
