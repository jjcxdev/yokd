import { useUser } from "@clerk/nextjs";

export default function UserName() {
  const { user } = useUser();

  if (!user) return <div>Not signed in</div>;
  return (
    <div className="flex flex-col items-end justify-center">
      <div className="text-sm leading-none text-dimmed">{user?.firstName}</div>
      <div className="text-lg leading-none">{user?.lastName}</div>
    </div>
  );
}
