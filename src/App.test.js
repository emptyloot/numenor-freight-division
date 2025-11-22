import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('./components/homepage/Homepage.js', () => () => <div data-testid="homepage">Homepage</div>);
jest.mock('./components/background/Background.js', () => () => <div data-testid="background">Background</div>);
jest.mock('./components/header/Header.js', () => () => <div data-testid="header">Header</div>);
jest.mock('./components/about/About.js', () => () => <div data-testid="about">About</div>);
jest.mock('./components/schedule/CreateShipment.js', () => () => (
  <div data-testid="create-shipment">CreateShipment</div>
));
jest.mock('./components/auth/ProtectedRoute.js', () => ({ children }) => (
  <div data-testid="protected-route">{children}</div>
));
jest.mock('./components/auth/AuthCallback.js', () => () => <div data-testid="auth-callback">AuthCallback</div>);
jest.mock('./components/dashboard/Dashboard.js', () => () => <div data-testid="dashboard">Dashboard</div>);
jest.mock('./components/dashboard/ShipmentDetails.js', () => () => (
  <div data-testid="shipment-details">ShipmentDetails</div>
));

describe('App component', () => {
  test('renders homepage by default', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('homepage')).toBeInTheDocument();
  });

  test('renders about page on /about route', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/about']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('about')).toBeInTheDocument();
  });

  test('renders create shipment page on /schedule route within a protected route', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/schedule']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('create-shipment')).toBeInTheDocument();
  });

  test('renders dashboard page on /dashboard route within a protected route', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  test('renders shipment details page on /shipment/:shipmentId route within a protected route', () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        initialEntries={['/shipment/123']}
      >
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('shipment-details')).toBeInTheDocument();
  });

  test('renders auth callback page on /auth/callback route', () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        initialEntries={['/auth/callback']}
      >
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId('auth-callback')).toBeInTheDocument();
  });

  test('renders background and header on all routes', () => {
    const routes = ['/', '/about', '/schedule', '/dashboard', '/shipment/123', '/auth/callback'];
    routes.forEach((route) => {
      render(
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }} initialEntries={[route]}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByTestId('background')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      cleanup();
    });
  });
});
