
// src/App.jsx
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes";

export default function App() {
  return (
    <div className="flex h-screen w-full bg-[#0b0f1a] overflow-hidden">
      {/* 1. Sidebar on the left */}
      <Sidebar />

      {/* 2. Content area on the right */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}
