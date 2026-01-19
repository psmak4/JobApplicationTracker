import { Link, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { buttonVariants } from "./ui/button";

export function Layout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Toaster position="bottom-right" richColors />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold sm:inline-block">
                Job Tracker
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-2 justify-end">
            <Link to="/applications/new" className={buttonVariants({ variant: "default", size: "sm" })}>
                New Application
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
}