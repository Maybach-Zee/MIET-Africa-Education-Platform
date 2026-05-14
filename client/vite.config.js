import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // This enables the modern JSX transform (React 17+)
      // so you don't need `import React from 'react'` in every file
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    port: 5173,
  },
});