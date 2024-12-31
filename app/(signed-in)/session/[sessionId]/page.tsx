import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getWorkoutSession } from "@/app/actions/workout";

import SessionClient from "./SessionClient";
import SessionWrapper from "./SessionWrapper";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = await params;

  try {
    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    // Access sessionId after auth check
    const { sessionId } = resolvedParams;
    const { session, exercises } = await getWorkoutSession(sessionId);

    const sessionData = {
      exercises,
      userId: session.userId,
      planId: session.planId,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      sessionId: session.id,
    };

    return (
      <SessionWrapper sessionId={sessionData.sessionId}>
        <SessionClient sessionData={sessionData} />
      </SessionWrapper>
    );
  } catch (error) {
    console.error("Error in session page:", error);
    redirect("/dashboard");
  }
}
