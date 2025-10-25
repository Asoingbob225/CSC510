import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-lime-50 text-foreground">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="mt-4 text-xl">Page Not Found</p>
      <Button
        variant="outline"
        className="mt-8 bg-emerald-500 text-white hover:bg-emerald-500/90 hover:text-white"
        onClick={() => navigate('/')}
      >
        Go Back
      </Button>
    </div>
  );
}

export default NotFound;
