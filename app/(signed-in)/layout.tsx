export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>Header{children}Footer</section>;
}
