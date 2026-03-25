import API from "./axios";

export const getTutorials = () =>
  API.get("tutorials/");
