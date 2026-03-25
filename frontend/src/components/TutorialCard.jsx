export default function TutorialCard({ tutorial }) {
  return (
    <div>
      <h4>{tutorial.title}</h4>
      <a href={tutorial.url} target="_blank" rel="noreferrer">
        Open
      </a>
    </div>
  );
}
