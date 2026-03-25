import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useContext(AuthContext);

  return (
    <div style={{ background: "#222", color: "#fff", padding: "10px" }}>
      Threat Intelligence Platform

      <button
        onClick={logout}
        style={{ float: "right", background: "red", color: "#fff" }}
      >
        Logout
      </button>
    </div>
  );
}
