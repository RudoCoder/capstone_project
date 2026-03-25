export default function YaraMatches({ matches }) {
  return (
    <div>
      <h4>YARA Matches</h4>
      {matches.map((m) => (
        <p key={m.id}>{m.rule?.name}</p>
      ))}
    </div>
  );
}
