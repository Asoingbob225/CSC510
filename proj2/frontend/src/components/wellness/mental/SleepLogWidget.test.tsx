import { render, screen } from '@testing-library/react';
import SleepLogWidget from './SleepLogWidget';
import { BrowserRouter } from 'react-router-dom';

describe('SleepLogWidget', () => {
  it('renders sleep duration and quality slider', () => {
    render(
      <BrowserRouter>
        <SleepLogWidget />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: /Sleep Log/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/How did you sleep/i)).toBeInTheDocument();
  });
});
