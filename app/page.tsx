"use client";

import { SignIn, useUser, UserButton } from "@clerk/nextjs";

export default function Home() {
  const { user } = useUser();

  if (!user) {
    return (
      <main className="flex h-screen w-full flex-col justify-center bg-black">
        <div className="flex justify-center">
          <SignIn />
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col justify-center bg-black">
      <div className="text-white">THIS IS THE DASHBOARD</div>
      <div>
        <UserButton />
      </div>
    </main>
  );
}
