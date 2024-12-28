import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWorkoutSession } from "@/app/actions/workout";
import SessionClient from "./SessionClient";

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

    const sessionData = await getWorkoutSession(sessionId);
    return <SessionClient sessionData={sessionData} />;
  } catch (error) {
    console.error("Error in session page:", error);
    redirect("/dashboard");
  }
}
