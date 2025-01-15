"use client";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import {
  completeWorkoutSession,
  cancelWorkoutSession,
} from "@/app/actions/workout";

import { SessionContext } from "./SessionContext";
import SessionLayout from "./SessionLayout";
import { SessionWrapperProps } from "@/types/types";

export default function SessionWrapper({
  children,
  sessionId,
}: SessionWrapperProps): JSX.Element {
  const router = useRouter();
  const [restTime, setRestTime] = useState(30);
  const [isResting, setIsResting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const handleCancel = useCallback(() => {
    if (window.confirm("Are you sure you want to cancel the session?")) {
      cancelWorkoutSession(sessionId)
        .then((result) => {
          if (result.success) {
            router.push("/dashboard");
          } else {
            alert("Failed to cancel workout session. Please try again.");
          }
        })
        .catch((error) => {
          console.error("Error cancelling workout session:", error);
          alert("Failed to cancel workout session. Please try again.");
        });
    }
  }, [router, sessionId]);

  const handleFinish = useCallback(() => {
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
  }, [router, sessionId]);

  const handleRestTimer = useCallback((time: number) => {
    setRestTime(time);
    setIsResting(true);
  }, []);

  const handleRestComplete = useCallback(() => {
    setIsResting(false);
  }, []);

  return (
    <SessionContext.Provider value={{ onRestTimeTrigger: handleRestTimer }}>
      <SessionLayout
        onFinish={handleFinish}
        restTime={restTime}
        isResting={isResting}
        onCancel={handleCancel}
        onRestTimerComplete={handleRestComplete}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, {
                onRestTimeTrigger: handleRestTimer,
              } as any)
            : child,
        )}
      </SessionLayout>
    </SessionContext.Provider>
  );
}
