export const protectedPaths = [
  "/",
  "/tasks",
  "/models",
  "/settings",
  "/datasets",
  "/settings/api-keys",
];
export const baseApiUrl = "https://api.getflex.ai";

export const familyToLogo: { [key: string]: string } = {
  llama3: "meta.webp",
  "llama3.1": "meta.webp",
  "command-r": "cohere.webp",
  qwen2: "qwen.webp",
  tinyllama: "tiny_llama.webp",
  mistral: "mistral.webp",
  "deepseek-coder-v2": "deepseek.webp",
  gemma2: "google.webp",
  phi3: "microsoft.webp",
};
