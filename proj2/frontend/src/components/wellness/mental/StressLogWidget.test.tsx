import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import StressLogWidget from './StressLogWidget';
import { BrowserRouter } from 'react-router';

describe('StressLogWidget', () => {
  it('renders stress slider and trigger input', () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <StressLogWidget />
        </BrowserRouter>
      </QueryClientProvider>
    );
    expect(screen.getByRole('heading', { name: /Stress Log/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/e\.g\., work deadline, traffic, etc\./i)
    ).toBeInTheDocument();
  });
});
