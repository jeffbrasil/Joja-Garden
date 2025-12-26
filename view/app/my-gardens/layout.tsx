export default function GardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="font-poppins bg-quinquenary min-h-screen w-full text-primary selection:bg-tertiary selection:text-white">
      {children}
    </section>
  );
}