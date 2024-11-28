export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-background min-h-screen text-white">
      {children}
    </section>
  );
}
