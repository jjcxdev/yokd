import { SignIn } from "@clerk/nextjs";

export default function Greeting() {
  return (
    <div className="m-auto h-fit rounded-lg bg-gray-900 p-10 align-middle">
      <h1 className="font-helvob flex justify-center text-6xl text-white">
        YOKD
      </h1>
      <p className="flex justify-center text-white">
        Are you ready to get started?
      </p>
      <SignIn />
    </div>
  );
}
