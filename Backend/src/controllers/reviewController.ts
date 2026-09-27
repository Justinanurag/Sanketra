import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { z } from 'zod';

const reviewSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'edited']),
  comments: z.string().optional(),
  reviewer: z.string().default('Safety Officer'), // normally pulled from req.user
});

export const submitReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: reportId } = req.params;
    const validatedData = reviewSchema.parse(req.body);

    // 1. Check if report exists
    const reportRes = await query('SELECT * FROM reports WHERE id = $1', [reportId]);
    if (reportRes.rows.length === 0) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    const report = reportRes.rows[0];

    // 2. Insert Review Record
    const reviewRes = await query(
      `INSERT INTO reviews (report_id, reviewer, role, decision, comments) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [reportId, validatedData.reviewer, 'Safety Officer', validatedData.decision, validatedData.comments]
    );

    let safetyEvent = null;

    // 3. If approved or edited, generate final Safety Event
    if (validatedData.decision === 'approved' || validatedData.decision === 'edited') {
      const eventRes = await query(
        `INSERT INTO safety_events (report_id, title, sif_potential, decision, reviewer, hazard_name, barrier_status, summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          reportId, 
          report.title, 
          report.sif_potential || 'undetermined', 
          validatedData.decision, 
          validatedData.reviewer, 
          report.hazard_name, 
          report.barrier_status, 
          validatedData.comments || report.description
        ]
      );
      safetyEvent = eventRes.rows[0];
    }

    // 4. Create Audit Log
    await query(
      `INSERT INTO audit_logs (user_name, action, entity, entity_id, previous_value, new_value, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        validatedData.reviewer,
        `REVIEW_${validatedData.decision.toUpperCase()}`,
        'reports',
        reportId,
        'needs_review',
        validatedData.decision,
        validatedData.comments
      ]
    );

    res.status(200).json({ review: reviewRes.rows[0], event: safetyEvent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      next(error);
    }
  }
};
