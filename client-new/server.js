const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Check if certificates exist
  const keyPath = path.join(__dirname, 'certificates', 'localhost-key.pem');
  const certPath = path.join(__dirname, 'certificates', 'localhost.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('❌ SSL certificates not found!');
    console.log('');
    console.log('Please run the following command to generate certificates:');
    console.log('  bash generate-certificates.sh');
    console.log('');
    process.exit(1);
  }

  // HTTPS options
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath)
  };

  // Create HTTPS server
  const server = createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log('');
    console.log('🔒 HTTPS Server started successfully!');
    console.log('');
    console.log(`   ➜  Local:   https://${hostname}:${port}`);
    console.log(`   ➜  Network: https://127.0.0.1:${port}`);
    console.log('');
    console.log('⚠️  Note: You may see a security warning in your browser.');
    console.log('   This is normal for self-signed certificates in development.');
    console.log('   Click "Advanced" and "Proceed to localhost" to continue.');
    console.log('');
  });
});
