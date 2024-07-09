const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { collectDefaultMetrics, register, Counter, Gauge } = require('prom-client');
const os = require('os');
const osu = require('os-utils');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB (assuming a local MongoDB instance)
mongoose.connect('mongodb://localhost/userdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define a user schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number
});
const User = mongoose.model('User', userSchema);

// Prometheus metrics
collectDefaultMetrics();

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const cpuUsageGauge = new Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage percentage'
});

// Function to update CPU usage gauge
setInterval(() => {
  osu.cpuUsage((v) => {
    cpuUsageGauge.set(v * 100);
  });
}, 5000);

// CRUD API routes

// Create a new user
app.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    httpRequestCounter.inc({ method: 'POST', route: '/users', status_code: 201 });
    res.status(201).send(user);
  } catch (error) {
    httpRequestCounter.inc({ method: 'POST', route: '/users', status_code: 400 });
    res.status(400).send(error);
  }
});

// Read all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    httpRequestCounter.inc({ method: 'GET', route: '/users', status_code: 200 });
    res.status(200).send(users);
  } catch (error) {
    httpRequestCounter.inc({ method: 'GET', route: '/users', status_code: 500 });
    res.status(500).send(error);
  }
});

// Read a single user
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      httpRequestCounter.inc({ method: 'GET', route: '/users/:id', status_code: 404 });
      return res.status(404).send();
    }
    httpRequestCounter.inc({ method: 'GET', route: '/users/:id', status_code: 200 });
    res.status(200).send(user);
  } catch (error) {
    httpRequestCounter.inc({ method: 'GET', route: '/users/:id', status_code: 500 });
    res.status(500).send(error);
  }
});

// Update a user
app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) {
      httpRequestCounter.inc({ method: 'PUT', route: '/users/:id', status_code: 404 });
      return res.status(404).send();
    }
    httpRequestCounter.inc({ method: 'PUT', route: '/users/:id', status_code: 200 });
    res.status(200).send(user);
  } catch (error) {
    httpRequestCounter.inc({ method: 'PUT', route: '/users/:id', status_code: 400 });
    res.status(400).send(error);
  }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      httpRequestCounter.inc({ method: 'DELETE', route: '/users/:id', status_code: 404 });
      return res.status(404).send();
    }
    httpRequestCounter.inc({ method: 'DELETE', route: '/users/:id', status_code: 200 });
    res.status(200).send(user);
  } catch (error) {
    httpRequestCounter.inc({ method: 'DELETE', route: '/users/:id', status_code: 500 });
    res.status(500).send(error);
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
