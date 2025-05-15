import '@testing-library/jest-dom';
import 'whatwg-fetch';
import React from 'react';
jest.mock('react-chartjs-2', () => ({
    Line: () => <div data-testid="mock-line-chart" />,
    Bar: () => <div data-testid="mock-bar-chart" />,
  }));
  