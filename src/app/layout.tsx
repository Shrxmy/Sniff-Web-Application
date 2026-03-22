import type { Metadata } from "next";
import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "SNIFF — Discover Your Scent",
  description:
    "AI-powered fragrance discovery. Build your Scent DNA, get personalised compatibility scores, and discover luxury fragrances tailored to your unique profile.",
  keywords: "fragrance, perfume, scent DNA, AI recommendations, luxury, L'Oréal Luxe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <UserProvider>
          <Navbar />
          <main className="page-wrapper">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
