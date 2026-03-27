import { Outlet } from 'react-router';
import { StoreProvider, useStore } from '../store';
import { Toast } from './ui';

function ToastWrapper() {
  const { toastMessage } = useStore();
  return <Toast message={toastMessage} />;
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <Outlet />
      <ToastWrapper />
    </StoreProvider>
  );
}