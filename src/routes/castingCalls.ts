/**
 * Casting Calls routes - CRUD operations for casting calls
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/index';
import { castingCalls } from '../db/schema';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, ValidationError as ValidationErrorClass } from '../utils/errors';
import { validateString } from '../utils/validation';
import { logger } from '../utils/logger';

const router = Router();

// GET all casting calls
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(castingCalls);
      logger.debug('Fetched all casting calls', { count: result.length });
      res.json(result);
    } catch (err) {
      logger.error('GET /api/casting-calls failed', err);
      throw new Error('Failed to fetch casting calls');
    }
  })
);

// GET single casting call by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationErrorClass('Casting call ID is required');
    }

    try {
      const result = await db
        .select()
        .from(castingCalls)
        .where(eq(castingCalls.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new NotFoundError('Casting call');
      }

      res.json(result[0]);
    } catch (err) {
      logger.error(`GET /api/casting-calls/${id} failed`, err);
      throw err;
    }
  })
);

// POST - Create or update casting call
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const callData = req.body;

    // Validation
    if (!callData.id) {
      throw new ValidationErrorClass('Casting call ID is required');
    }

    try {
      validateString(callData.title, 1, 255);
      validateString(callData.description, 10, 5000);
      validateString(callData.company, 1, 255);
    } catch (err) {
      throw new ValidationErrorClass(
        err instanceof Error ? err.message : 'Invalid casting call data'
      );
    }

    try {
      const existing = await db
        .select()
        .from(castingCalls)
        .where(eq(castingCalls.id, callData.id))
        .limit(1);

      if (existing.length > 0) {
        // Update
        await db
          .update(castingCalls)
          .set({
            title: callData.title,
            company: callData.company,
            director: callData.director,
            description: callData.description,
            location: callData.location,
            type: callData.type,
            roles: callData.roles || [],
            deadline: callData.deadline,
            budget: callData.budget,
            currency: callData.currency || 'KSh',
            status: callData.status || 'open',
            isVerified: callData.isVerified || false,
            imageUrl: callData.imageUrl || null,
          })
          .where(eq(castingCalls.id, callData.id));

        logger.info('Casting call updated', { castingCallId: callData.id });
        res.json({ message: 'Casting call updated successfully', castingCall: callData });
      } else {
        // Create
        await db.insert(castingCalls).values({
          id: callData.id,
          title: callData.title,
          company: callData.company,
          director: callData.director,
          description: callData.description,
          location: callData.location,
          type: callData.type,
          roles: callData.roles || [],
          dateCreated: callData.dateCreated || new Date().toISOString(),
          deadline: callData.deadline,
          budget: callData.budget,
          currency: callData.currency || 'KSh',
          status: callData.status || 'open',
          isVerified: callData.isVerified || false,
          imageUrl: callData.imageUrl || null,
        });

        logger.info('Casting call created', { castingCallId: callData.id });
        res.status(201).json({ message: 'Casting call created successfully', castingCall: callData });
      }
    } catch (err) {
      logger.error('POST /api/casting-calls failed', err);
      throw new Error('Failed to save casting call');
    }
  })
);

// DELETE casting call
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationErrorClass('Casting call ID is required');
    }

    try {
      await db.delete(castingCalls).where(eq(castingCalls.id, id));

      logger.info('Casting call deleted', { castingCallId: id });
      res.json({ success: true, message: 'Casting call deleted successfully' });
    } catch (err) {
      logger.error(`DELETE /api/casting-calls/${id} failed`, err);
      throw new Error('Failed to delete casting call');
    }
  })
);

export default router;
