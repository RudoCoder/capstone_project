import { useState } from "react";
import { uploadFile } from "../api/uploadService";

export default function UploadPage() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const res = await uploadFile(file);
    alert("Analysis ID: " + res.data.analysis_id);
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
