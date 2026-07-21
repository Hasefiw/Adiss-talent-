/**
 * Actor routes - CRUD operations for actor profiles
 */

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db/index';
import { actors, applications } from '../db/schema';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, ValidationError as ValidationErrorClass } from '../utils/errors';
import { validateString, validateEmail, validatePhone } from '../utils/validation';
import { logger } from '../utils/logger';

const router = Router();

// GET all actors
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(actors);
      logger.debug('Fetched all actors', { count: result.length });
      res.json(result);
    } catch (err) {
      logger.error('GET /api/actors failed', err);
      throw new Error('Failed to fetch actors');
    }
  })
);

// GET single actor by ID
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationErrorClass('Actor ID is required');
    }

    try {
      const result = await db
        .select()
        .from(actors)
        .where(eq(actors.id, id))
        .limit(1);

      if (result.length === 0) {
        throw new NotFoundError('Actor');
      }

      res.json(result[0]);
    } catch (err) {
      logger.error(`GET /api/actors/${id} failed`, err);
      throw err;
    }
  })
);

// POST - Create or update actor
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const actorData = req.body;

    // Validation
    if (!actorData.id) {
      throw new ValidationErrorClass('Actor ID is required');
    }

    try {
      validateString(actorData.name, 1, 255);
      validateEmail(actorData.contactEmail);
      validatePhone(actorData.phone);
    } catch (err) {
      throw new ValidationErrorClass(
        err instanceof Error ? err.message : 'Invalid actor data'
      );
    }

    try {
      const existing = await db
        .select()
        .from(actors)
        .where(eq(actors.id, actorData.id))
        .limit(1);

      if (existing.length > 0) {
        // Update
        await db
          .update(actors)
          .set({
            name: actorData.name,
            type: actorData.type,
            gender: actorData.gender,
            age: actorData.age,
            heightCm: actorData.heightCm,
            eyeColor: actorData.eyeColor,
            hairColor: actorData.hairColor,
            hairLength: actorData.hairLength,
            ethnicity: actorData.ethnicity,
            location: actorData.location,
            bio: actorData.bio,
            skills: actorData.skills || [],
            experience: actorData.experience || [],
            headshotUrl: actorData.headshotUrl,
            contactEmail: actorData.contactEmail,
            phone: actorData.phone,
            instagram: actorData.instagram || null,
            website: actorData.website || null,
            isVerified: actorData.isVerified || false,
            isPremium: actorData.isPremium || false,
            professionalPhotos: actorData.professionalPhotos || [],
            languages: actorData.languages || [],
            mediaReels: actorData.mediaReels || {},
          })
          .where(eq(actors.id, actorData.id));

        logger.info('Actor updated', { actorId: actorData.id });
        res.json({ message: 'Actor profile updated successfully', actor: actorData });
      } else {
        // Create
        await db.insert(actors).values({
          id: actorData.id,
          name: actorData.name,
          type: actorData.type,
          gender: actorData.gender,
          age: actorData.age,
          heightCm: actorData.heightCm,
          eyeColor: actorData.eyeColor,
          hairColor: actorData.hairColor,
          hairLength: actorData.hairLength,
          ethnicity: actorData.ethnicity,
          location: actorData.location,
          bio: actorData.bio,
          skills: actorData.skills || [],
          experience: actorData.experience || [],
          headshotUrl: actorData.headshotUrl,
          contactEmail: actorData.contactEmail,
          phone: actorData.phone,
          instagram: actorData.instagram || null,
          website: actorData.website || null,
          createdAt: actorData.createdAt || new Date().toISOString(),
          isVerified: actorData.isVerified || false,
          isPremium: actorData.isPremium || false,
          professionalPhotos: actorData.professionalPhotos || [],
          languages: actorData.languages || [],
          mediaReels: actorData.mediaReels || {},
        });

        logger.info('Actor created', { actorId: actorData.id });
        res.status(201).json({ message: 'Actor profile created successfully', actor: actorData });
      }
    } catch (err) {
      logger.error('POST /api/actors failed', err);
      throw new Error('Failed to save actor profile');
    }
  })
);

// DELETE actor
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationErrorClass('Actor ID is required');
    }

    try {
      // Delete related applications first (cascade)
      await db.delete(applications).where(eq(applications.actorId, id));

      // Delete actor
      await db.delete(actors).where(eq(actors.id, id));

      logger.info('Actor deleted', { actorId: id });
      res.json({ success: true, message: 'Actor and related applications deleted successfully' });
    } catch (err) {
      logger.error(`DELETE /api/actors/${id} failed`, err);
      throw new Error('Failed to delete actor');
    }
  })
);

export default router;
