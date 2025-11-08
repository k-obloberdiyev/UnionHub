import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Departments from "./pages/Departments";
import DepartmentMembers from "./pages/DepartmentMembers";
import Events from "./pages/Events";
import Coins from "./pages/Coins";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";
import Evaluation from "./pages/Evaluation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Use createBrowserRouter + RouterProvider so we can opt into the v7 future flag
          and avoid the relative-splat warning from react-router. */}
      <RouterProvider
        router={createBrowserRouter(
          [
            { path: "/login", element: <Login /> },
            { path: "/", element: <Home /> },
            { path: "/departments", element: <Departments /> },
            { path: "/departments/:id/members", element: <DepartmentMembers /> },
            { path: "/events", element: <Events /> },
            { path: "/evaluation", element: <Evaluation /> },
            { path: "/coins", element: <ProtectedRoute><Coins /></ProtectedRoute> },
            { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
            { path: "/admin", element: <ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute> },
            { path: "*", element: <NotFound /> },
          ],
          {
            // Opt into the v7 relative splat path resolution now to silence the runtime warning
            future: { v7_relativeSplatPath: true },
          }
        )}
      />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
