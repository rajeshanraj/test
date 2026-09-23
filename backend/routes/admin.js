const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const axios = require("axios");

module.exports = (ticketsRef) => {
  // Admin Login
  router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
      return res.json({ success: true, token: process.env.ADMIN_TOKEN });
    }
    return res.status(401).json({ success: false, message: "Invalid Admin Credentials." });
  });

  // Fetch All Records (Protected)
  router.get("/records", authMiddleware, async (req, res) => {
    try {
      let records = [];

      if (ticketsRef) {
        const snap = await ticketsRef.once("value");
        const val = snap.val();
        if (val) {
          records = Object.keys(val).map(k => ({ ...val[k], fbKey: k }));
        }
      }

      // Optional merge from Sheet if accessible
      if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
        try {
          const sheetRes = await axios.get(`${process.env.GOOGLE_SHEET_WEBHOOK_URL}?action=fetch_all_records&user=admin&pass=${encodeURIComponent(process.env.ADMIN_PASS)}`);
          if (sheetRes.data && Array.isArray(sheetRes.data.records)) {
            const sheetItems = sheetRes.data.records;
            const existingIds = new Set(records.map(r => r.ticketId));
            sheetItems.forEach(s => {
              if (!existingIds.has(s.ticketId)) {
                records.push(s);
              }
            });
          }
        } catch (e) {
          console.warn("Sheet fetch admin notice:", e.message);
        }
      }

      res.json({ success: true, records: records.reverse() });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Update Status & Remarks (Protected)
  router.patch("/tickets/:ticketId", authMiddleware, async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { status, remarks } = req.body;

      if (ticketsRef) {
        const snap = await ticketsRef.orderByChild("ticketId").equalTo(ticketId).once("value");
        const val = snap.val();
        if (val) {
          const key = Object.keys(val)[0];
          await ticketsRef.child(key).update({ status, remarks });
        }
      }

      if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
        axios.post(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          action: "update_ticket_status",
          ticketId,
          status,
          remarks
        }, {
          headers: { "Content-Type": "text/plain;charset=utf-8" }
        }).catch(err => console.warn("Google Sheet update status notice:", err.message));
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};