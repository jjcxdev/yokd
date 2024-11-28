import ActionHeader from "@/app/components/ActionHeader";

export default function Exercise() {
  return (
    <div className="flex min-h-screen w-96 flex-col gap-4 border border-red-500">
      <ActionHeader title={"Add Exercise"} button={"Cancel"} />
      <p>content</p>
    </div>
  );
}
