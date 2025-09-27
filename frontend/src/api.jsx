import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const registerUser = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

export const loginUser = async (loginData) => {
  const res = await axios.post(`${API_URL}/login`, loginData);
  return res.data;
};
