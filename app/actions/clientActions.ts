"use client";

export function updateLocalStorage(
  sessionId: string,
  exerciseId: string,
  data: {
    notes: string;
    sets: Array<{ weight: string; reps: string; isWarmup: boolean }>;
    restTime?: number;
  },
) {
  const sessionKey = `session-${sessionId}`;
  const sessionDataFromStorage = JSON.parse(
    localStorage.getItem(sessionKey) || "{}",
  );

  sessionDataFromStorage[exerciseId] = {
    notes: data.notes,
    sets: data.sets,
    restTime: data.restTime,
  };

  localStorage.setItem(sessionKey, JSON.stringify(sessionDataFromStorage));
}
