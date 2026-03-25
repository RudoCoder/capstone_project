import API from "./axios";

export const submitFeedback = (data) =>
  API.post("feedback/submit/", data);

export const getMyFeedback = () =>
  API.get("feedback/my/");
