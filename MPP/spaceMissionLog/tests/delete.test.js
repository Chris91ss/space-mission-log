// tests/delete.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteMissionPage from '../client/pages/missions/[id]/index';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';

// Create a mock for next/router.
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('DeleteMissionPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state when no id is provided', () => {
    // When no id is provided, router.query will be empty.
    useRouter.mockReturnValue({ query: {}, push: mockPush });
    render(<DeleteMissionPage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('renders loading state when mission is null (fetch pending)', () => {
    // Provide an id but simulate a never-resolving fetch.
    useRouter.mockReturnValue({ query: { id: '1' }, push: mockPush });
    global.fetch = jest.fn(() => new Promise(() => {}));
    render(<DeleteMissionPage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('renders delete confirmation after mission is fetched', async () => {
    useRouter.mockReturnValue({ query: { id: '1' }, push: mockPush });
    // Mock fetch to return a mission.
    global.fetch = jest.fn((url) => {
      if (url === 'http://localhost:4000/api/missions/1') {
        return Promise.resolve({
          json: () => Promise.resolve({ id: 1, name: 'Apollo 11' }),
        });
      }
      return Promise.resolve();
    });
    render(<DeleteMissionPage />);
    await waitFor(() =>
      expect(screen.getByText(/Delete Confirmation/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/Apollo 11/i)).toBeInTheDocument();
  });

  test('calls DELETE fetch and navigates to "/missions" on confirm', async () => {
    useRouter.mockReturnValue({ query: { id: '1' }, push: mockPush });
    // Mock fetch: when DELETE is called, return OK; otherwise return the mission.
    global.fetch = jest.fn((url, options) => {
      if (options && options.method === 'DELETE') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'Apollo 11' }),
      });
    });
    render(<DeleteMissionPage />);
    await waitFor(() =>
      expect(screen.getByText(/Delete Confirmation/i)).toBeInTheDocument()
    );
    // Use role-based query to get the "Confirm" button.
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/missions/1',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(mockPush).toHaveBeenCalledWith('/missions');
    });
  });

  test('navigates to "/missions" when cancel is clicked', async () => {
    useRouter.mockReturnValue({ query: { id: '1' }, push: mockPush });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ id: 1, name: 'Apollo 11' }),
      })
    );
    render(<DeleteMissionPage />);
    await waitFor(() =>
      expect(screen.getByText(/Delete Confirmation/i)).toBeInTheDocument()
    );
    // Use role-based query to get the "Cancel" button.
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    expect(mockPush).toHaveBeenCalledWith('/missions');
  });

  test('logs error and remains in loading state if fetch fails', async () => {
    // Simulate a fetch error.
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    useRouter.mockReturnValue({ query: { id: '1' }, push: mockPush });
    global.fetch = jest.fn(() => Promise.reject('Fetch error'));
    render(<DeleteMissionPage />);
    await waitFor(() => {
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
