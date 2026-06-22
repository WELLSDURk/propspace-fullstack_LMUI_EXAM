import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './server/routes/authRoutes';
import propertyRoutes from './server/routes/propertyRoutes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser Middleware
  app.use(express.json());

  // API routes bound first
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);

  // Vite integration middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware integrated.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PropSpace backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
