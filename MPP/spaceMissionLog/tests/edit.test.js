/*
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import EditMissionPage from '../client/pages/missions/[id]/edit';
import { useRouter } from 'next/router';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ query: { id: '1' }, push: mockPush }),
}));

// Mock global.fetch for both GET and PUT requests.
global.fetch = jest.fn((url, options) => {
  if (options && options.method === 'PUT') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }
  // Return initial mission data
  return Promise.resolve({
    json: () =>
      Promise.resolve({
        name: 'Original Mission',
        status: 'Ongoing',
        type: 'Exploration',
        destination: 'Mars',
        launchDate: '2025-03-22',
        budget: 500000,
        crewMembers: ['Alice'],
      }),
  });
});

describe('EditMissionPage', () => {
  let container, formWrapper;

  const fillValidData = () => {
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'Updated Mission' } });
    fireEvent.change(container.querySelector('select[name="status"]'), { target: { value: 'Completed' } });
    fireEvent.change(container.querySelector('select[name="type"]'), { target: { value: 'Deployment' } });
    fireEvent.change(container.querySelector('select[name="destination"]'), { target: { value: 'Jupiter' } });
    fireEvent.change(container.querySelector('input[name="launchDate"]'), { target: { value: '2025-04-01' } });
    fireEvent.change(container.querySelector('input[name="budget"]'), { target: { value: '600000' } });
    fireEvent.change(container.querySelector('input[name="crewMembers"]'), { target: { value: 'Bob, Charlie' } });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const rendered = render(<EditMissionPage />);
    container = rendered.container;
    formWrapper = container.querySelector('.formWrapper');
    // Wait for initial data to be loaded.
    await waitFor(() => expect(screen.getByDisplayValue('Original Mission')).toBeInTheDocument());
  });

  test('loads and displays initial mission data', async () => {
    expect(screen.getByDisplayValue('Original Mission')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ongoing')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Exploration')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mars')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-03-22')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
  });

  test('shows validation error when mission name is too short', async () => {
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'A' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-name');
    expect(error).toHaveTextContent(/at least 3 characters long/i);
  });

  test('shows validation error when mission name contains invalid characters', async () => {
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'Test@Mission' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-name');
    expect(error).toHaveTextContent(/contains invalid characters/i);
  });

  test('shows validation error when status is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('select[name="status"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-status');
    expect(error).toHaveTextContent(/Status is required/i);
  });

  test('shows validation error when mission type is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('select[name="type"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-type');
    expect(error).toHaveTextContent(/Mission Type is required/i);
  });

  test('shows validation error when destination is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('select[name="destination"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-destination');
    expect(error).toHaveTextContent(/Destination is required/i);
  });

  test('shows validation error when launch date is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="launchDate"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-launchDate');
    expect(error).toHaveTextContent(/Launch Date is required/i);
  });

  test('shows validation error when budget is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="budget"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-budget');
    expect(error).toHaveTextContent(/Budget is required/i);
  });

  test('shows validation error when budget is not a valid number', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="budget"]'), { target: { value: 'abc' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-budget');
    expect(error).toHaveTextContent(/Budget must be a valid number/i);
  });

  test('shows validation error when budget is negative', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="budget"]'), { target: { value: '-100' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-budget');
    expect(error).toHaveTextContent(/Budget must be a positive number/i);
  });

  test('shows validation error when crew members names are too short', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="crewMembers"]'), { target: { value: 'A, B' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-crewMembers');
    expect(error).toHaveTextContent(/at least 2 characters long/i);
  });

  test('shows validation error when crew members names contain invalid characters', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="crewMembers"]'), { target: { value: 'Alice, Bob1' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    const error = await within(formWrapper).findByTestId('error-crewMembers');
    expect(error).toHaveTextContent(/can only contain letters, spaces, hyphens, and apostrophes/i);
  });

  test('calls router.push with "/missions" when cancel is clicked', async () => {
    const cancelButton = container.querySelector('button[type="button"]');
    fireEvent.click(cancelButton);
    expect(mockPush).toHaveBeenCalledWith('/missions');
  });

  test('submits the form when valid data is entered', async () => {
    fillValidData();
    // Change a few fields
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'Updated Mission' } });
    fireEvent.change(container.querySelector('input[name="budget"]'), { target: { value: '650000' } });
    fireEvent.change(container.querySelector('input[name="crewMembers"]'), { target: { value: 'Alice, Bob' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/missions/1',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/missions');
    });
  });
});
*/