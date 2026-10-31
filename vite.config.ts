import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' permite desplegar en GitHub Pages / Netlify / Vercel sin cambios.
export default defineConfig({
  base: './',
  plugins: [react()],
});
