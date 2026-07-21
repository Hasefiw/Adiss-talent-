/**
 * Payment and premium membership routes
 */

import { Router, Request, Response } from 'express';
import { db } from '../db/index';
import { paymentRequests, actors } from '../db/schema';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError as ValidationErrorClass, NotFoundError } from '../utils/errors';
import { validateNumber, validateEnum } from '../utils/validation';
import { logger } from '../utils/logger';

const router = Router();

// GET all payment requests
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await db.select().from(paymentRequests);
      logger.debug('Fetched all payment requests', { count: result.length });
      res.json(result);
    } catch (err) {
      logger.error('GET /api/payment-requests failed', err);
      throw new Error('Failed to fetch payment requests');
    }
  })
);

// POST - Submit payment request
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const reqData = req.body;

    if (!reqData.id || !reqData.transactionRef) {
      throw new ValidationErrorClass('Missing id or transactionRef');
    }

    try {
      validateNumber(reqData.amount, 1);
      validateEnum(reqData.userType, ['actor', 'producer']);
      validateEnum(reqData.status || 'pending', ['pending', 'approved', 'rejected']);
    } catch (err) {
      throw new ValidationErrorClass(
        err instanceof Error ? err.message : 'Invalid payment data'
      );
    }

    try {
      const existing = await db
        .select()
        .from(paymentRequests)
        .where(eq(paymentRequests.id, reqData.id))
        .limit(1);

      if (existing.length > 0) {
        // Update
        await db
          .update(paymentRequests)
          .set({
            status: reqData.status || 'pending',
            dateProcessed: reqData.dateProcessed || null,
            notes: reqData.notes || null,
          })
          .where(eq(paymentRequests.id, reqData.id));

        logger.info('Payment request updated', { paymentId: reqData.id });
        res.json({ message: 'Payment request updated', paymentRequest: reqData });
      } else {
        // Create
        await db.insert(paymentRequests).values({
          id: reqData.id,
          userId: reqData.userId,
          userType: reqData.userType,
          userName: reqData.userName,
          userPhone: reqData.userPhone,
          userEmail: reqData.userEmail,
          amount: Number(reqData.amount),
          currency: reqData.currency || 'ETB',
          telebirrAccount: reqData.telebirrAccount || '+251911381970',
          transactionRef: reqData.transactionRef,
          planName: reqData.planName,
          status: reqData.status || 'pending',
          dateSubmitted: reqData.dateSubmitted || new Date().toISOString(),
          dateProcessed: reqData.dateProcessed || null,
          notes: reqData.notes || null,
        });

        logger.info('Payment request created', { paymentId: reqData.id, user: reqData.userType });
        res.status(201).json({ message: 'Payment request submitted', paymentRequest: reqData });
      }
    } catch (err) {
      logger.error('POST /api/payment-requests failed', err);
      throw new Error('Failed to save payment request');
    }
  })
);

// PUT - Update payment request status
router.put(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!id) {
      throw new ValidationErrorClass('Payment request ID is required');
    }

    try {
      validateEnum(status, ['approved', 'rejected', 'pending']);
    } catch (err) {
      throw new ValidationErrorClass('Invalid status');
    }

    try {
      const dateProcessed = new Date().toISOString();

      await db
        .update(paymentRequests)
        .set({
          status,
          dateProcessed,
          notes: notes || null,
        })
        .where(eq(paymentRequests.id, id));

      // Auto-grant premium if approved
      const pReqArr = await db
        .select()
        .from(paymentRequests)
        .where(eq(paymentRequests.id, id))
        .limit(1);

      if (pReqArr.length > 0 && status === 'approved') {
        const pReq = pReqArr[0];
        if (pReq.userType === 'actor' && pReq.userId) {
          await db
            .update(actors)
            .set({
              isVerified: true,
              isPremium: true,
            })
            .where(eq(actors.id, pReq.userId));

          logger.info('Actor premium status granted', { actorId: pReq.userId });
        }
      }

      logger.info('Payment request status updated', { paymentId: id, status });
      res.json({ success: true, message: `Payment request ${status}` });
    } catch (err) {
      logger.error(`PUT /api/payment-requests/${id}/status failed`, err);
      throw new Error('Failed to update payment request status');
    }
  })
);

// DELETE payment request
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new ValidationErrorClass('Payment request ID is required');
    }

    try {
      await db.delete(paymentRequests).where(eq(paymentRequests.id, id));

      logger.info('Payment request deleted', { paymentId: id });
      res.json({ success: true, message: 'Payment request deleted' });
    } catch (err) {
      logger.error(`DELETE /api/payment-requests/${id} failed`, err);
      throw new Error('Failed to delete payment request');
    }
  })
);

export default router;
