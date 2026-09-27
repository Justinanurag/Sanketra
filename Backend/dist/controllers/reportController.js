"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReport = exports.getReportById = exports.getReports = exports.createReport = void 0;
const db_1 = require("../config/db");
const zod_1 = require("zod");
const createReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    type: zod_1.z.string(),
    occurredAt: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    hazardName: zod_1.z.string().optional(),
    energySource: zod_1.z.string().optional(),
    humanExposure: zod_1.z.string().optional(),
    barrierName: zod_1.z.string().optional(),
    barrierStatus: zod_1.z.string().optional(),
    consequence: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const createReport = async (req, res, next) => {
    try {
        const validatedData = createReportSchema.parse(req.body);
        const result = await (0, db_1.query)(`INSERT INTO reports (
        title, description, report_type, site_location, incident_date, 
        hazard_name, energy_source, human_exposure, barrier_name, barrier_status, 
        consequence, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`, [
            validatedData.title,
            validatedData.description,
            validatedData.type,
            validatedData.location,
            validatedData.occurredAt ? new Date(validatedData.occurredAt) : new Date(),
            validatedData.hazardName,
            validatedData.energySource,
            validatedData.humanExposure,
            validatedData.barrierName,
            validatedData.barrierStatus,
            validatedData.consequence,
            validatedData.notes
        ]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.issues });
        }
        else {
            next(error);
        }
    }
};
exports.createReport = createReport;
const getReports = async (req, res, next) => {
    try {
        const result = await (0, db_1.query)('SELECT * FROM reports ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    }
    catch (error) {
        next(error);
    }
};
exports.getReports = getReports;
const getReportById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('SELECT * FROM reports WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        next(error);
    }
};
exports.getReportById = getReportById;
const node_fetch_1 = __importDefault(require("node-fetch"));
const analyzeReport = async (req, res, next) => {
    try {
        const { id } = req.params;
        // 1. Fetch the report
        const result = await (0, db_1.query)('SELECT * FROM reports WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        const report = result.rows[0];
        // 2. Call AI Service
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/analyze';
        const aiResponse = await (0, node_fetch_1.default)(aiServiceUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: report.id.toString(),
                title: report.title,
                description: report.description,
                report_type: report.report_type,
                location: report.site_location
            })
        });
        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            console.error('AI Service Error:', errText);
            res.status(502).json({ error: 'Failed to analyze report via AI service' });
            return;
        }
        const aiData = await aiResponse.json();
        // 3. Update the report in the database with AI findings
        // In a full implementation, we might store this in a separate 'safety_event_drafts' table
        // For now, we update the main report record with extracted facts.
        await (0, db_1.query)(`UPDATE reports SET 
        hazard_name = COALESCE($1, hazard_name),
        energy_source = COALESCE($2, energy_source),
        human_exposure = COALESCE($3, human_exposure),
        barrier_name = COALESCE($4, barrier_name),
        barrier_status = COALESCE($5, barrier_status),
        consequence = COALESCE($6, consequence),
        sif_potential = COALESCE($7, sif_potential),
        analysis = COALESCE($8, analysis)
       WHERE id = $9`, [
            aiData.hazard_name,
            aiData.energy_source,
            aiData.human_exposure,
            aiData.barrier_name,
            aiData.barrier_status,
            aiData.consequence,
            aiData.sif_potential,
            JSON.stringify(aiData.analysis),
            id
        ]);
        res.status(200).json(aiData);
    }
    catch (error) {
        next(error);
    }
};
exports.analyzeReport = analyzeReport;
