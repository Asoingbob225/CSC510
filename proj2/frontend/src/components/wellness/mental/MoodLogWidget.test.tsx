import { render, screen } from '@testing-library/react';
import MoodLogWidget from './MoodLogWidget';
import { BrowserRouter } from 'react-router-dom';

describe('MoodLogWidget', () => {
  it('renders mood slider and notes input', () => {
    render(
      <BrowserRouter>
        <MoodLogWidget />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: /Mood Log/i })).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What's on your mind/i)).toBeInTheDocument();
  });
});
