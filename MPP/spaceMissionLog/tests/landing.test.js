import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LandingPage from '../client/pages/index';
import '@testing-library/jest-dom';

describe('LandingPage', () => {
  it('renders the video element with correct attributes (excluding muted)', async () => {
    const { container } = render(<LandingPage />);
    const video = await waitFor(() =>
      container.querySelector('[data-testid="landing-video"]')
    );
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('preload', 'auto');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsInline');

    const source = video.querySelector('source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('src', '/rocket_motion.mp4');
    expect(source).toHaveAttribute('type', 'video/mp4');
  });

  it('renders the title, subtitle, and enter button', () => {
    render(<LandingPage />);
    expect(screen.getByText('Space Mission Log System')).toBeInTheDocument();
    expect(screen.getByText('Track every mission detail in one place')).toBeInTheDocument();
    const enterButton = screen.getByRole('button', { name: /Enter/i });
    expect(enterButton).toBeInTheDocument();
  });

  it('matches the snapshot', async () => {
    const { asFragment } = render(<LandingPage />);
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
