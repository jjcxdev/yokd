export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-accent text-white md:p-10">
      {children}
    </section>
  );
}
