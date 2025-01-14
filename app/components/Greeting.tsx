import { useUser } from "@clerk/nextjs";
import Image from "next/image";

import YokdLogo from "@/app/favicon.svg";

export function Greeting() {
  const { user } = useUser();

  return (
    <div className="flex flex-col justify-between">
      <Image
        className="rounded-sm"
        src={YokdLogo}
        alt="YOKD Logo"
        width={40}
        height={40}
      />
      <div className="pt-4 text-sm text-dimmed">Welcome</div>
      <div className="text-6xl font-semibold">{user?.firstName}</div>
    </div>
  );
}
