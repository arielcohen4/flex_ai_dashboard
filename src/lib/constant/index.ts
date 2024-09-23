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
  "qwen2.5": "qwen.webp",
  tinyllama: "tiny_llama.webp",
  mistral: "mistral.webp",
  "deepseek-coder-v2": "deepseek.webp",
  gemma2: "google.webp",
  phi3: "microsoft.webp",
  jamba: "ai21.webp",
  "yi-1.5": "01-ai.webp",
  "internlm2.5": "internlm.webp",
};
