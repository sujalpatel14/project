import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./Certificate.module.css";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_PORT } from "../../../../../const";
import { useNavigate } from "react-router-dom";

const CertificateGenerator = () => {
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const location = useLocation();
  const { courseId } = location.state || {};
  const PORT = API_PORT;
  const [percentage, setPercentage] = useState(null);
  const [name, setName] = useState(null);
  const [title, setTitle] = useState(null);

  useEffect(() => {
    const handleDownloadCertificate = async (courseId) => {
      try {
        const response = await axios.get(
          `${PORT}/api/student/download-certificate/${courseId}`,
          { withCredentials: true }
        );

        // Check if response data is null or missing necessary fields
        if (!response.data || !response.data.course || !response.data.student) {
          throw new Error("Invalid certificate data received");
        }

        setTitle(response.data.course.title);
        setName(response.data.student.name);
        setPercentage(response.data.Percentage);
      } catch (error) {
        console.error("Error downloading certificate:", error);
        window.customAlert(
          "Failed to download certificate. Redirecting to profile..."
        );

        // Navigate to Student Profile on error
        navigate("/profile");
      }
    };
    handleDownloadCertificate(courseId);
  }, [courseId]);

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
    <>
      <div className={styles.cover}>
        <div className={styles.container}>
          <div ref={certificateRef} className={styles.certificate}>
            <h1>CodeVerse</h1>
            <h1> Certificate of Completion</h1>
            <p>This is to certify that</p>
            <h2>{name}</h2>
            <p>
              has successfully completed the <b>{title}</b> course with a <br />{" "}
              score of <b>{percentage}%</b>.
            </p>
            <hr />
            <p>Presented By CodeVerse</p>
          </div>
        </div>
        <div className={styles.downaload}>
          <button
            onClick={generateCertificate}
            className={styles.downloadButton}
          >
            Download Certificate
          </button>
        </div>
      </div>
    </>
  );
};

export default CertificateGenerator;
