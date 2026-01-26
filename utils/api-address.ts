export const APIURL =
  process.env.NEXT_PUBLIC_NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://open-programmes-backend.onrender.com";
