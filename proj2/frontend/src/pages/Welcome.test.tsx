import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router';
import Welcome from './Welcome';

describe('Welcome Page', () => {
  it('renders the page without crashing', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );
    const brandElements = screen.getAllByText('Eatsential');
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('renders main navigation links', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /benefits/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders authentication links', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );
    const loginLinks = screen.getAllByRole('link', { name: /log in/i });
    const joinLinks = screen.getAllByRole('link', { name: /join now/i });

    expect(loginLinks.length).toBeGreaterThan(0);
    expect(joinLinks.length).toBeGreaterThan(0);
  });

  it('renders the main heading', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders contact form with required fields', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit inquiry/i })).toBeInTheDocument();
  });

  it('renders footer with copyright', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument();
  });
});
