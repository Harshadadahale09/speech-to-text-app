import express from "express";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import Transcription from "../models/Transcription.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/upload",
  upload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No audio file uploaded",
        });
      }

      const audioBuffer = fs.readFileSync(req.file.path);
      console.log("File Type:", req.file.mimetype);
      console.log("File Name:", req.file.originalname);

      const response = await axios.post(
        "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
        audioBuffer,
        {
          headers: {
            Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": req.file.mimetype,
          },
        }
      );

      console.log(
        "Deepgram Response:",
        JSON.stringify(response.data, null, 2)
      );

      const transcript =
        response?.data?.results?.channels?.[0]
          ?.alternatives?.[0]?.transcript || "";

      console.log("Transcript:", transcript);

      const saved = await Transcription.create({
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        text:
          transcript.trim() ||
          "No transcript generated",
      });

      res.status(200).json(saved);
    } catch (error) {
      console.log("ERROR:");
      console.log(error.response?.data || error);

      res.status(500).json({
        message: "Transcription failed",
        error: error.message,
      });
    }
  }
);

router.get("/history", async (req, res) => {
  try {
    const data = await Transcription.find().sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch history",
    });
  }
});

export default router;