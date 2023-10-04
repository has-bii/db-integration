import axios from "axios"

const instance = axios.create({
  baseURL: "/api",
  headers: { Accept: "*/*" },
  withCredentials: true,
  timeout: 5000,
})

export default instance
