import mongoose from "mongoose";

const transcriptionSchema = new mongoose.Schema(
  {
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
},
  
    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transcription = mongoose.model(
  "Transcription",
  transcriptionSchema
);

export default Transcription;