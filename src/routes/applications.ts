/**
 * Applications routes - CRUD operations for audition applications
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/index';
import { applications } from '../db/schema';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, ValidationError as ValidationErrorClass } from '../utils/errors';
import { validateString, validateEnum } from '../utils/validation';
import { logger } from '../utils/logger';

const router = Router();

// GET all applications
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(applications);
      logger.debug('Fetched all applications', { count: result.length });
      res.json(result);
    } catch (err) {
      logger.error('GET /api/applications failed', err);
      throw new Error('Failed to fetch applications');
    }
  })
);

// GET single application by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationErrorClass('Application ID is required');
    }

    try {
      const result = await db
        .select()
        .from(applications)
        .where(eq(applications.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new NotFoundError('Application');
      }

      res.json(result[0]);
    } catch (err) {
      logger.error(`GET /api/applications/${id} failed`, err);
      throw err;
    }
  })
);

// POST - Create or update application
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const appData = req.body;

    if (!appData.id) {
      throw new ValidationErrorClass('Application ID is required');
    }

    try {
      validateEnum(appData.status, ['pending', 'shortlisted', 'invited', 'accepted', 'declined']);
    } catch (err) {
      throw new ValidationErrorClass(
        err instanceof Error ? err.message : 'Invalid application data'
      );
    }

    try {
      const existing = await db
        .select()
        .from(applications)
        .where(eq(applications.id, appData.id))
        .limit(1);

      if (existing.length > 0) {
        // Update
        await db
          .update(applications)
          .set({
            castingCallId: appData.castingCallId,
            roleId: appData.roleId,
            actorId: appData.actorId,
            dateApplied: appData.dateApplied,
            status: appData.status,
            message: appData.message || null,
            selfTapeUrl: appData.selfTapeUrl || null,
            audioAuditionUrl: appData.audioAuditionUrl || null,
          })
          .where(eq(applications.id, appData.id));

        logger.info('Application updated', { applicationId: appData.id });
        res.json({ message: 'Application updated successfully', application: appData });
      } else {
        // Create
        await db.insert(applications).values({
          id: appData.id,
          castingCallId: appData.castingCallId,
          roleId: appData.roleId,
          actorId: appData.actorId,
          dateApplied: appData.dateApplied || new Date().toISOString(),
          status: appData.status,
          message: appData.message || null,
          selfTapeUrl: appData.selfTapeUrl || null,
          audioAuditionUrl: appData.audioAuditionUrl || null,
        });

        logger.info('Application created', { applicationId: appData.id });
        res.status(201).json({ message: 'Application created successfully', application: appData });
      }
    } catch (err) {
      logger.error('POST /api/applications failed', err);
      throw new Error('Failed to save application');
    }
  })
);

// PUT - Update application status
router.put(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      throw new ValidationErrorClass('Application ID is required');
    }

    try {
      validateEnum(status, ['pending', 'shortlisted', 'invited', 'accepted', 'declined']);
    } catch (err) {
      throw new ValidationErrorClass(
        err instanceof Error ? err.message : 'Invalid status'
      );
    }

    try {
      await db
        .update(applications)
        .set({ status })
        .where(eq(applications.id, id));

      logger.info('Application status updated', { applicationId: id, status });
      res.json({ success: true, message: 'Application status updated', status });
    } catch (err) {
      logger.error(`PUT /api/applications/${id}/status failed`, err);
      throw new Error('Failed to update application status');
    }
  })
);

// DELETE application
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationErrorClass('Application ID is required');
    }

    try {
      await db.delete(applications).where(eq(applications.id, id));

      logger.info('Application deleted', { applicationId: id });
      res.json({ success: true, message: 'Application deleted successfully' });
    } catch (err) {
      logger.error(`DELETE /api/applications/${id} failed`, err);
      throw new Error('Failed to delete application');
    }
  })
);

export default router;
