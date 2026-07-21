/**
 * AI-powered endpoints using Gemini API
 * Includes monologue generation, pitch writing, bio critique, and match analysis
 */

import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { aiLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError as ValidationErrorClass } from '../utils/errors';
import { validateString } from '../utils/validation';
import { logger } from '../utils/logger';

const router = Router();

// Initialize Gemini AI with lazy loading
let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'adiss-talent-platform',
        },
      },
    });
  }
  return aiClient;
}

// Apply rate limiting to all AI routes
router.use(aiLimiter.middleware());

// 1. AI Monologue Script Generator
router.post(
  '/monologue',
  asyncHandler(async (req: Request, res: Response) => {
    const { projectTitle, projectDescription, roleTitle, roleDescription } = req.body;

    try {
      validateString(roleTitle, 1, 255);
    } catch (err) {
      throw new ValidationErrorClass('roleTitle is required');
    }

    try {
      const ai = getAi();
      const prompt = `Write a dramatic, high-quality monologue script (around 150-250 words) suitable for an actor auditioning for the role of "${roleTitle}" in the production titled "${projectTitle || 'Untitled Project'}".\n      \nProject Description: ${projectDescription || 'No description provided.'}\nRole Requirements/Description: ${roleDescription || 'No role description provided.'}\n\nInclude clear performance/emotion cues in brackets, and structure it beautifully. Highlight theatrical intensity suitable for contemporary drama and screen acting. Return ONLY the monologue script with no additional commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      logger.info('AI monologue generated', { roleTitle });
      res.json({ monologue: response.text || '' });
    } catch (err: any) {
      logger.error('AI monologue error', err);
      throw new Error(err.message || 'Failed to generate monologue');
    }
  })
);

// 2. AI Audition Pitch Note Writer
router.post(
  '/pitch',
  asyncHandler(async (req: Request, res: Response) => {
    const { actorName, actorBio, actorSkills, roleTitle, roleDescription, projectTitle } = req.body;

    try {
      validateString(roleTitle, 1, 255);
    } catch (err) {
      throw new ValidationErrorClass('roleTitle is required');
    }

    try {
      const ai = getAi();
      const prompt = `Draft a highly professional, compelling cover letter / pitch note (around 100-150 words) from the actor "${actorName || 'A candidate actor'}" to the casting director of "${projectTitle || 'Untitled Project'}".\n      \nActor Bio: ${actorBio || 'No biography details provided.'}\nActor Skills: ${Array.isArray(actorSkills) ? actorSkills.join(', ') : actorSkills || 'Acting'}\nTarget Role: "${roleTitle}"\nRole Description: ${roleDescription || 'No description provided.'}\n\nThe tone should be enthusiastic, respectful, and articulate, highlighting why the actor's skills make them a perfect fit. Return ONLY the pitch note with no additional commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      logger.info('AI pitch generated', { actorName, roleTitle });
      res.json({ pitch: response.text || '' });
    } catch (err: any) {
      logger.error('AI pitch error', err);
      throw new Error(err.message || 'Failed to generate pitch');
    }
  })
);

