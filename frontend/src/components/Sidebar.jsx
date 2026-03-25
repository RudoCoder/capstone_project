import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{ width: "200px" }}>
      <Link to="/">Dashboard</Link><br />
      <Link to="/upload">Upload</Link><br />
      <Link to="/tutorials">Tutorials</Link>
    </div>
  );
}
