import { Link, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Button } from "./ui/button";
import { signOut } from "@/lib/auth-client";

export default function Layout() {
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Toaster position="bottom-right" richColors />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="mr-4 flex gap-6">
            <Link to="/" className="text-lg font-bold">
              Job Application Tracker
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link
                to="/"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
}
