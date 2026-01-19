import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import ApplicationView from "./pages/ApplicationView";
import ApplicationEdit from "./pages/ApplicationEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications/new" element={<NewApplication />} />
          <Route path="applications/:id" element={<ApplicationView />} />
          <Route path="applications/:id/edit" element={<ApplicationEdit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;