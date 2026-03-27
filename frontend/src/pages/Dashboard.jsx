import { useEffect, useState } from "react";
import API from "../api/axios";
import AnalysisCard from "../components/AnalysisCard";
import { connectSocket, disconnectSocket } from "../api/socket";
import RiskChart from "../components/RiskChart";

export default function Dashboard() {
  const [data, setData] = useState([]);

  const fetchData = () => {
    API.get("analysis/").then((res) => setData(res.data));
  };

  useEffect(() => {
    fetchData();

    connectSocket(() => {
      fetchData(); // auto-refresh on update
    });

    return () => disconnectSocket();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>

      <RiskChart />

      {data.map((d) => (
        <AnalysisCard key={d.id} data={d} />
      ))}
    </div>
  );
}

