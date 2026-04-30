import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "react-router";
import type { Route } from "./+types/root";
import colorSchemeApi from "@dazl/color-scheme/client?url";
import { ErrorBoundary as ErrorBoundaryRoot } from "~/components/error-boundary/error-boundary";
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/theme.css";
import { useColorScheme } from "@dazl/color-scheme/react";
import favicon from "/favicon-new.svg";
import styles from "./root.module.css";
import { NavigationBar } from "./blocks/__global/navigation-bar";
import { Footer } from "./blocks/__global/footer";
import { AuthProvider } from "~/contexts/auth-context";

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    href: favicon,
    type: "image/svg+xml",
  },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap",
  },
];

function AppShell() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <NavigationBar />}
      <main className={isLoginPage ? styles.mainFull : styles.main}>
        <Outlet />
      </main>
      {!isLoginPage && <Footer />}
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { rootCssClass, resolvedScheme } = useColorScheme();
  return (
    <html lang="en" suppressHydrationWarning className={rootCssClass} style={{ colorScheme: resolvedScheme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <script src={colorSchemeApi} data-light-class="light-theme" data-dark-class="dark-theme"></script>
        <Links />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <AppShell />;
}

export const ErrorBoundary = ErrorBoundaryRoot;
