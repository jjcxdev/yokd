import { useUser } from "@clerk/nextjs";

export default function UserName() {
  const { user } = useUser();

  if (!user) return <div>Not signed in</div>;
  return (
    <div>
      <div>{user?.firstName}</div>
      <div>{user?.lastName}</div>
    </div>
  );
}
