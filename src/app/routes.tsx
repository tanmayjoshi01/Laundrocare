import { createBrowserRouter } from 'react-router';
import RootLayout from './components/RootLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateOrderPage from './pages/CreateOrderPage';
import BillingPage from './pages/BillingPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import CheckoutPage from './pages/CheckoutPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import AdminLayout from './components/AdminLayout';
import DeliveryPage from './pages/DeliveryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'login', Component: LoginPage },
      {
        Component: AdminLayout,
        children: [
          { path: 'dashboard', Component: DashboardPage },
          { path: 'create-order', Component: CreateOrderPage },
          { path: 'billing', Component: BillingPage },
          { path: 'orders', Component: OrdersPage },
          { path: 'customers', Component: CustomersPage },
          { path: 'settings', Component: SettingsPage },
          { path: 'reports', Component: ReportsPage },
          { path: 'checkout/:orderId', Component: CheckoutPage },
          { path: 'register-customer', Component: RegisterCustomerPage },
          { path: 'delivery/:orderId', Component: DeliveryPage },
        ],
      },
    ],
  },
]);