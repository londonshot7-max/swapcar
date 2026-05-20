import "./globals.css";
import { AuthProvider } from '../lib/auth-context'

export const metadata = {
  title: "SwapCar.sk — Kúp, Predaj, Vymeň",
  description: "Slovenská platforma pre nákup, predaj a výmenu vozidiel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sk">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}