import API from "./axios";

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("uploads/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
