/*
import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import CreateMissionPage from '../client/pages/missions/create';
import { useRouter } from 'next/router';

const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock global.fetch for POST requests.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: 999 }),
  })
);

describe('CreateMissionPage', () => {
  let container, formWrapper;

  // Helper to fill all required fields with valid values.
  const fillValidData = () => {
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { value: 'Valid Mission' } });
    fireEvent.change(container.querySelector('select[name="status"]'), { target: { value: 'Ongoing' } });
    fireEvent.change(container.querySelector('select[name="type"]'), { target: { value: 'Exploration' } });
    fireEvent.change(container.querySelector('select[name="destination"]'), { target: { value: 'Mars' } });
    fireEvent.change(container.querySelector('input[name="launchDate"]'), { target: { value: '2025-12-01' } });
    fireEvent.change(container.querySelector('input[name="budget"]'), { target: { value: '1000000' } });
    fireEvent.change(container.querySelector('input[name="crewMembers"]'), { target: { value: '' } });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const rendered = render(<CreateMissionPage />);
    container = rendered.container;
    formWrapper = container.querySelector('.formWrapper');
  });

  test('updates the mission name field on change', () => {
    const nameInput = container.querySelector('input[name="name"]');
    expect(nameInput.value).toBe('');
    fireEvent.change(nameInput, { target: { value: 'Test Mission' } });
    expect(nameInput.value).toBe('Test Mission');
  });

  test('shows error when mission name is too short', async () => {
    fillValidData();
    const nameInput = container.querySelector('input[name="name"]');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-name')).toHaveTextContent(/at least 3 characters long/i);
    });
  });

  test('shows error when mission name contains invalid characters', async () => {
    fillValidData();
    const nameInput = container.querySelector('input[name="name"]');
    fireEvent.change(nameInput, { target: { value: 'Test@Mission' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-name')).toHaveTextContent(/contains invalid characters/i);
    });
  });

  test('shows error when status is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('select[name="status"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-status')).toHaveTextContent(/Status is required/i);
    });
  });

  test('shows error when mission type is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('select[name="type"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-type')).toHaveTextContent(/Mission Type is required/i);
    });
  });

  test('shows error when destination is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('select[name="destination"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-destination')).toHaveTextContent(/Destination is required/i);
    });
  });

  test('shows error when launch date is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="launchDate"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-launchDate')).toHaveTextContent(/Launch Date is required/i);
    });
  });

  test('shows error when budget is missing', async () => {
    fillValidData();
    fireEvent.change(container.querySelector('input[name="budget"]'), { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-budget')).toHaveTextContent(/Budget is required/i);
    });
  });

  test('shows error when budget is not a valid number', async () => {
    fillValidData();
    const budgetInput = container.querySelector('input[name="budget"]');
    fireEvent.change(budgetInput, { target: { value: 'abc' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-budget')).toHaveTextContent(/Budget must be a valid number/i);
    });
  });

  test('shows error when budget is negative', async () => {
    fillValidData();
    const budgetInput = container.querySelector('input[name="budget"]');
    fireEvent.change(budgetInput, { target: { value: '-100' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-budget')).toHaveTextContent(/Budget must be a positive number/i);
    });
  });

  test('shows error when crew members names are too short', async () => {
    fillValidData();
    const crewInput = container.querySelector('input[name="crewMembers"]');
    fireEvent.change(crewInput, { target: { value: 'A, B' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-crewMembers')).toHaveTextContent(/at least 2 characters long/i);
    });
  });

  test('shows error when crew members names contain invalid characters', async () => {
    fillValidData();
    const crewInput = container.querySelector('input[name="crewMembers"]');
    fireEvent.change(crewInput, { target: { value: 'Alice, Bob1' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(within(formWrapper).queryByTestId('error-crewMembers')).toHaveTextContent(/can only contain letters, spaces, hyphens, and apostrophes/i);
    });
  });

  test('calls router.push with "/missions" when cancel is clicked', () => {
    const cancelButton = container.querySelector('button[type="button"]');
    fireEvent.click(cancelButton);
    expect(mockPush).toHaveBeenCalledWith('/missions');
  });

  test('submits the form when valid data is entered (with crew members provided)', async () => {
    fillValidData();
    const crewInput = container.querySelector('input[name="crewMembers"]');
    fireEvent.change(crewInput, { target: { value: 'Alice, Bob' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    const fetchCall = global.fetch.mock.calls[0];
    const url = fetchCall[0];
    const options = fetchCall[1];
    const sentBody = JSON.parse(options.body);
    expect(url).toBe('http://localhost:4000/api/missions');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(sentBody).toEqual({
      name: 'Valid Mission',
      status: 'Ongoing',
      type: 'Exploration',
      destination: 'Mars',
      launchDate: '2025-12-01',
      budget: 1000000,
      crewMembers: ['Alice', 'Bob'],
    });
    expect(mockPush).toHaveBeenCalledWith('/missions');
  });

  test('submits the form when valid data is entered (with empty crew members)', async () => {
    fillValidData();
    const crewInput = container.querySelector('input[name="crewMembers"]');
    fireEvent.change(crewInput, { target: { value: '' } });
    fireEvent.click(container.querySelector('button[type="submit"]'));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    const fetchCall = global.fetch.mock.calls[0];
    const options = fetchCall[1];
    const sentBody = JSON.parse(options.body);
    expect(sentBody.crewMembers).toEqual([]);
    expect(mockPush).toHaveBeenCalledWith('/missions');
  });
});
*/