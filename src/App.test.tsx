import { render, screen } from '@testing-library/react';
import App from './App';
import { server, baseURL } from './mocks/server';

 // Establish API mocking before all tests.
 beforeAll(() => server.listen());
 // Reset any request handlers that we may add during the tests,
 // so they don't affect other tests.
 afterEach(() => server.resetHandlers());
 // Clean up after the tests are finished.
 afterAll(() => server.close());

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('should return success', async () => {
  // Act
  const response = await fetch(`${baseURL}/test200`);
  // Assert
  expect.assertions(1);
  await expect(response.json()).resolves.toBe('success');
});
