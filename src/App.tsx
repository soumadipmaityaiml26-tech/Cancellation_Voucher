import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import VoucherRoute from "./pages/VoucherRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        <Route
          path="/voucher/:cancellationId"
          element={
            <ProtectedRoute>
              <VoucherRoute />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Route (Protected) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="flex h-[100svh] overflow-hidden bg-gray-100">
                {/* Sidebar */}
                <Sidebar />

                {/* Right section */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Navbar (fixed height) */}
                  <Navbar />

                  {/* Scrollable content */}
                  <main className="flex-1 overflow-y-auto">
                    <Dashboard />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect everything else to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
