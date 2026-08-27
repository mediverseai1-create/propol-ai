import { GoogleGenerativeAI } from "@google/generative-ai"

let genAI: GoogleGenerativeAI | null = null

export function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured")
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export async function generateWithGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const client = getGeminiClient()
  const model = client.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: systemInstruction || "You are PROPOL AI, an expert B2B procurement and proposal intelligence assistant. You help businesses discover opportunities, analyze their fit, and prepare professional proposals and applications. Always respond with accurate, professional, and actionable information. Never fabricate facts, certifications, or business credentials.",
  })

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function generateJSONWithGemini<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T> {
  const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, no code blocks. Pure JSON only.`
  const text = await generateWithGemini(jsonPrompt, systemInstruction)

  // Clean up potential markdown code blocks
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()

  return JSON.parse(cleaned) as T
}
