import { useState } from "react";
import { uploadFile } from "../api/uploadService";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    try {
      // Calls the service which packages the file into FormData
      const res = await uploadFile(file);

      alert("Success! Analysis ID: " + res.data.analysis_id);

      // Redirects to dashboard so you can see the new entry in the table
      navigate("/dashboard");
    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert("Upload failed. Make sure your Django server is running and you are logged in.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #eee'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Upload Malware Sample</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Select a file to perform SHA256 hashing and IOC extraction.
        </p>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: '20px', display: 'block', width: '100%' }}
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#bdc3c7' : '#3498db',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '5px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            width: '100%',
            fontWeight: 'bold',
            transition: 'background-color 0.3s'
          }}
        >
          {uploading ? "Analyzing File..." : "Start Analysis"}
        </button>
      </div>
    </div>
  );
}
