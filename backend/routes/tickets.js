const express = require("express");
const router = express.Router();
const axios = require("axios");

module.exports = (ticketsRef) => {
  // Submit Grievance & Sync to Firebase + Google Sheets
  router.post("/", async (req, res) => {
    try {
      const payload = req.body;
      const ticketId = "TICKET-" + Math.floor(100000 + Math.random() * 900000);

      const record = {
        ...payload,
        ticketId,
        createdAt: new Date().toISOString(),
        status: "Payment Verified - In Progress"
      };

      // 1. Firebase Write
      if (ticketsRef) {
        await ticketsRef.push(record);
      }

      // 2. Google Sheet Async Sync
      if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
        axios.post(process.env.GOOGLE_SHEET_WEBHOOK_URL, {
          action: "save_record",
          ...record
        }, {
          headers: { "Content-Type": "text/plain;charset=utf-8" }
        }).catch(err => console.warn("Google Sheet sync notice:", err.message));
      }

      res.status(201).json({
        success: true,
        ticketId: record.ticketId,
        applicantName: record.applicantName,
        utrNumber: record.utrNumber,
        amount: record.amount
      });
    } catch (err) {
      console.error("Ticket create error:", err);
      res.status(500).json({ success: false, message: "Failed to process ticket" });
    }
  });

  // Query Ticket Status
  router.get("/status", async (req, res) => {
    try {
      const query = (req.query.query || "").trim().toLowerCase();
      if (!query) {
        return res.status(400).json({ found: false, message: "Query is required" });
      }

      let foundTicket = null;

      // Search Firebase
      if (ticketsRef) {
        const snapshot = await ticketsRef.once("value");
        const data = snapshot.val();
        if (data) {
          const keys = Object.keys(data);
          for (let i = keys.length - 1; i >= 0; i--) {
            const t = data[keys[i]];
            if (
              (t.ticketId && t.ticketId.toLowerCase() === query) ||
              (t.applicantName && t.applicantName.toLowerCase().includes(query)) ||
              (t.utrNumber && String(t.utrNumber).toLowerCase() === query) ||
              (t.contactNumber && String(t.contactNumber).toLowerCase() === query) ||
              (t.loginId && t.loginId.toLowerCase() === query)
            ) {
              foundTicket = t;
              break;
            }
          }
        }
      }

      // Google Sheet Fallback
      if (!foundTicket && process.env.GOOGLE_SHEET_WEBHOOK_URL) {
        try {
          const response = await axios.get(`${process.env.GOOGLE_SHEET_WEBHOOK_URL}?query=${encodeURIComponent(query)}`);
          if (response.data && response.data.found) {
            foundTicket = response.data;
          }
        } catch (e) {
          console.warn("Sheet fallback notice:", e.message);
        }
      }

      if (foundTicket) {
        return res.json({ found: true, ticket: foundTicket });
      }

      return res.json({ found: false });
    } catch (err) {
      res.status(500).json({ found: false, error: err.message });
    }
  });

  return router;
};