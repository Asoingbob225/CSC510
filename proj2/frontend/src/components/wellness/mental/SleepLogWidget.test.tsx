import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SleepLogWidget from './SleepLogWidget';
import { BrowserRouter } from 'react-router';

describe('SleepLogWidget', () => {
  it('renders sleep duration and quality slider', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SleepLogWidget />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: /Sleep Log/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/How did you sleep/i)).toBeInTheDocument();
  });
});
