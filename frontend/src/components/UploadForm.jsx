import { useState } from "react";
import API from "../api/axios";

export default function UploadForm() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("uploads/upload/", formData);
      alert("Analysis ID: " + res.data.analysis_id);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Upload failed: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
