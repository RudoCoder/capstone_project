import API from "./axios";

export const getAllAnalysis = () =>
  API.get("analysis/");

export const getAnalysisById = (id) =>
  API.get(`analysis/${id}/`);

export const getRiskTrends = () =>
  API.get("analysis/risk-trends/");
