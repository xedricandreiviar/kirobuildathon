import { useParams } from 'react-router-dom';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1>Emergency Card Created!</h1>
      <p>Your card ID: {id}</p>
    </div>
  );
}
