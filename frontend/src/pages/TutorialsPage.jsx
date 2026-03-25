import { useEffect, useState } from "react";
import { getTutorials } from "../api/tutorialService";
import TutorialCard from "../components/TutorialCard";

export default function TutorialsPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getTutorials().then((res) => setData(res.data));
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
