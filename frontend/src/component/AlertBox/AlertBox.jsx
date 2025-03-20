import { useState, useEffect } from "react";
import styles from "./AlertBox.module.css"; // Import CSS

const AlertBox = () => {
  const [alertMessage, setAlertMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState(null);

  // Show Alert (Modified to reset confirmCallback)
  const showAlert = (message, callback = null) => {
    setAlertMessage(message);
    setIsConfirm(false);
    setConfirmCallback(() => callback); //Store callback if provided
    setIsVisible(true);
  };

  // Show Confirm Box
  const showConfirm = (message, callback) => {
    setAlertMessage(message);
    setIsConfirm(true);
    setConfirmCallback(() => callback);
    setIsVisible(true);
  };

  // Handle OK click
  const handleOk = () => {
    if (confirmCallback) {
      confirmCallback(true); //Execute callback
      setConfirmCallback(null); //Clear callback to prevent loops
    }
    setIsVisible(false);
  };

  // Handle Cancel click
  const handleCancel = () => {
    if (confirmCallback) {
      confirmCallback(false);
      setConfirmCallback(null); //Clear callback
    }
    setIsVisible(false);
  };

  // Close on Escape Key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isVisible) {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  // Expose functions globally
  window.customAlert = showAlert;
  window.customConfirm = showConfirm;

  return (
    isVisible && (
      <div className={styles.overlay}>
        <div className={`${styles.alertBox} ${styles.fadeIn}`}>
          <p>{alertMessage}</p>
          <div className={styles.buttonContainer}>
            {isConfirm ? (
              <>
                <button onClick={handleOk} className={styles.okButton}>Yes</button>
                <button onClick={handleCancel} className={styles.cancelButton}>No</button>
              </>
            ) : (
              <button onClick={handleOk} className={styles.okButton}>OK</button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default AlertBox;
