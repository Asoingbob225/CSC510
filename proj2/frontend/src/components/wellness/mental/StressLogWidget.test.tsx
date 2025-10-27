import { render, screen } from '@testing-library/react';
import StressLogWidget from './StressLogWidget';
import { BrowserRouter } from 'react-router-dom';

describe('StressLogWidget', () => {
  it('renders stress slider and trigger input', () => {
    render(
      <BrowserRouter>
        <StressLogWidget />
      </BrowserRouter>
    );
  expect(screen.getByRole('heading', { name: /Stress Log/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/e\.g\., work deadline, traffic, etc\./i)).toBeInTheDocument();
  });
});