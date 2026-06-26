import axios from "axios";

export default defineNuxtPlugin(() => {
  const api = axios.create({
    // baseURL: "https://u.ulshot.shop", // API base
    baseURL: "http://20.2.80.155:8080/", // API base
    timeout: 5000,
  });

  // Example interceptor
  api.interceptors.request.use((config) => {
    const token = useCookie("token").value;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    provide: {
      api,
    },
  };
});