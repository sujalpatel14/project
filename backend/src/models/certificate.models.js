import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  minLecturesRequired: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Certificate", CertificateSchema);
