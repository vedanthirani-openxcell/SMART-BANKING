import React from "react";
import api from "../api/api";

const DownloadStatementButton = () => {
  const downloadStatement = async () => {
    try {
      const res = await api.get("/users/download-statement", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "statement.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download statement");
    }
  };

  return (
    <button
      onClick={downloadStatement}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
    >
      Download Statement
    </button>
  );
};

export default DownloadStatementButton;
