import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/store/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "PADDLEHAUS Admin",
    template: "%s · PADDLEHAUS Admin",
  },
  description:
    "Catalogue, category and order administration for the PADDLEHAUS pickleball store.",
  // An internal tool has no business in search results.
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#12141a",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Extensions — Grammarly, password managers — write their own
          attributes onto <body> before React hydrates, which React reports as
          a mismatch it "won't patch up". The suppression is scoped to this one
          element's own attributes, so a genuine mismatch anywhere inside the
          tree is still reported. */}
      <body className="min-h-full" suppressHydrationWarning>
        {/* The session lives above the router so /login and the shell read the
            same store — signing in navigates without a reload. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
