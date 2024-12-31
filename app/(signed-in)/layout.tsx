export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen w-full justify-center bg-accent text-white md:px-10">
      {children}
    </section>
  );
}
