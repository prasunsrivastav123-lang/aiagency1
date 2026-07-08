'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';

const queryClient = new QueryClient();

export function Providers({ children }) {
  console.log(
    "CLIENT ID:",
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  );

  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}