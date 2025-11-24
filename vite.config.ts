import path from 'path';
import { defineConfig } from 'vite';


export default defineConfig(({ mode }) => {

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [],
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