// 3. AI Profile Bio Critique and Optimizer
router.post(
  '/critique-bio',
  asyncHandler(async (req: Request, res: Response) => {
    const { bio, skills } = req.body;

    try {
      validateString(bio, 10, 2000);
    } catch (err) {
      throw new ValidationErrorClass('bio is required and must be 10-2000 characters');
    }

    try {
      const ai = getAi();
      const prompt = `Analyze and critique the following actor portfolio biography and skills list:\nBiography: "${bio}"\nSkills: ${Array.isArray(skills) ? skills.join(', ') : skills || 'None listed'}\n\nSuggest specific professional enhancements. Optimize the biography to be engaging, striking, and castable. Keep the optimized skills crisp and descriptive.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 3 specific tips to improve their bio/skills.',
              },
              optimizedBio: {
                type: Type.STRING,
                description: 'Improved, professional biography.',
              },
              optimizedSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Optimized skill terms.',
              },
            },
            required: ['suggestions', 'optimizedBio', 'optimizedSkills'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      logger.info('AI bio critique generated');
      res.json(data);
    } catch (err: any) {
      logger.error('AI bio critique error', err);
      throw new Error(err.message || 'Failed to critique bio');
    }
  })
);

// 4. AI Suitability Match Analysis
router.post(
  '/match-analysis',
  asyncHandler(async (req: Request, res: Response) => {
    const { actorProfile, roleRequirements } = req.body;

    if (!actorProfile || !roleRequirements) {
      throw new ValidationErrorClass('Missing actorProfile or roleRequirements');
    }

    try {
      const ai = getAi();
      const prompt = `Conduct a professional casting director's match analysis comparing the actor's profile to the role.\n      \nACTOR PROFILE:\n- Name: ${actorProfile.name}\n- Bio: ${actorProfile.bio}\n- Skills: ${Array.isArray(actorProfile.skills) ? actorProfile.skills.join(', ') : actorProfile.skills}\n- Age: ${actorProfile.age}\n- Height: ${actorProfile.heightCm} cm\n- Gender: ${actorProfile.gender}\n\nROLE REQUIREMENTS:\n- Title: ${roleRequirements.title}\n- Description: ${roleRequirements.description}\n- Gender: ${roleRequirements.gender}\n- Age Range: ${roleRequirements.ageMin} to ${roleRequirements.ageMax}\n\nProvide a compatibility score (0-100), professional verdict, 2 strengths, and 1-2 areas for improvement.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: 'Compatibility score 0-100.',
              },
              verdict: {
                type: Type.STRING,
                description: 'Professional 1-2 sentence summary.',
              },
              matchingStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Two strengths.',
              },
              areasForImprovement: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'One or two areas for improvement.',
              },
            },
            required: ['score', 'verdict', 'matchingStrengths', 'areasForImprovement'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      logger.info('AI match analysis generated');
      res.json(data);
    } catch (err: any) {
      logger.error('AI match analysis error', err);
      throw new Error(err.message || 'Failed to calculate compatibility');
    }
  })
);

// 5. AI Role Builder
router.post(
  '/role-builder',
  asyncHandler(async (req: Request, res: Response) => {
    const { concept, type, budget } = req.body;

    try {
      validateString(concept, 10, 1000);
    } catch (err) {
      throw new ValidationErrorClass('concept is required (10-1000 characters)');
    }

    try {
      const ai = getAi();
      const prompt = `Draft a comprehensive, creative professional casting call outline based on:\nConcept: "${concept}"\nProduction Type: ${type || 'film'}\nApproximate Budget: ${budget || 'Competitive'}\n\nCreate a title, description, and 2 detailed character roles with all specifications.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'Production title.',
              },
              description: {
                type: Type.STRING,
                description: 'Compelling synopsis.',
              },
              roles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    ageMin: { type: Type.INTEGER },
                    ageMax: { type: Type.INTEGER },
                    compensation: { type: Type.STRING },
                  },
                  required: ['title', 'description', 'gender', 'ageMin', 'ageMax', 'compensation'],
                },
              },
            },
            required: ['title', 'description', 'roles'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      logger.info('AI role builder generated');
      res.json(data);
    } catch (err: any) {
      logger.error('AI role builder error', err);
      throw new Error(err.message || 'Failed to generate roles');
    }
  })
);

// 6. AI Coaching Tips
router.post(
  '/coaching-tips',
  asyncHandler(async (req: Request, res: Response) => {
    const { articleTitle, articleContent } = req.body;

    try {
      validateString(articleTitle, 1, 255);
    } catch (err) {
      throw new ValidationErrorClass('articleTitle is required');
    }

    try {
      const ai = getAi();
      const prompt = `You are an encouraging casting director and acting coach. Based on this article:\n\nARTICLE TITLE: "${articleTitle}"\nARTICLE OVERVIEW: "${articleContent || 'General Audition Preparation Guide.'}"\n\nGenerate 3 practical, professional tips for actors. Also prescribe 1 quick practice exercise (1 sentence).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of 3 tactical tips.',
              },
              practiceAction: {
                type: Type.STRING,
                description: 'A short 1-sentence practice prompt.',
              },
            },
            required: ['coachTips', 'practiceAction'],
          },
        },
      });

      const data = JSON.parse(response.text || '{}');
      logger.info('AI coaching tips generated');
      res.json(data);
    } catch (err: any) {
      logger.error('AI coaching tips error', err);
      throw new Error(err.message || 'Failed to generate coaching tips');
    }
  })
);

export default router;
