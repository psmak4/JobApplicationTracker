import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewApplication = lazy(() => import("./pages/NewApplication"));
const ApplicationView = lazy(() => import("./pages/ApplicationView"));
const ApplicationEdit = lazy(() => import("./pages/ApplicationEdit"));

const LoadingFallback = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <div className="text-muted-foreground">Loading...</div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="applications/new" element={<NewApplication />} />
            <Route path="applications/:id" element={<ApplicationView />} />
            <Route path="applications/:id/edit" element={<ApplicationEdit />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
