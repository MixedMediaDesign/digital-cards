import "./globals.css";
import Image from "next/image";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        {/* Header */}
        <header className="w-full flex justify-center py-6">
          <Image
            src="/mm.svg"
            alt="Mixed Media logo"
            width={120}
            height={40}
            priority
          />
        </header>

        {/* Page content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
