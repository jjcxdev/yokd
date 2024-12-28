import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutSession } from "@/app/actions/workout";
import SessionClient from "./SessionClient";
import SessionWrapper from "./SessionWrapper";

interface SessionPageProps {
  params: {
    sessionId: string;
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  try {
    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    // Access sessionId after auth check
    const { sessionId } = await params;
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

    const handleFinish = (): void => {
      // Logic to stop the timer and save the data
      console.log("Finish button clicked");
      // Save the data here
    };

    return (
      <SessionWrapper>
        <SessionClient sessionData={sessionData} />
      </SessionWrapper>
    );
  } catch (error) {
    console.error("Error in session page:", error);
    redirect("/dashboard");
  }
}
