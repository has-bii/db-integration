import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "*/*" },
  withCredentials: true,
  timeout: 5000,
});

export default instance;
