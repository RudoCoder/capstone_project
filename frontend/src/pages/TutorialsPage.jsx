import { useEffect, useState } from "react";
import API from "../api/axios";
import TutorialCard from "../components/TutorialCard";

export default function TutorialsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    API.get("tutorials/").then((res) => setData(res.data));
  }, []);

  return (
    <div>
      <h2>Tutorials</h2>
      {data.map((t) => (
        <TutorialCard key={t.id} tutorial={t} />
      ))}
    </div>
  );
}
