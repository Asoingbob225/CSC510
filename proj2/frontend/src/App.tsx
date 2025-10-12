import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    fetch('/api')
      .then((response) => response.json())
      .then((data: { 'The server is running': string }) =>
        setMessage(data['The server is running'])
      );
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div>
        <h1 className="text-3xl font-bold underline">{message}</h1>
      </div>
    </div>
  );
}

export default App;
