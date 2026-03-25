import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AppRoutes from "./routes";

export default function App() {
  return (
    <div>
      <Navbar />
      <Sidebar />
      <AppRoutes />
    </div>
  );
}
