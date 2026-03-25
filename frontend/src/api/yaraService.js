import API from "./axios";

export const getYaraMatches = (id) =>
  API.get(`yara/matches/${id}/`);
