import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./Certificate.module.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_PORT } from "../../../../../const";

const CertificateGenerator = () => {
  const certificateRef = useRef(null);
  const location = useLocation();
  const { courseId } = location.state || {};
  const PORT = API_PORT;
  const [ percentage , setPercentage ] = useState(null);
  const [ name , setName ] = useState(null);
  const [ title , setTitle ] = useState(null);

  useEffect(() => {
    const handleDownloadCertificate = async (courseId) => {
      try {
        const response = await axios.get(
          `${PORT}/api/student/download-certificate/${courseId}`,
          { withCredentials: true}
        );
        setTitle(response.data.course.title);
        setName(response.data.student.name);
        setPercentage(response.data.Percentage);
      } catch (error) {
        console.error("Error downloading certificate:", error);
        window.customAlert("Failed to download certificate.");
      }
    };
    handleDownloadCertificate(courseId);
  },[courseId]);

  const generateCertificate = () => {
    const input = certificateRef.current;
    html2canvas(input, { scale: 3 }).then((canvas) => {
      // Increase scale for better quality
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4"); // Ensure proper PDF dimensions
      pdf.addImage(imgData, "PNG", 10, 10, 280, 180);
      pdf.save(`Certificate_${name}.pdf`);
    });
  };

  return (
    <div className={styles.container}>
      <div ref={certificateRef} className={styles.certificate}>
        <h1>Certificate of Completion</h1>
        <p>This is to certify that</p>
        <h2>{name}</h2>
        <p>has successfully completed the</p>
        <h3>{title}</h3>
        <h3>{percentage}%</h3>
        <p>course with excellence.</p>
        <p>Date: {new Date().toLocaleDateString()}</p>
      </div>

      <button onClick={generateCertificate} className={styles.downloadButton}>
        Download Certificate
      </button>
    </div>
  );
};

export default CertificateGenerator;
