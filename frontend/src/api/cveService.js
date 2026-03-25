import API from "./axios";

export const getCVEMatches = (id) =>
  API.get(`cve/matches/${id}/`);
