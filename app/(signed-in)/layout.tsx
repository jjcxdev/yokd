export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="bg-background h-screen text-white">
      {children}Footer
    </section>
  );
}
