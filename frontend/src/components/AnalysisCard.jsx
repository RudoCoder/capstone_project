export default function AnalysisCard({ data }) {
  return (
    <div>
      <h3>Analysis #{data.id}</h3>
      <p>Status: {data.status}</p>
      <p>Risk: {data.risk_score}</p>
      <p>Threat: {data.threat_level}</p>
    </div>
  );
}
