import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/kws2100-publishing-a-map-application-baambii/' : '/',
  plugins: [react()]
});
#hi
