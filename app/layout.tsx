import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { AppNav } from "./_components/shell/app-nav";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ferretería · Panel",
  description:
    "Sistema de gestión para ferretería: stock único, ingresos validados y pedidos por mínimos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${instrumentSerif.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>
          <div className="flex min-h-dvh flex-col md:flex-row">
            <AppNav />
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
