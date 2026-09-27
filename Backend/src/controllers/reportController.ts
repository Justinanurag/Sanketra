import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { z } from 'zod';

const createReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string(),
  occurredAt: z.string().optional(),
  location: z.string().optional(),
  hazardName: z.string().optional(),
  energySource: z.string().optional(),
  humanExposure: z.string().optional(),
  barrierName: z.string().optional(),
  barrierStatus: z.string().optional(),
  consequence: z.string().optional(),
  notes: z.string().optional(),
});

export const createReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createReportSchema.parse(req.body);
    
    const result = await query(
      `INSERT INTO reports (
        title, description, report_type, site_location, incident_date, 
        hazard_name, energy_source, human_exposure, barrier_name, barrier_status, 
        consequence, notes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
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
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      next(error);
    }
  }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM reports ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM reports WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

import fetch from 'node-fetch';

export const analyzeReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch the report
    const result = await query('SELECT * FROM reports WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    const report = result.rows[0];

    // 2. Call AI Service
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/api/analyze';
    const aiResponse = await fetch(aiServiceUrl, {
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
    await query(
      `UPDATE reports SET 
        hazard_name = COALESCE($1, hazard_name),
        energy_source = COALESCE($2, energy_source),
        human_exposure = COALESCE($3, human_exposure),
        barrier_name = COALESCE($4, barrier_name),
        barrier_status = COALESCE($5, barrier_status),
        consequence = COALESCE($6, consequence),
        sif_potential = COALESCE($7, sif_potential),
        analysis = COALESCE($8, analysis)
       WHERE id = $9`,
      [
        aiData.hazard_name,
        aiData.energy_source,
        aiData.human_exposure,
        aiData.barrier_name,
        aiData.barrier_status,
        aiData.consequence,
        aiData.sif_potential,
        JSON.stringify(aiData.analysis),
        id
      ]
    );

    res.status(200).json(aiData);
  } catch (error) {
    next(error);
  }
};
