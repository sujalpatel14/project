import Certificate from "../models/certificate.models.js";
import { Progress } from "../models/progress.models.js";
import { Course }  from "../models/course.models.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import generateCertificate from "../utils/generateCertificate.js";
import convertHtmlToPdf from "../utils/pdfConverter.js";
import path from "path";
import fs from "fs-extra";


export const getCoursesWithCertificates = async (req, res) => {
    try {
      // Get all courses
      const courses = await Course.find();
  
      // Get all certificates with populated course details
      const certificates = await Certificate.find().populate("courseId");
  
      // Create separate lists for courses with and without certificates
      const coursesWithCertificate = certificates.map((cert) => ({
        _id: cert.courseId?._id || null,
        title: cert.courseId?.title || "Unknown Course",
        minLecturesRequired: cert.minLecturesRequired,
        certificateId: cert._id,
      }));
  
      const certifiedCourseIds = coursesWithCertificate.map((cert) => cert._id?.toString());
  
      const coursesWithoutCertificate = courses
        .filter(course => !certifiedCourseIds.includes(course._id.toString()))
        .map(course => ({
          _id: course._id,
          title: course.title,
        }));
  
      res.status(200).json({ coursesWithCertificate, coursesWithoutCertificate });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

export const createOrUpdateCertificate = async (req, res) => {
  try {
    const { courseId, minLecturesRequired } = req.body;

    let certificate = await Certificate.findOne({ courseId });

    if (certificate) {
      certificate.minLecturesRequired = minLecturesRequired;
      await certificate.save();
      res.status(200).json({ message: "Certificate updated successfully" });
    } else {
      certificate = new Certificate({ courseId, minLecturesRequired });
      await certificate.save();
      res.status(201).json({ message: "Certificate created successfully" });
    }
  } catch (error) {
    console.error("Error saving certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    await Certificate.findByIdAndDelete(id);
    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentCertificates = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find courses where the student is eligible for a certificate
    const certificates = await Certificate.find().populate("courseId");

    const studentProgress = await Progress.find({ userId });

    const eligibleCertificates = certificates.filter((cert) => {
      const progress = studentProgress.find(
        (p) => p.courseId.toString() === cert.courseId._id.toString()
      );
      return progress && progress.completedLessons.length >= cert.minLecturesRequired;
    });

    res.json(eligibleCertificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ message: "Error fetching certificates" });
  }
};


export const downloadCertificate = async (req, res) => {
  try {
    //Extract JWT token from cookies
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized access" });

    //Decode JWT to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { courseId } = req.params;

    //Validate certificate existence
    const certificate = await Certificate.findOne({ courseId });
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Validate student progress
    const progress = await Progress.findOne({ userId, courseId });
    if (!progress || progress.completedLessons.length < certificate.minLecturesRequired) {
      return res.status(403).json({
        message: "Complete required lectures to download the certificate.",
      });
    }

    const student = await User.findById(userId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({ message: "Student or course not found" });
    }

    const Percentage = progress.completionPercentage;

    return res.status(200).json({student, course, Percentage})
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Server error" });
  }
};
