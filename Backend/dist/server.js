"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const db_1 = require("./config/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/reviews', reviewRoutes_1.default);
// Error Handling Middleware
app.use(errorHandler_1.errorHandler);
// Initialize DB and start server
(0, db_1.initializeDatabase)().then(() => {
    app.listen(port, () => {
        console.log(`Backend server running on port ${port}`);
    });
}).catch(err => {
    console.error('Failed to initialize database', err);
    process.exit(1);
});
