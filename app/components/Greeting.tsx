import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Greeting() {
  return (
    <div className="m-auto h-fit rounded-lg bg-gray-900 p-10 align-middle">
      <h1 className="font-helvob text-white">YOKD</h1>
      <p className="text-white">Are you ready to get started?</p>
      <SignInButton />
      <SignUpButton />
    </div>
  );
}
