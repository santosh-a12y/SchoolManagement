import "./globals.css";
import appConfig from "@/config/appConfig";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: `${appConfig.school.name} — Student Management System`,
  description: "Comprehensive school administration system for student admissions, marks, ID cards, admit cards, and fees.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgeNetlifyBadge() {
                  try {
                    var badge = document.getElementById('nl-badge') || document.querySelector('.nl-badge');
                    if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
                    var card = document.getElementById('nl-card') || document.querySelector('.nl-card');
                    if (card && card.parentNode) card.parentNode.removeChild(card);
                  } catch (e) {}
                }
                if (typeof document !== 'undefined') {
                  purgeNetlifyBadge();
                  if (typeof MutationObserver !== 'undefined') {
                    new MutationObserver(purgeNetlifyBadge).observe(document.documentElement, {
                      childList: true,
                      subtree: true
                    });
                  }
                  window.addEventListener('DOMContentLoaded', purgeNetlifyBadge);
                  window.addEventListener('load', purgeNetlifyBadge);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased text-slate-900 bg-slate-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
