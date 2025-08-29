import { Router } from "express";
import { authenticateToken, authorize } from "../utils/auth";
import { mockDatabase, pool, pgPool } from "../config/database";

const router = Router();

// List applications assigned to the reviewer
router.get(
  "/applications",
  authenticateToken,
  authorize("reviewer"),
  async (req: any, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query as any;
      const result = await (mockDatabase as any).getApplications({
        page: Number(page),
        limit: Number(limit),
        status: status as any,
        reviewerId: req.user?.id,
      });

      const enriched = await Promise.all(
        (result.data as any[]).map(async (r: any) => {
          try {
            const [u, s] = await Promise.all([
              (mockDatabase as any).findUserById(r.studentId),
              (mockDatabase as any).getScholarshipById(r.scholarshipId),
            ]);
            return {
              ...r,
              studentName: u
                ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                : null,
              scholarshipTitle: s ? s.title : null,
            };
          } catch {
            return r;
          }
        }),
      );

      res.json({
        success: true,
        data: enriched,
        pagination: result.pagination,
        message: "Assigned applications",
      });
    } catch (error) {
      console.error("Reviewer list applications error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

// Stats for reviewer
router.get(
  "/stats",
  authenticateToken,
  authorize("reviewer"),
  async (req: any, res) => {
    try {
      const stats = await (mockDatabase as any).getApplicationStatsForReviewer(
        req.user?.id,
      );
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("Reviewer stats error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

// Update an assigned application (status, score, notes)
router.patch(
  "/applications/:id",
  authenticateToken,
  authorize("reviewer"),
  async (req: any, res) => {
    try {
      const id = Number(req.params.id);
      if (!id)
        return res.status(400).json({ success: false, error: "Invalid id" });

      // Load application
      let appRec: any = null;
      if (pgPool) {
        const r = await pgPool.query(
          "SELECT * FROM applications WHERE id = $1",
          [id],
        );
        appRec = (r.rows as any[])[0] || null;
      } else if (pool) {
        const [r]: any = await pool.execute(
          "SELECT * FROM applications WHERE id = ? LIMIT 1",
          [id],
        );
        appRec = (r as any[])[0] || null;
      } else {
        const all = await (mockDatabase as any).getApplications({
          page: 1,
          limit: 10000,
        });
        appRec = (all.data as any[]).find((a) => a.id === id) || null;
      }

      if (!appRec)
        return res
          .status(404)
          .json({ success: false, error: "Application not found" });
      if (Number(appRec.assignedReviewerId) !== Number(req.user?.id))
        return res
          .status(403)
          .json({ success: false, error: "Not assigned to you" });

      // Lock once approved with comment
      const hasComment = String(appRec.reviewNotes || "").trim().length > 0;
      if (String(appRec.status) === "approved" && hasComment) {
        return res.status(403).json({
          success: false,
          error: "Application is locked after approval with comments",
        });
      }

      const { status, score, reviewNotes } = req.body || {};
      if (
        status &&
        ![
          "submitted",
          "under_review",
          "approved",
          "rejected",
          "waitlisted",
        ].includes(String(status))
      ) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid status" });
      }

      const updated = await (mockDatabase as any).updateApplication(id, {
        status: status ?? undefined,
        score: score === undefined ? undefined : Number(score),
        reviewNotes: reviewNotes ?? undefined,
      });

      res.json({
        success: true,
        data: updated,
        message: "Application updated",
      });
    } catch (error) {
      console.error("Reviewer update application error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

// Create a review entry (audit log)
router.post(
  "/reviews",
  authenticateToken,
  authorize("reviewer"),
  async (req: any, res) => {
    try {
      const {
        applicationId,
        criteria,
        overallScore,
        comments,
        recommendation,
      } = req.body || {};
      if (!applicationId)
        return res
          .status(400)
          .json({ success: false, error: "applicationId is required" });

      // Check assignment
      let appRec: any = null;
      if (pgPool) {
        const r = await pgPool.query(
          "SELECT * FROM applications WHERE id = $1",
          [applicationId],
        );
        appRec = (r.rows as any[])[0] || null;
      } else if (pool) {
        const [r]: any = await pool.execute(
          "SELECT * FROM applications WHERE id = ? LIMIT 1",
          [applicationId],
        );
        appRec = (r as any[])[0] || null;
      } else {
        const all = await (mockDatabase as any).getApplications({
          page: 1,
          limit: 10000,
        });
        appRec =
          (all.data as any[]).find((a) => a.id === Number(applicationId)) ||
          null;
      }
      if (!appRec)
        return res
          .status(404)
          .json({ success: false, error: "Application not found" });
      if (Number(appRec.assignedReviewerId) !== Number(req.user?.id))
        return res
          .status(403)
          .json({ success: false, error: "Not assigned to you" });

      // Create review record
      const review = await (mockDatabase as any).createReview({
        applicationId: Number(applicationId),
        reviewerId: req.user?.id,
        criteria: criteria ?? null,
        overallScore: overallScore == null ? null : Number(overallScore),
        comments: comments ?? null,
        recommendation: recommendation ?? null,
      });

      res
        .status(201)
        .json({ success: true, data: review, message: "Review saved" });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

// List review entries
router.get(
  "/reviews",
  authenticateToken,
  authorize("reviewer"),
  async (req: any, res) => {
    try {
      const { applicationId } = req.query as any;
      const reviews = await (mockDatabase as any).listReviews({
        applicationId: applicationId ? Number(applicationId) : undefined,
        reviewerId: req.user?.id,
      });
      res.json({ success: true, data: reviews });
    } catch (error) {
      console.error("List reviews error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  },
);

export default router;
