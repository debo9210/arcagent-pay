import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ArcAgent Pay",
  description: "Autonomous bill payments powered by AI agents on Arc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white min-h-screen">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}