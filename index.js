const express = require('express');
const bodyParser = require('body-parser');
const promClient = require('prom-client');

const app = express();
const port = 3000;

// Prometheus metrics initialization
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'nodejs_crud_app_' });

// Example metric: HTTP requests count
const httpRequestCount = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests received',
    labelNames: ['method', 'endpoint'],
});

// Dummy user data store (in-memory for simplicity)
let users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
];
let nextUserId = 3;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Endpoint for fetching all users
app.get('/users', (req, res) => {
    res.json(users);
    httpRequestCount.inc({ method: 'GET', endpoint: '/users' });
});

// Endpoint for creating a new user
app.post('/users', (req, res) => {
    const { name } = req.body;
    const newUser = { id: nextUserId++, name };
    users.push(newUser);
    res.status(201).json(newUser);
    httpRequestCount.inc({ method: 'POST', endpoint: '/users' });
});

// Endpoint for fetching a single user by ID
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (user) {
        res.json(user);
        httpRequestCount.inc({ method: 'GET', endpoint: `/users/${userId}` });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Endpoint for updating a user by ID
app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { name } = req.body;
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].name = name;
        res.json(users[userIndex]);
        httpRequestCount.inc({ method: 'PUT', endpoint: `/users/${userId}` });
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

// Endpoint for deleting a user by ID
app.delete('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    users = users.filter(u => u.id !== userId);
    res.status(204).end();
    httpRequestCount.inc({ method: 'DELETE', endpoint: `/users/${userId}` });
});

// Endpoint for Prometheus metrics
app.get('/metrics', (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(promClient.register.metrics());
});

// Start the server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
