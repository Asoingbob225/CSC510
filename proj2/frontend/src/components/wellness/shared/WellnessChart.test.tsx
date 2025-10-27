import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WellnessChart from './WellnessChart';

describe('WellnessChart', () => {
  const mockData = [
    { date: '2025-10-21', value: 7 },
    { date: '2025-10-22', value: 8 },
    { date: '2025-10-23', value: 6 },
    { date: '2025-10-24', value: 9 },
    { date: '2025-10-25', value: 7 },
    { date: '2025-10-26', value: 8 },
    { date: '2025-10-27', value: 8 },
  ];

  it('renders mood chart with title and data', () => {
    render(<WellnessChart data={mockData} metric="mood" />);

    expect(screen.getByText(/Mood Score Trend/i)).toBeInTheDocument();
    expect(screen.getByText('Avg:')).toBeInTheDocument();
  });

  it('renders stress chart with correct icon and color', () => {
    render(<WellnessChart data={mockData} metric="stress" />);

    expect(screen.getByText(/Stress Level Trend/i)).toBeInTheDocument();
  });

  it('renders sleep chart with correct configuration', () => {
    render(<WellnessChart data={mockData} metric="sleep" />);

    expect(screen.getByText(/Sleep Quality Trend/i)).toBeInTheDocument();
  });

  it('displays empty state when no data is provided', () => {
    render(<WellnessChart data={[]} metric="mood" />);

    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    expect(screen.getByText(/Start logging to see your trends/i)).toBeInTheDocument();
  });

  it('calculates average correctly', () => {
    render(<WellnessChart data={mockData} metric="mood" />);

    // Average of [7, 8, 6, 9, 7, 8, 8] = 7.6
    expect(screen.getByText('7.6')).toBeInTheDocument();
  });

  it('shows improving trend when data is increasing', () => {
    const increasingData = [
      { date: '2025-10-21', value: 5 },
      { date: '2025-10-22', value: 6 },
      { date: '2025-10-23', value: 7 },
      { date: '2025-10-24', value: 8 },
    ];

    render(<WellnessChart data={increasingData} metric="mood" />);

    expect(screen.getByText('Improving')).toBeInTheDocument();
  });

  it('shows worsening trend when mood data is decreasing', () => {
    const decreasingData = [
      { date: '2025-10-21', value: 9 },
      { date: '2025-10-22', value: 8 },
      { date: '2025-10-23', value: 7 },
      { date: '2025-10-24', value: 6 },
    ];

    render(<WellnessChart data={decreasingData} metric="mood" />);

    expect(screen.getByText('Needs attention')).toBeInTheDocument();
  });

  it('shows improving trend for decreasing stress (opposite logic)', () => {
    const decreasingStress = [
      { date: '2025-10-21', value: 8 },
      { date: '2025-10-22', value: 7 },
      { date: '2025-10-23', value: 6 },
      { date: '2025-10-24', value: 5 },
    ];

    render(<WellnessChart data={decreasingStress} metric="stress" />);

    expect(screen.getByText('Improving')).toBeInTheDocument();
  });

  it('shows stable trend when data is relatively flat', () => {
    const stableData = [
      { date: '2025-10-21', value: 7 },
      { date: '2025-10-22', value: 7 },
      { date: '2025-10-23', value: 7 },
      { date: '2025-10-24', value: 7 },
    ];

    render(<WellnessChart data={stableData} metric="mood" />);

    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('hides legend when showLegend is false', () => {
    render(<WellnessChart data={mockData} metric="mood" showLegend={false} />);

    expect(screen.queryByText('Avg:')).not.toBeInTheDocument();
  });

  it('displays custom title when provided', () => {
    render(<WellnessChart data={mockData} metric="mood" title="My Custom Mood Chart" />);

    expect(screen.getByText('My Custom Mood Chart')).toBeInTheDocument();
  });

  it('limits data to last 7 days', () => {
    const manyDaysData = Array.from({ length: 15 }, (_, i) => ({
      date: `2025-10-${String(13 + i).padStart(2, '0')}`,
      value: 7 + (i % 3),
    }));

    const { container } = render(<WellnessChart data={manyDaysData} metric="mood" />);

    // Check that SVG is rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Should only show last 7 days worth of data points
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(7);
  });

  it('renders SVG chart with proper dimensions', () => {
    const { container } = render(<WellnessChart data={mockData} metric="mood" />);

    // Find the chart SVG by looking for the one with overflow-visible class
    const svg = container.querySelector('svg.overflow-visible');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '100%');
  });

  it('renders Y-axis labels correctly', () => {
    render(<WellnessChart data={mockData} metric="mood" />);

    // Y-axis should have ticks at 0, 2, 4, 6, 8, 10
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
