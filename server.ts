import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { actors, castingCalls, applications, partners, newsArticles, paymentRequests } from "./src/db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { DEFAULT_ACTORS, DEFAULT_CASTING_CALLS } from "./src/data/seedData.ts";
import { GoogleGenAI, Type } from "@google/genai";

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required to use AI features. Please add it via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Automatic Postgres Schema Migration and Seeder
  async function seedDatabaseIfEmpty() {
    try {
      console.log("Verifying or creating PostgreSQL table columns for Premium features & Telebirr Payments...");
      await db.execute(sql`ALTER TABLE actors ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;`);
      await db.execute(sql`ALTER TABLE actors ADD COLUMN IF NOT EXISTS professional_photos JSONB DEFAULT '[]'::jsonb;`);
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS payment_requests (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_type TEXT NOT NULL,
          user_name TEXT NOT NULL,
          user_phone TEXT NOT NULL,
          user_email TEXT NOT NULL,
          amount INTEGER NOT NULL,
          currency TEXT DEFAULT 'ETB',
          telebirr_account TEXT DEFAULT '+251911381970',
          transaction_ref TEXT NOT NULL,
          plan_name TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          date_submitted TEXT NOT NULL,
          date_processed TEXT,
          notes TEXT
        );
      `);
      console.log("Premium table columns and payment_requests table verified successfully.");
    } catch (err) {
      console.warn("Schema migration warning:", err);
    }

    try {
      const existingActors = await db.select().from(actors).limit(1);
      if (existingActors.length === 0) {
        console.log("Seeding default actors into PostgreSQL...");
        for (const actor of DEFAULT_ACTORS) {
          await db.insert(actors).values({
            id: actor.id,
            name: actor.name,
            type: actor.type,
            gender: actor.gender,
            age: actor.age,
            heightCm: actor.heightCm,
            eyeColor: actor.eyeColor,
            hairColor: actor.hairColor,
            hairLength: actor.hairLength,
            ethnicity: actor.ethnicity,
            location: actor.location,
            bio: actor.bio,
            skills: actor.skills || [],
            experience: actor.experience || [],
            headshotUrl: actor.headshotUrl,
            contactEmail: actor.contactEmail,
            phone: actor.phone,
            instagram: actor.instagram || null,
            website: actor.website || null,
            createdAt: actor.createdAt,
            isVerified: actor.isVerified || false,
            isPremium: (actor as any).isPremium || false,
            professionalPhotos: (actor as any).professionalPhotos || [],
            languages: actor.languages || [],
            mediaReels: actor.mediaReels || {},
          });
        }
      }

      const existingCalls = await db.select().from(castingCalls).limit(1);
      if (existingCalls.length === 0) {
        console.log("Seeding default casting calls into PostgreSQL...");
        for (const call of DEFAULT_CASTING_CALLS) {
          await db.insert(castingCalls).values({
            id: call.id,
            title: call.title,
            company: call.company,
            director: call.director,
            description: call.description,
            location: call.location,
            type: call.type,
            roles: call.roles || [],
            dateCreated: call.dateCreated,
            deadline: call.deadline,
            budget: call.budget,
            currency: call.currency || 'KSh',
            status: call.status || 'open',
            isVerified: call.isVerified || false,
            imageUrl: call.imageUrl || null,
          });
        }
      }

      const existingApps = await db.select().from(applications).limit(1);
      if (existingApps.length === 0) {
        console.log("Seeding default applications into PostgreSQL...");
        const initialApps = [
          {
            id: 'app_1',
            castingCallId: 'call_1',
            roleId: 'role_1_1',
            actorId: 'act_1',
            dateApplied: '2026-07-12T10:00:00Z',
            status: 'pending',
            message: 'Hello Claire! I am highly interested in the role of Chidi - Master Hacker. I have similar project experience and feel this fit is perfect.'
          },
          {
            id: 'app_2',
            castingCallId: 'call_2',
            roleId: 'role_2_1',
            actorId: 'act_4',
            dateApplied: '2026-07-15T14:30:00Z',
            status: 'shortlisted',
            message: 'Hi Pierre, I would love to join the Savanna Campaign. Ready to travel and speak fluent Swahili as requested.'
          },
          {
            id: 'app_3',
            castingCallId: 'call_3',
            roleId: 'role_3_1',
            actorId: 'act_8',
            dateApplied: '2026-07-16T09:00:00Z',
            status: 'invited',
            message: 'I am extremely passionate about this high-action sci-fi project. Ready for training.'
          }
        ];
        for (const appItem of initialApps) {
          await db.insert(applications).values({
            id: appItem.id,
            castingCallId: appItem.castingCallId,
            roleId: appItem.roleId,
            actorId: appItem.actorId,
            dateApplied: appItem.dateApplied,
            status: appItem.status,
            message: appItem.message,
          });
        }
      }

      const existingNews = await db.select().from(newsArticles).limit(1);
      if (existingNews.length === 0) {
        console.log("Seeding default news articles into PostgreSQL...");
        const initialNews = [
          {
            id: 'art-1',
            title: 'Sewasew Multimedia Announces 15 New Drama Acquisitions for 2026',
            category: 'Industry Update',
            date: 'July 18, 2026',
            author: 'Elshadai Girma (Addis Film Board)',
            imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=600',
            excerpt: 'The leading Ethiopian streaming and multimedia platform announces a landmark 120 Million ETB investment budget for original, local serialized cinema and dramas.',
            content: 'Sewasew Multimedia has officially signed contracts for 15 new drama and screenplay productions, slated to begin filming in late 2026 across Addis Ababa, Hawassa, and Gonder. According to platform directors, this expansion will require over 200 speaking roles and countless extras. "Our mission is to elevate Ethiopian storytelling to an international standard," stated Elshadai Girma. Actors are highly encouraged to keep their physical portfolio composite cards, headshots, and voice reels up-to-date in digital casting registries like Addis Talent. Shortlisted casting calls are expected to go live next month.'
          },
          {
            id: 'art-2',
            title: 'The Art of the Amharic Monologue: Sincerity Over Loudness',
            category: 'Audition Advice',
            date: 'June 29, 2026',
            author: 'Dawit Yohannes (National Theatre)',
            imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600',
            excerpt: 'Local casting directors are shifting away from traditional theatrical projection toward intimate, screen-friendly naturalism. Here is what you need to adjust.',
            content: 'For decades, Ethiopian stage actors trained at the National Theatre and Addis Ababa University have leaned heavily on voice projection and grand gestures designed to reach the back row of a amphitheatre. However, with the surge of high-definition cinematic serials and international co-productions, casting directors are requesting "micro-acting". Dawit Yohannes explains: "The camera captures everything—even a slight swallow or eye movement. When you record your self-tapes or deliver an audition monologue, focus on authentic internal feeling rather than external volume. Let the microphone do the work. Speak as if talking to a friend sitting just two feet away from you."'
          },
          {
            id: 'art-3',
            title: 'Addis Cinema Cooperative Sets Up New Escrow Contract Safeguards',
            category: 'Platform News',
            date: 'May 14, 2026',
            author: 'Platform Safety Editorial',
            imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
            excerpt: 'Protecting independent actors and small-scale directors from payment delays and contract disputes with localized deposit and escrow pipelines.',
            content: 'A major pain point in the local entertainment landscape has been the issue of payment security. Actors often complete weeks of rehearsals and shooting only to face months of delay, while directors face sudden cast drop-outs. To tackle this, the Addis Cinema Cooperative, in partnership with local fintech hubs, has endorsed digital escrow standards. Platform registries like Addis Talent now offer a smart-contract or clear-deposit casting flow. Producers deposit the talent compensation before production begins. Once the actor delivers their final performance, funds are released safely, building immense professional trust on both sides.'
          }
        ];
        for (const newsItem of initialNews) {
          await db.insert(newsArticles).values(newsItem);
        }
      }

      const existingPartners = await db.select().from(partners).limit(1);
      if (existingPartners.length === 0) {
        console.log("Seeding default partners into PostgreSQL...");
        const initialPartners = [
          { id: 'part-1', name: 'KANA TV', iconName: 'Film' },
          { id: 'part-2', name: 'EBS TELEVISION', iconName: 'Globe' },
          { id: 'part-3', name: 'SEWASEW MULTIMEDIA', iconName: 'Award' },
          { id: 'part-4', name: 'SODERE FILMS', iconName: 'TrendingUp' },
          { id: 'part-5', name: 'ADDIS CINEMA CO.', iconName: 'Shield' }
        ];
        for (const partnerItem of initialPartners) {
          await db.insert(partners).values(partnerItem);
        }
      }

      console.log("PostgreSQL database fully initialized and verified.");
    } catch (err) {
      console.error("Warning: Seeding database failed:", err);
    }
  }

  // Run seeding
  await seedDatabaseIfEmpty();

  // --- AI INTEGRATION ENDPOINTS (Gemini Powered) ---

  // 1. AI Monologue Script Generator (for Actors to prepare auditions)
  app.post("/api/ai/monologue", async (req, res) => {
    try {
      const { projectTitle, projectDescription, roleTitle, roleDescription } = req.body;
      if (!roleTitle) {
        return res.status(400).json({ error: "Missing required roleTitle" });
      }

      const ai = getAi();
      const prompt = `Write a dramatic, high-quality monologue script (around 150-250 words) suitable for an actor auditioning for the role of "${roleTitle}" in the production titled "${projectTitle || 'Untitled'}".
      
      Project Description: ${projectDescription || 'No description provided.'}
      Role Requirements/Description: ${roleDescription || 'No role description provided.'}
      
      Include clear performance/emotion cues in brackets, and structure it beautifully. Highlight theatrical intensity suitable for contemporary drama and screen acting. Return ONLY the monologue script with its title and performance cues.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ monologue: response.text || "" });
    } catch (err: any) {
      console.error("AI monologue error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI monologue" });
    }
  });

  // 2. AI Audition Pitch Note Writer (for Actors to write a cover letter)
  app.post("/api/ai/pitch", async (req, res) => {
    try {
      const { actorName, actorBio, actorSkills, roleTitle, roleDescription, projectTitle } = req.body;
      if (!roleTitle) {
        return res.status(400).json({ error: "Missing required roleTitle" });
      }

      const ai = getAi();
      const prompt = `Draft a highly professional, compelling cover letter / pitch note (around 100-150 words) from the actor "${actorName || 'A candidate actor'}" to the casting director of "${projectTitle || 'the project'}".
      
      Actor Bio: ${actorBio || 'No biography details provided.'}
      Actor Skills: ${Array.isArray(actorSkills) ? actorSkills.join(', ') : (actorSkills || 'Acting')}
      Target Role: "${roleTitle}"
      Role Description: ${roleDescription || 'No description provided.'}
      
      The tone should be enthusiastic, respectful, and articulate, highlighting why the actor's skills make them a perfect fit. Do NOT make up false credits, but frame their existing talent with absolute confidence. Keep it highly concise and ready for submission.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ pitch: response.text || "" });
    } catch (err: any) {
      console.error("AI pitch error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI pitch" });
    }
  });

  // 3. AI Profile Bio Critique and Optimizer (for Actors to look polished)
  app.post("/api/ai/critique-bio", async (req, res) => {
    try {
      const { bio, skills } = req.body;
      if (!bio) {
        return res.status(400).json({ error: "Missing bio text to critique" });
      }

      const ai = getAi();
      const prompt = `Analyze and critique the following actor portfolio biography and skills list:
      Biography: "${bio}"
      Skills: ${Array.isArray(skills) ? skills.join(', ') : (skills || 'None listed')}
      
      Suggest specific professional enhancements. Optimize the biography to be engaging, striking, and castable (e.g. for film boards, contemporary stage, international agencies).
      Keep the optimized skills crisp and descriptive.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 3 specific, constructive tips to improve their portfolio bio/skills."
              },
              optimizedBio: {
                type: Type.STRING,
                description: "An improved, highly professional rewrite of their biography."
              },
              optimizedSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An optimized list of relevant, industry-standard skill terms based on their input."
              }
            },
            required: ["suggestions", "optimizedBio", "optimizedSkills"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (err: any) {
      console.error("AI bio critique error:", err);
      res.status(500).json({ error: err.message || "Failed to generate bio critique" });
    }
  });

  // 4. AI Suitability Match Analysis (for Casting Directors to screen applications)
  app.post("/api/ai/match-analysis", async (req, res) => {
    try {
      const { actorProfile, roleRequirements } = req.body;
      if (!actorProfile || !roleRequirements) {
        return res.status(400).json({ error: "Missing actorProfile or roleRequirements parameters" });
      }

      const ai = getAi();
      const prompt = `Conduct a professional casting director's match analysis comparing the actor's profile to the target role's requirements.
      
      ACTOR PROFILE:
      - Name: ${actorProfile.name}
      - Bio: ${actorProfile.bio}
      - Skills: ${Array.isArray(actorProfile.skills) ? actorProfile.skills.join(', ') : actorProfile.skills}
      - Age: ${actorProfile.age}
      - Height: ${actorProfile.heightCm} cm
      - Gender: ${actorProfile.gender}
      
      ROLE REQUIREMENTS:
      - Title: ${roleRequirements.title}
      - Description: ${roleRequirements.description}
      - Gender: ${roleRequirements.gender}
      - Age Range: ${roleRequirements.ageMin} to ${roleRequirements.ageMax}
      
      Determine a compatibility score (0 to 100), draft a professional verdict (1-2 sentences), identify 2 key strengths of this casting match, and identify 1 or 2 areas where they differ or could adapt.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: "Compatibility match percentage score from 0 to 100."
              },
              verdict: {
                type: Type.STRING,
                description: "A professional 1-2 sentence overview summarizing the compatibility of this actor for the role."
              },
              matchingStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Two specific strengths or synergies (e.g. skills overlap, age fit)."
              },
              areasForImprovement: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "One or two constructive points of difference or performance challenges they may face."
              }
            },
            required: ["score", "verdict", "matchingStrengths", "areasForImprovement"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (err: any) {
      console.error("AI match analysis error:", err);
      res.status(500).json({ error: err.message || "Failed to calculate compatibility" });
    }
  });

  // 5. AI Role Builder & Prompt-Based Casting Draft (for Casting Directors to post a casting call easily)
  app.post("/api/ai/role-builder", async (req, res) => {
    try {
      const { concept, type, budget } = req.body;
      if (!concept) {
        return res.status(400).json({ error: "Missing creative concept prompt" });
      }

      const ai = getAi();
      const prompt = `Draft a comprehensive, highly creative professional casting call outline based on the following movie or campaign concept:
      Concept: "${concept}"
      Production Type: ${type || "film"}
      Approximate Budget: ${budget || "Competitive"}
      
      Create an elegant, highly marketable title, a compelling production description, and a set of 2 diverse, detailed character break character roles (names, descriptions, gender, age ranges, compensation rates). Make it highly appropriate for production, utilizing realistic naming and cinematic styles.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Catchy and professional title of the production."
              },
              description: {
                type: Type.STRING,
                description: "Compelling and vivid production synopsis to attract elite actors."
              },
              roles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Name of the character role." },
                    description: { type: Type.STRING, description: "Detailed personality, character background, and casting hints." },
                    gender: { type: Type.STRING, description: "Target gender (male, female, non-binary, or any)." },
                    ageMin: { type: Type.INTEGER, description: "Minimum age playing range." },
                    ageMax: { type: Type.INTEGER, description: "Maximum age playing range." },
                    compensation: { type: Type.STRING, description: "Compensation detail." }
                  },
                  required: ["title", "description", "gender", "ageMin", "ageMax", "compensation"]
                }
              }
            },
            required: ["title", "description", "roles"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (err: any) {
      console.error("AI role builder error:", err);
      res.status(500).json({ error: err.message || "Failed to draft creative casting call" });
    }
  });

  // 6. AI Audition & Casting Industry Coach (for interactive news & advice)
  app.post("/api/ai/news-coach", async (req, res) => {
    try {
      const { articleTitle, articleContent } = req.body;
      if (!articleTitle) {
        return res.status(400).json({ error: "Missing article title" });
      }

      const ai = getAi();
      const prompt = `You are an elite, encouraging casting director and acting coach on the Addis Talent platform. Read this industry update/acting advice article:
      
      ARTICLE TITLE: "${articleTitle}"
      ARTICLE OVERVIEW: "${articleContent || 'General Audition Preparation Guide.'}"
      
      Based on this topic, generate 3 highly practical, professional, and regional tips (such as dealing with self-tapes in Addis Ababa, preparing dialetcs, or managing physical resumes) that can help actors succeed.
      Also, prescribe a quick, single-sentence performance rehearsal exercise the actor can try immediately in front of their mirror or phone camera.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of exactly 3 tactical, highly actionable tips derived from the article."
              },
              practiceAction: {
                type: Type.STRING,
                description: "A short, highly practical 1-sentence practice prompt or warm-up exercise."
              }
            },
            required: ["coachTips", "practiceAction"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (err: any) {
      console.error("AI news coach error:", err);
      res.status(500).json({ error: err.message || "Failed to generate coaching insights" });
    }
  });

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "connected" });
  });

  // API Route - Actors list
  app.get("/api/actors", async (req, res) => {
    try {
      const result = await db.select().from(actors);
      res.json(result);
    } catch (err) {
      console.error("GET /api/actors error:", err);
      res.status(500).json({ error: "Failed to fetch actors" });
    }
  });

  // API Route - Add/Update Actor
  app.post("/api/actors", async (req, res) => {
    try {
      const actorData = req.body;
      if (!actorData.id) {
        return res.status(400).json({ error: "Missing actor ID" });
      }
      const existing = await db.select().from(actors).where(eq(actors.id, actorData.id)).limit(1);
      if (existing.length > 0) {
        await db.update(actors).set({
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
          createdAt: actorData.createdAt,
          isVerified: actorData.isVerified || false,
          isPremium: actorData.isPremium || false,
          professionalPhotos: actorData.professionalPhotos || [],
          languages: actorData.languages || [],
          mediaReels: actorData.mediaReels || {},
        }).where(eq(actors.id, actorData.id));
        res.json({ message: "Actor profile updated successfully in SQL", actor: actorData });
      } else {
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
          createdAt: actorData.createdAt,
          isVerified: actorData.isVerified || false,
          isPremium: actorData.isPremium || false,
          professionalPhotos: actorData.professionalPhotos || [],
          languages: actorData.languages || [],
          mediaReels: actorData.mediaReels || {},
        });
        res.status(201).json({ message: "Actor profile registered successfully in SQL", actor: actorData });
      }
    } catch (err) {
      console.error("POST /api/actors error:", err);
      res.status(500).json({ error: "Failed to save actor profile to SQL" });
    }
  });

  // API Route - Delete Actor
  app.delete("/api/actors/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await db.delete(actors).where(eq(actors.id, id));
      await db.delete(applications).where(eq(applications.actorId, id));
      res.json({ success: true, message: "Actor and applications deleted successfully from SQL" });
    } catch (err) {
      console.error("DELETE /api/actors error:", err);
      res.status(500).json({ error: "Failed to delete actor from SQL" });
    }
  });

  // API Route - Casting Calls
  app.get("/api/casting-calls", async (req, res) => {
    try {
      const result = await db.select().from(castingCalls);
      res.json(result);
    } catch (err) {
      console.error("GET /api/casting-calls error:", err);
      res.status(500).json({ error: "Failed to fetch casting calls" });
    }
  });

  // API Route - Create/Update Casting Call
  app.post("/api/casting-calls", async (req, res) => {
    try {
      const callData = req.body;
      if (!callData.id) {
        return res.status(400).json({ error: "Missing casting call ID" });
      }
      const existing = await db.select().from(castingCalls).where(eq(castingCalls.id, callData.id)).limit(1);
      if (existing.length > 0) {
        await db.update(castingCalls).set({
          title: callData.title,
          company: callData.company,
          director: callData.director,
          description: callData.description,
          location: callData.location,
          type: callData.type,
          roles: callData.roles || [],
          dateCreated: callData.dateCreated,
          deadline: callData.deadline,
          budget: callData.budget,
          currency: callData.currency || 'KSh',
          status: callData.status || 'open',
          isVerified: callData.isVerified || false,
          imageUrl: callData.imageUrl || null,
        }).where(eq(castingCalls.id, callData.id));
        res.json({ message: "Casting call updated in SQL", castingCall: callData });
      } else {
        await db.insert(castingCalls).values({
          id: callData.id,
          title: callData.title,
          company: callData.company,
          director: callData.director,
          description: callData.description,
          location: callData.location,
          type: callData.type,
          roles: callData.roles || [],
          dateCreated: callData.dateCreated,
          deadline: callData.deadline,
          budget: callData.budget,
          currency: callData.currency || 'KSh',
          status: callData.status || 'open',
          isVerified: callData.isVerified || false,
          imageUrl: callData.imageUrl || null,
        });
        res.status(201).json({ message: "Casting call created in SQL", castingCall: callData });
      }
    } catch (err) {
      console.error("POST /api/casting-calls error:", err);
      res.status(500).json({ error: "Failed to save casting call to SQL" });
    }
  });

  // API Route - Applications
  app.get("/api/applications", async (req, res) => {
    try {
      const result = await db.select().from(applications);
      res.json(result);
    } catch (err) {
      console.error("GET /api/applications error:", err);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // API Route - Save/Update Application
  app.post("/api/applications", async (req, res) => {
    try {
      const appData = req.body;
      if (!appData.id) {
        return res.status(400).json({ error: "Missing application ID" });
      }
      const existing = await db.select().from(applications).where(eq(applications.id, appData.id)).limit(1);
      if (existing.length > 0) {
        await db.update(applications).set({
          castingCallId: appData.castingCallId,
          roleId: appData.roleId,
          actorId: appData.actorId,
          dateApplied: appData.dateApplied,
          status: appData.status,
          message: appData.message || null,
          selfTapeUrl: appData.selfTapeUrl || null,
          audioAuditionUrl: appData.audioAuditionUrl || null,
        }).where(eq(applications.id, appData.id));
        res.json({ message: "Audition application updated in SQL", application: appData });
      } else {
        await db.insert(applications).values({
          id: appData.id,
          castingCallId: appData.castingCallId,
          roleId: appData.roleId,
          actorId: appData.actorId,
          dateApplied: appData.dateApplied,
          status: appData.status,
          message: appData.message || null,
          selfTapeUrl: appData.selfTapeUrl || null,
          audioAuditionUrl: appData.audioAuditionUrl || null,
        });
        res.status(201).json({ message: "Audition application registered in SQL", application: appData });
      }
    } catch (err) {
      console.error("POST /api/applications error:", err);
      res.status(500).json({ error: "Failed to save audition application to SQL" });
    }
  });

  // API Route - Partners
  app.get("/api/partners", async (req, res) => {
    try {
      const result = await db.select().from(partners);
      res.json(result);
    } catch (err) {
      console.error("GET /api/partners error:", err);
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.post("/api/partners", async (req, res) => {
    try {
      const partnerData = req.body;
      if (!partnerData.id) {
        return res.status(400).json({ error: "Missing partner ID" });
      }
      const existing = await db.select().from(partners).where(eq(partners.id, partnerData.id)).limit(1);
      if (existing.length > 0) {
        await db.update(partners).set({
          name: partnerData.name,
          iconName: partnerData.iconName,
        }).where(eq(partners.id, partnerData.id));
        res.json({ message: "Partner updated in SQL", partner: partnerData });
      } else {
        await db.insert(partners).values({
          id: partnerData.id,
          name: partnerData.name,
          iconName: partnerData.iconName || 'Film',
        });
        res.status(201).json({ message: "Partner created in SQL", partner: partnerData });
      }
    } catch (err) {
      console.error("POST /api/partners error:", err);
      res.status(500).json({ error: "Failed to save partner to SQL" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await db.delete(partners).where(eq(partners.id, id));
      res.json({ success: true, message: "Partner deleted successfully from SQL" });
    } catch (err) {
      console.error("DELETE /api/partners error:", err);
      res.status(500).json({ error: "Failed to delete partner from SQL" });
    }
  });

  // API Route - News Articles
  app.get("/api/news", async (req, res) => {
    try {
      const result = await db.select().from(newsArticles);
      res.json(result);
    } catch (err) {
      console.error("GET /api/news error:", err);
      res.status(500).json({ error: "Failed to fetch news articles" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const newsData = req.body;
      if (!newsData.id) {
        return res.status(400).json({ error: "Missing news article ID" });
      }
      const existing = await db.select().from(newsArticles).where(eq(newsArticles.id, newsData.id)).limit(1);
      if (existing.length > 0) {
        await db.update(newsArticles).set({
          title: newsData.title,
          category: newsData.category,
          date: newsData.date,
          author: newsData.author,
          imageUrl: newsData.imageUrl,
          excerpt: newsData.excerpt,
          content: newsData.content,
        }).where(eq(newsArticles.id, newsData.id));
        res.json({ message: "News article updated in SQL", article: newsData });
      } else {
        await db.insert(newsArticles).values({
          id: newsData.id,
          title: newsData.title,
          category: newsData.category,
          date: newsData.date,
          author: newsData.author,
          imageUrl: newsData.imageUrl,
          excerpt: newsData.excerpt,
          content: newsData.content,
        });
        res.status(201).json({ message: "News article created in SQL", article: newsData });
      }
    } catch (err) {
      console.error("POST /api/news error:", err);
      res.status(500).json({ error: "Failed to save news article to SQL" });
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      const id = req.params.id;
      await db.delete(newsArticles).where(eq(newsArticles.id, id));
      res.json({ success: true, message: "News article deleted successfully from SQL" });
    } catch (err) {
      console.error("DELETE /api/news error:", err);
      res.status(500).json({ error: "Failed to delete news article from SQL" });
    }
  });

  // API Route - Payment Requests (Telebirr Gateway)
  app.get("/api/payment-requests", async (req, res) => {
    try {
      const result = await db.select().from(paymentRequests);
      res.json(result);
    } catch (err) {
      console.error("GET /api/payment-requests error:", err);
      res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  });

  app.post("/api/payment-requests", async (req, res) => {
    try {
      const reqData = req.body;
      if (!reqData.id || !reqData.transactionRef) {
        return res.status(400).json({ error: "Missing required payment fields (id or transactionRef)" });
      }

      const existing = await db.select().from(paymentRequests).where(eq(paymentRequests.id, reqData.id)).limit(1);
      if (existing.length > 0) {
        await db.update(paymentRequests).set({
          status: reqData.status || 'pending',
          dateProcessed: reqData.dateProcessed || null,
          notes: reqData.notes || null,
        }).where(eq(paymentRequests.id, reqData.id));
        res.json({ message: "Payment request updated in SQL", paymentRequest: reqData });
      } else {
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
        res.status(201).json({ message: "Payment request submitted to SQL for owner approval", paymentRequest: reqData });
      }
    } catch (err) {
      console.error("POST /api/payment-requests error:", err);
      res.status(500).json({ error: "Failed to save payment request to SQL" });
    }
  });

  app.put("/api/payment-requests/:id/status", async (req, res) => {
    try {
      const id = req.params.id;
      const { status, notes } = req.body; // 'approved' | 'rejected'
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const dateProcessed = new Date().toISOString();
      await db.update(paymentRequests).set({
        status,
        dateProcessed,
        notes: notes || null,
      }).where(eq(paymentRequests.id, id));

      // Fetch the request record to auto-grant membership if approved
      const pReqArr = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
      if (pReqArr.length > 0 && status === 'approved') {
        const pReq = pReqArr[0];
        if (pReq.userType === 'actor') {
          // Grant Verified & Premium to actor
          await db.update(actors).set({
            isVerified: true,
            isPremium: true
          }).where(eq(actors.id, pReq.userId));
        }
      }

      res.json({ success: true, message: `Payment request ${status} successfully in SQL` });
    } catch (err) {
      console.error("PUT /api/payment-requests/:id/status error:", err);
      res.status(500).json({ error: "Failed to update payment request status" });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
