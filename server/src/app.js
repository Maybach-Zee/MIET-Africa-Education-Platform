const routes = [
  { name: 'auth', mod: require('./routes/authRoutes') },
  { name: 'dashboard', mod: require('./routes/dashboardRoutes') },
  { name: 'resources', mod: require('./routes/resourceRoutes') },
  { name: 'centres', mod: require('./routes/centreRoutes') },
  { name: 'reports', mod: require('./routes/reportRoutes') },
  { name: 'events', mod: require('./routes/eventRoutes') },
  { name: 'donations', mod: require('./routes/donationRoutes') },
  { name: 'users', mod: require('./routes/userRoutes') },
  { name: 'enrolments', mod: require('./routes/enrolmentRoutes') },
  { name: 'assessments', mod: require('./routes/assessmentRoutes') },
  { name: 'certificates', mod: require('./routes/certificateRoutes') },
  { name: 'fees', mod: require('./routes/feeRoutes') }
];

routes.forEach(r => {
  if (typeof r.mod !== 'function') {
    console.error(`❌ Route "${r.name}" is not a function. Type: ${typeof r.mod}`);
  } else {
    console.log(`✅ ${r.name}`);
  }
});