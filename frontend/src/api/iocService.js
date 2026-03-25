import API from "./axios";

export const getIOCsByAnalysis = (id) =>
  API.get(`ioc/analysis/${id}/`);
