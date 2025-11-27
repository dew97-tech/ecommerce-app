import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "E-Commerce App",
  description: "Premium E-Commerce Experience",
};

import { auth } from "@/auth";

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased font-sans`}
      >
        <Providers session={session}>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
