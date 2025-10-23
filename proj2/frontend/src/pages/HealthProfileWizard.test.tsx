import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { HealthProfileWizard } from './HealthProfileWizard';

describe('HealthProfileWizard', () => {
  const renderWizard = () => {
    return render(
      <BrowserRouter>
        <HealthProfileWizard />
      </BrowserRouter>
    );
  };

  it('renders the wizard with the main heading', () => {
    renderWizard();
    
    expect(screen.getByText('Create Your Health Profile')).toBeInTheDocument();
    expect(screen.getByText('Complete this wizard to get personalized nutrition recommendations')).toBeInTheDocument();
  });

  it('renders step 1 (Basic Demographics)', () => {
    renderWizard();
    
    expect(screen.getByText('Basic Demographics')).toBeInTheDocument();
    expect(screen.getByText('Tell us about yourself to get personalized recommendations')).toBeInTheDocument();
  });

  it('shows progress indicator with 5 steps', () => {
    renderWizard();
    
    expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Diet')).toBeInTheDocument();
    expect(screen.getByText('Allergies')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Medical')).toBeInTheDocument();
  });

  it('has Next and Save & Continue Later buttons on step 1', () => {
    renderWizard();
    
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save & continue later/i })).toBeInTheDocument();
  });

  it('does not show Previous button on step 1', () => {
    renderWizard();
    
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
  });

  it('renders all required field labels for step 1', () => {
    renderWizard();
    
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByText('Height (feet)')).toBeInTheDocument();
    expect(screen.getByText('Height (inches)')).toBeInTheDocument();
    expect(screen.getByText('Weight (lbs)')).toBeInTheDocument();
    expect(screen.getByText('Activity Level')).toBeInTheDocument();
  });

  it('renders form inputs for all demographics fields', () => {
    renderWizard();
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    // Check that we have input elements
    const inputs = form.querySelectorAll('input, select');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('has proper form structure', () => {
    renderWizard();
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });
});

