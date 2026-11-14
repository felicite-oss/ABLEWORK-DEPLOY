const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export const MAX_UPLOAD_MB = 10;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const MAX_EMPLOYER_DOCS = 2;

export default API_BASE_URL;