const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const locationRoutes = require('./routes/locationRoutes');
const sosRoutes = require('./routes/sosRoutes');
const safeWordRoutes = require('./routes/safeWordRoutes');
const safewordRoutes = require('./routes/safewordRoutes');  // New: /api/safeword
const threatRoutes = require('./routes/threatRoutes');
const journeyRoutes = require('./routes/journeyRoutes');

// Initialize app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Swagger API Docs ─────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'SafeWalk API Docs',
  customCss: `
    .topbar { background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important; }
    .topbar-wrapper img { content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛡️</text></svg>'); height:40px; }
    .topbar-wrapper .link span { display: none; }
    .swagger-ui .info .title { color: #1d4ed8; }
    body { background: #ffffff; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true
  }
}));
// ──────────────────────────────────────────────────────────────────────────────

// Root endpoint — serves HTML in browser, JSON for API clients
app.get('/', (req, res) => {
  const apiData = {
    success: true,
    message: 'SafeWalk API is running 🚀',
    endpoints: {
      health:   'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login:    'POST /api/auth/login'
      },
      user: {
        profile: 'GET /api/user/profile'
      },
      sos: {
        trigger: 'POST /api/sos/trigger',
        cancel:  'POST /api/sos/cancel',
        history: 'GET  /api/sos/history?userId=<id>'
      },
      location: {
        update: 'POST /api/location/update',
        get:    'GET  /api/location/:userId'
      },
      contacts: {
        add:    'POST   /api/contacts/add',
        get:    'GET    /api/contacts/:userId',
        delete: 'DELETE /api/contacts/:id'
      },
      safeword: {
        set:     'POST /api/safeword/set',
        trigger: 'POST /api/safeword/trigger'
      },
      journey: {
        start:   'POST /api/journey/start',
        end:     'POST /api/journey/end',
        history: 'GET  /api/journey/history?userId=<id>'
      },
      threat: {
        simulate: 'POST /api/threat/simulate'
      }
    }
  };

  // Return JSON when the client explicitly requests it (Postman, curl, fetch)
  const acceptsJson = req.headers['accept'] && req.headers['accept'].includes('application/json');
  if (acceptsJson) {
    return res.status(200).json(apiData);
  }

  // Otherwise serve a readable HTML page for browsers
  const rows = [
    ['GET',    '/health',                        'Health check'],
    ['POST',   '/api/auth/register',             'Register new user'],
    ['POST',   '/api/auth/login',                'Login & get JWT token'],
    ['GET',    '/api/user/profile',              'Get logged-in user profile (JWT)'],
    ['POST',   '/api/sos/trigger',               'Trigger SOS alert'],
    ['POST',   '/api/sos/cancel',                'Cancel an SOS alert'],
    ['GET',    '/api/sos/history?userId=&lt;id&gt;',   'Get SOS history for user'],
    ['POST',   '/api/location/update',           'Update live location'],
    ['GET',    '/api/location/:userId',          'Get latest location of user'],
    ['POST',   '/api/contacts/add',              'Add trusted contact'],
    ['GET',    '/api/contacts/:userId',          'Get all contacts for user'],
    ['DELETE', '/api/contacts/:id',              'Delete a contact'],
    ['POST',   '/api/safeword/set',              'Set safe word'],
    ['POST',   '/api/safeword/trigger',          'Trigger SOS via safe word'],
    ['POST',   '/api/journey/start',             'Start a journey'],
    ['POST',   '/api/journey/end',               'End a journey'],
    ['GET',    '/api/journey/history?userId=&lt;id&gt;', 'Get journey history'],
    ['POST',   '/api/threat/simulate',           'Simulate ambient threat'],
  ];

  const methodColor = { GET: '#22c55e', POST: '#3b82f6', DELETE: '#ef4444' };

  const tableRows = rows.map(([method, path, desc]) => `
    <tr>
      <td><span class="badge" style="background:${methodColor[method] || '#6b7280'}">${method}</span></td>
      <td><code>${path}</code></td>
      <td>${desc}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>SafeWalk API</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;padding:2rem}
    .container{max-width:900px;margin:0 auto}
    header{text-align:center;padding:2rem 0 3rem}
    header h1{font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,#f472b6,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    header p{color:#94a3b8;margin-top:.5rem;font-size:1.1rem}
    .status{display:inline-flex;align-items:center;gap:.5rem;background:#14532d;border:1px solid #166534;color:#4ade80;padding:.4rem 1rem;border-radius:9999px;font-size:.85rem;margin-top:1rem}
    .status::before{content:'';width:8px;height:8px;border-radius:50%;background:#4ade80;animation:pulse 1.5s infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    table{width:100%;border-collapse:collapse;background:#1e293b;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.4)}
    thead tr{background:#334155}
    th{padding:1rem 1.25rem;text-align:left;font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;font-weight:600}
    td{padding:.9rem 1.25rem;border-top:1px solid #334155;font-size:.9rem;vertical-align:middle}
    tr:hover td{background:#273448}
    .badge{padding:.25rem .6rem;border-radius:6px;font-size:.75rem;font-weight:700;color:#fff;letter-spacing:.04em}
    code{background:#0f172a;padding:.2rem .5rem;border-radius:6px;font-family:'Courier New',monospace;font-size:.85rem;color:#93c5fd}
    footer{text-align:center;color:#475569;margin-top:2rem;font-size:.8rem}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🛡️ SafeWalk API</h1>
      <p>AI-Powered Women Safety Backend</p>
      <div class="status">Server is running on port ${process.env.PORT || 5000}</div>
    </header>
    <table>
      <thead>
        <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    <footer><p style="margin-top:1.5rem">SafeWalk Backend &bull; All systems operational</p></footer>
  </div>
</body>
</html>`;

  res.status(200).send(html);
});

// Health check — also returns API status
app.get('/health', (req, res) => {
  // Redirect browser requests to the full API reference page
  return res.redirect('/');
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/safe-word', safeWordRoutes);  // Legacy: JWT-protected safe word check
app.use('/api/safeword', safewordRoutes);   // New: set safe word & trigger SOS
app.use('/api/threat', threatRoutes);
app.use('/api/journey', journeyRoutes);

// Fallback 404 Route for unmatched paths
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
