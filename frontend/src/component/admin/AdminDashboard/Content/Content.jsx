import  { useState } from "react";
import styles from "./Content.module.css";

const Content = () => {
  const [activeTab, setActiveTab] = useState("Manage Users");

  const renderContent = () => {
    switch (activeTab) {
      case "Manage Users":
        return <div>Manage Users Content</div>;
      case "Manage Courses":
        return <div>Manage Courses Content</div>;
      case "Manage Lessons":
        return <div>Manage Lessons Content</div>;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.tabs}>
        {["Manage Users", "Manage Courses", "Manage Lessons"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? styles.activeTab : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>{renderContent()}</div>
    </div>
  );
};

export default Content;
