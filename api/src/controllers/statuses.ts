import { Request, Response } from "express";
import { db } from "../db/index";
import { statusHistory, applicationStatusEnum, applications } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createStatusSchema = z.object({
  status: z.enum(applicationStatusEnum.enumValues),
  date: z.string().default(() => new Date().toISOString().split("T")[0]),
});

export const statusController = {
  // Get history for a specific application
  getByApplication: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { applicationId } = req.params;

      // Verify ownership
      const app = await db.query.applications.findFirst({
        where: and(
          eq(applications.id, applicationId),
          eq(applications.userId, userId)
        ),
      });

      if (!app) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      const history = await db
        .select()
        .from(statusHistory)
        .where(eq(statusHistory.applicationId, applicationId))
        .orderBy(desc(statusHistory.date));

      res.json(history);
    } catch (error) {
      console.error("Error fetching status history:", error);
      res.status(500).json({ message: "Failed to fetch status history" });
    }
  },

  // Add a new status entry
  create: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { applicationId } = req.params;
      const validation = createStatusSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ errors: validation.error.format() });
        return;
      }

      // Verify ownership
      const app = await db.query.applications.findFirst({
        where: and(
          eq(applications.id, applicationId),
          eq(applications.userId, userId)
        ),
      });

      if (!app) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      const [newStatus] = await db
        .insert(statusHistory)
        .values({
          applicationId,
          status: validation.data.status,
          date: validation.data.date.split("T")[0],
        })
        .returning();

      // Update the application's updatedAt timestamp
      await db
        .update(applications)
        .set({ updatedAt: new Date() })
        .where(eq(applications.id, applicationId));

      res.status(201).json(newStatus);
    } catch (error) {
      console.error("Error creating status entry:", error);
      res.status(500).json({ message: "Failed to create status entry" });
    }
  },

  // Get available status types (for dropdowns)
  getTypes: (_req: Request, res: Response) => {
    res.json(applicationStatusEnum.enumValues);
  },

  // Delete a status entry
  delete: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      // Find the status entry and join with applications to check ownership
      const statusEntry = await db.query.statusHistory.findFirst({
        where: eq(statusHistory.id, id),
        with: {
            application: true
        }
      }) as any;

      if (!statusEntry || statusEntry.application.userId !== userId) {
        res.status(404).json({ message: "Status entry not found" });
        return;
      }

      // Ensure we don't delete the last status entry
      const count = await db
        .select()
        .from(statusHistory)
        .where(eq(statusHistory.applicationId, statusEntry.applicationId));

      if (count.length <= 1) {
        res.status(400).json({ message: "Cannot delete the only status entry" });
        return;
      }

      await db.delete(statusHistory).where(eq(statusHistory.id, id));

      res.json({ message: "Status entry deleted" });
    } catch (error) {
      console.error("Error deleting status entry:", error);
      res.status(500).json({ message: "Failed to delete status entry" });
    }
  },
};
