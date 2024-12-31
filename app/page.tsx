"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { user } = useUser();

  if (!user) {
    return (
      <main className="flex h-screen w-full flex-col justify-center bg-black">
        <div className="flex justify-center">
          <SignIn routing="hash" />
        </div>
      </main>
    );
  }
  redirect("/dashboard");
}
