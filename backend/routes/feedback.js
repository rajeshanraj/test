const express = require("express");
const router = express.Router();
const axios = require("axios");

module.exports = (feedbackRef) => {
  // Save Feedback
  router.post("/", async (req, res) => {
    try {
      const feedback = {
        ...req.body,
        createdAt: new Date().toISOString()
      };

      if (feedbackRef) {
        await feedbackRef.push(feedback);
      }

      if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
        axios.post(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          action: "save_feedback",
          ...feedback
        }, {
          headers: { "Content-Type": "text/plain;charset=utf-8" }
        }).catch(err => console.warn("Sheet feedback sync notice:", err.message));
      }

      res.status(201).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fetch Latest Feedbacks for Homepage
  router.get("/", async (req, res) => {
    try {
      if (!feedbackRef) return res.json({ success: true, data: [] });
      const snap = await feedbackRef.limitToLast(6).once("value");
      const val = snap.val();
      const list = val ? Object.values(val).reverse() : [];
      res.json({ success: true, data: list });
    } catch (err) {
      res.status(500).json({ success: false, data: [] });
    }
  });

  return router;
};