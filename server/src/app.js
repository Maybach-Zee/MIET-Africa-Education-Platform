const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import all routes (we'll check them as we mount)
const routeDefinitions = [
  { path: '/api/auth',        route: require('./routes/authRoutes') },
  { path: '/api/dashboard',   route: require('./routes/dashboardRoutes') },
  { path: '/api/resources',   route: require('./routes/resourceRoutes') },
  { path: '/api/centres',     route: require('./routes/centreRoutes') },
  { path: '/api/reports',     route: require('./routes/reportRoutes') },
  { path: '/api/events',      route: require('./routes/eventRoutes') },
  { path: '/api/donations',   route: require('./routes/donationRoutes') },
  { path: '/api/users',       route: require('./routes/userRoutes') },
  { path: '/api/enrolments',  route: require('./routes/enrolmentRoutes') },
  { path: '/api/assessments', route: require('./routes/assessmentRoutes') },
  { path: '/api/certificates',route: require('./routes/certificateRoutes') },
  { path: '/api/fees',        route: require('./routes/feeRoutes') },
  { path: '/api/locations',   route: require('./routes/locationRoutes')},
  { path: '/api/provinces',   route: require('./routes/provinceRoutes')},
];

// Mount routes and validate they are Express routers
routeDefinitions.forEach(({ path, route }) => {
  if (typeof route === 'function') {
    app.use(path, route);
    console.log(`✅ Mounted ${path}`);
  } else {
    console.error(`❌ Failed to mount ${path} – not a function (type: ${typeof route})`);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;