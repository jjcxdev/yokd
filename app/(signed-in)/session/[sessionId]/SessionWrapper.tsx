"use client";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import {
  completeWorkoutSession,
  cancelWorkoutSession,
  bulkUpdateWorkoutData,
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

  const handleCompleteSession = async () => {
    try {
      const sessionData = JSON.parse(
        localStorage.getItem(`session-${sessionId}`) ?? '{"exercises": {}}',
      );
      const exerciseUpdates = sessionData.exercises;
      await bulkUpdateWorkoutData(sessionId, exerciseUpdates);
      await completeWorkoutSession(sessionId);
      localStorage.removeItem(`session-${sessionId}`);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };

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
        onFinish={handleCompleteSession}
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
