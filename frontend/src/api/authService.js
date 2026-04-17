import API from "./axios";

export const registerUser = (data) =>
  API.post("users/register/", data);

export const loginUser = (data) =>
  API.post("token/", data); // JWT endpoint

export const getProfile = () =>
  API.get("users/profile/");

export const updateProfile = (data) =>
  API.patch("users/profile/", data);
