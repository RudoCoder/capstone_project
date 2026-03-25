import { useEffect, useState } from "react";
import API from "../api/axios";
import { useParams } from "react-router-dom";

import IOCList from "../components/IOCList";
import YaraMatches from "../components/YaraMatches";
import CVEList from "../components/CVEList";
import RiskIndicator from "../components/RiskIndicator";

export default function AnalysisPage() {
  const { id } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [iocs, setIocs] = useState([]);
  const [yara, setYara] = useState([]);
  const [cves, setCves] = useState([]);

  useEffect(() => {
    API.get(`analysis/${id}/`).then((res) => setAnalysis(res.data));
    API.get(`ioc/analysis/${id}/`).then((res) => setIocs(res.data));
    API.get(`yara/matches/${id}/`).then((res) => setYara(res.data));
    API.get(`cve/matches/${id}/`).then((res) => setCves(res.data));
  }, [id]);

  if (!analysis) return <p>Loading...</p>;

  return (
    <div>
      <h2>Analysis #{id}</h2>

      <RiskIndicator score={analysis.risk_score} />

      <p>Status: {analysis.status}</p>
      <p>Threat Level: {analysis.threat_level}</p>

      <IOCList iocs={iocs} />
      <YaraMatches matches={yara} />
      <CVEList cves={cves} />
    </div>
  );
}
