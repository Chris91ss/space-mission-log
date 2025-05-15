/*
import React from 'react';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import MissionsListPage from '../client/pages/missions/index';
import { faker } from '@faker-js/faker';

// Create a fake mission list for initial fetch.
const fakeMissions = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Mission ${i + 1}`,
  status: i % 2 === 0 ? 'Ongoing' : 'Completed',
  type: 'Exploration',
  destination: i % 3 === 0 ? 'Mars' : 'Moon',
  launchDate: '2025-01-01',
  budget: 1000000 + i * 50000,
  crewMembers: ['Alice', 'Bob'],
}));

// Reset fetch mock before each test.
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(fakeMissions),
    })
  );
});

describe('MissionsListPage', () => {
  test('renders mission list and displays mission data', async () => {
    render(<MissionsListPage />);
    // Wait for a mission to be displayed.
    await waitFor(() => expect(screen.getByText(/Mission 1/i)).toBeInTheDocument());
    expect(screen.getByText(/Ongoing/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1000000/i)).toBeInTheDocument();
  });

  test('filters missions based on search term', async () => {
    render(<MissionsListPage />);
    await waitFor(() => expect(screen.getByText(/Mission 1/i)).toBeInTheDocument());
    const searchInput = screen.getByPlaceholderText(/Search/i);
    // Type a search term that matches a specific mission.
    fireEvent.change(searchInput, { target: { value: 'Mission 10' } });
    await waitFor(() => {
      expect(screen.getByText(/Mission 10/i)).toBeInTheDocument();
      expect(screen.queryByText(/Mission 1/i)).toBeNull();
    });
  });

  test('changes filter type and shows filtered results', async () => {
    render(<MissionsListPage />);
    await waitFor(() => expect(screen.getByText(/Mission 1/i)).toBeInTheDocument());
    const filterSelect = screen.getByRole('combobox');
    // Change filter type to "status" and search for "completed"
    fireEvent.change(filterSelect, { target: { value: 'status' } });
    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: 'completed' } });
    await waitFor(() => {
      // Missions with status "Completed" should be visible.
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();
    });
  });

  test('displays statistics summary when missions have budgets and launch dates', async () => {
    render(<MissionsListPage />);
    await waitFor(() => expect(screen.getByText(/Mission 1/i)).toBeInTheDocument());
    // Check for at least one statistic (budget or launch date)
    expect(screen.getByText(/Most Expensive Mission:/i)).toBeInTheDocument();
    expect(screen.getByText(/Average Budget:/i)).toBeInTheDocument();
    expect(screen.getByText(/Least Expensive Mission:/i)).toBeInTheDocument();
    expect(screen.getByText(/Earliest Launch Date:/i)).toBeInTheDocument();
    expect(screen.getByText(/Latest Launch Date:/i)).toBeInTheDocument();
  });

  test('applies correct budget color based on bucket', async () => {
    render(<MissionsListPage />);
    await waitFor(() => expect(screen.getByText(/Mission 1/i)).toBeInTheDocument());
    // Get a cell from the table (budget cell)
    const budgetCell = screen.getByText(/\$1000000/);
    // We expect the style.backgroundColor to be one of the defined values.
    expect(['#a3e635', '#facc15', '#f87171', 'inherit']).toContain(budgetCell.style.backgroundColor);
  });

  test('handles pagination correctly when page size is changed', async () => {
    render(<MissionsListPage />);
    await waitFor(() => expect(screen.getByText(/Mission 1/i)).toBeInTheDocument());
    // Default page size is 10, so Mission 11 should not be visible initially.
    expect(screen.queryByText(/Mission 11/i)).toBeNull();
    // Change page size to "all"
    const pageSizeSelect = screen.getByRole('combobox');
    fireEvent.change(pageSizeSelect, { target: { value: 'all' } });
    await waitFor(() => expect(screen.getByText(/Mission 11/i)).toBeInTheDocument());
  });

  test('changes page when pagination button is clicked', async () => {
    render(<MissionsListPage />);
    await waitFor(() => expect(screen.getByText(/Mission 1/i)).toBeInTheDocument());
    // Set page size to 10.
    const pageSizeSelect = screen.getByRole('combobox');
    fireEvent.change(pageSizeSelect, { target: { value: '10' } });
    // Click page 2.
    fireEvent.click(screen.getByText('2'));
    await waitFor(() => {
      expect(screen.getByText(/Mission 11/i)).toBeInTheDocument();
    });
  });

  test('handles auto-generation: start and stop generation', async () => {
    jest.useFakeTimers();
    render(<MissionsListPage />);
    // Click start generation.
    const startButton = screen.getByText(/Start Generation/i);
    fireEvent.click(startButton);
    // Advance timers to simulate auto-generation.
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    // Verify that "Generated:" count is updated (should be > 0).
    expect(screen.getByText(/Generated:/i).textContent).toMatch(/\d+/);
    // Click stop generation.
    const stopButton = screen.getByText(/Stop Generation/i);
    fireEvent.click(stopButton);
    // Advance timers to check that count does not change further.
    const countBefore = screen.getByText(/Generated:/i).textContent;
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    const countAfter = screen.getByText(/Generated:/i).textContent;
    expect(countAfter).toEqual(countBefore);
    jest.useRealTimers();
  });
});
*/