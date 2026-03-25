export default function IOCList({ iocs }) {
  return (
    <div>
      <h4>IOCs</h4>
      {iocs.map((ioc) => (
        <p key={ioc.id}>{ioc.ioc?.value}</p>
      ))}
    </div>
  );
}
