import { useEffect, useState } from "react";
import API from "../api/axios";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function RiskChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("analysis/risk-trends/").then((res) => {
      const formatted = res.data.map((d) => ({
        date: new Date(d.created_at).toLocaleDateString(),
        score: d.risk_score,
      }));
      setData(formatted);
    });
  }, []);

  return (
    <LineChart width={500} height={300} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="score" />
    </LineChart>
  );
}
