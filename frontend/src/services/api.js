// services/api.js
// NOTE: This file is a legacy wrapper. All new code should import from src/api/ directly.
// Dashboard and other pages now use src/api/analysisService.js, tutorialService.js, etc.

export { getAllAnalysis as getAnalysisResults, getRiskTrends } from '../api/analysisService';
export { getTutorials } from '../api/tutorialService';
export { uploadFile } from '../api/uploadService';
