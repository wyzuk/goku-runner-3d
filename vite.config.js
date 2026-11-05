import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'serve-3dmodels-as-models',
      configureServer(server) {
        server.middlewares.use('/models', (req, res, next) => {
          const cleanUrl = req.url.split('?')[0];
          const decodedPath = decodeURIComponent(cleanUrl);
          const filePath = path.join(process.cwd(), '3dmodels', decodedPath);

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes = {
              '.glb': 'model/gltf-binary',
              '.gltf': 'model/gltf+json',
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.json': 'application/json'
            };
            if (mimeTypes[ext]) {
              res.setHeader('Content-Type', mimeTypes[ext]);
            }
            fs.createReadStream(filePath).pipe(res);
            return;
          }
          next();
        });
      },
      closeBundle() {
        const srcDir = path.join(process.cwd(), '3dmodels');
        const destDir = path.join(process.cwd(), 'dist', 'models');
        if (fs.existsSync(srcDir)) {
          fs.cpSync(srcDir, destDir, {
            recursive: true,
            filter: (src) => !src.endsWith('.zip')
          });
        }
      }
    }
  ],
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
