import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "react-day-picker";
import Header from "@/components/Header";
import { Toaster } from "sonner";
import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "PayNest",
  description: "Your one-stop solution for all your financial needs.",
};
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <main className="min-h-screen">
            <Header></Header>
            {children}</main>
            <Toaster richColors />
          <Footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>© {new Date().getFullYear()} PayNest. All rights reserved.</p>
            </div>
          </Footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
