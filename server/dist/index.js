"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./db"));
const init_1 = require("./database/init");
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const chat_1 = __importDefault(require("./routes/chat"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Track visits
app.use(async (req, res, next) => {
    try {
        if (!req.path.startsWith('/api/')) {
            await db_1.default.query('INSERT INTO visits (ip_address, user_agent, page_path) VALUES ($1, $2, $3)', [req.ip, req.get('user-agent'), req.path]);
        }
    }
    catch (error) {
        // Ignore visit tracking errors
    }
    next();
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/chat', chat_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Imagination AI API',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'Login user',
                'POST /api/auth/forgot-password': 'Request password reset',
                'POST /api/auth/reset-password': 'Reset password with token',
                'GET /api/auth/me': 'Get current user (requires auth)',
            },
            admin: {
                'GET /api/admin/overview': 'Get overview metrics',
                'GET /api/admin/users': 'Get all users',
                'PATCH /api/admin/users/:id': 'Update user',
                'GET /api/admin/payments': 'Get all payments',
                'GET /api/admin/models': 'Get model coefficients',
                'PATCH /api/admin/models/:slug': 'Update model coefficient',
                'POST /api/admin/models/sync': 'Sync models from polza.ai',
                'GET /api/admin/generations': 'Get generation logs',
                'GET /api/admin/settings': 'Get settings',
                'PUT /api/admin/settings': 'Update settings',
            },
        },
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});
// Start server
const startServer = async () => {
    try {
        // Test database connection
        await db_1.default.query('SELECT NOW()');
        console.log('✅ Database connected');
        // Create tables
        await (0, init_1.createTables)();
        // Seed default data
        await (0, init_1.seedDefaultData)();
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 API docs available at http://localhost:${PORT}/api`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
