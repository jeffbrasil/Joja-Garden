export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="font-poppins bg-quinquenary h-screen w-screen text-primary selection:bg-tertiary selection:text-white">
      {children}
    </section>
  );
}