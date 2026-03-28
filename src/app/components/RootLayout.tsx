import { Outlet } from 'react-router';
import { useStore } from '../store';
import { Toast } from './ui';

function ToastWrapper() {
  const { toastMessage } = useStore();
  return <Toast message={toastMessage} />;
}

export default function RootLayout() {
  return (
    <>
      <Outlet />
      <ToastWrapper />
    </>
  );
}