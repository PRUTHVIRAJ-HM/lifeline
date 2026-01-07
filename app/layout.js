import { Poppins } from "next/font/google";
import "./globals.css";
import SessionTracker from "@/components/SessionTracker";
import ToastContainer from "@/components/ToastContainer";
import { ToastProvider } from "@/lib/ToastContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Academix - Skill.Practice.Success",
  description: "AI-Powered Academic Learning & Career Development Platform ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <ToastProvider>
          <SessionTracker />
          <ToastContainer />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}