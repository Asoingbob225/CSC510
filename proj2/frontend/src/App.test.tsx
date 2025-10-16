import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import App from './App';

describe('App', () => {
  it('renders the Welcome page with main heading', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Check if the main heading from Welcome page is rendered
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /crafted nutrition for vibrant living/i
    );
  });

  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /benefits/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pricing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders the Eatsential brand', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const eatsentialLinks = screen.getAllByText('Eatsential');
    expect(eatsentialLinks.length).toBeGreaterThan(0);
  });
});
