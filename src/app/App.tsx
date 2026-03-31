import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreProvider } from './store';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
      <Analytics />
      <SpeedInsights />
    </StoreProvider>
  );
}