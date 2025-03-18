import { GoogleGenerativeAI } from "@google/generative-ai";

export const aiAssist = async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: "Missing Gemini API Key" });
        }

        if (!query || typeof query !== "string") {
            return res.status(400).json({ error: "Invalid query" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(query);
        const response = await result.response;
        let text = response.text().trim();

        // Extract any code block along with its language
        const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/i;
        const match = text.match(codeBlockRegex);

        if (match) {
            const language = match[1] ? match[1].trim() : ""; // Get language if specified
            text = match[2].trim(); // Extract code content

            // Return formatted code block with language
            res.json({ solution: `\`\`\`${language}\n${text}\n\`\`\`` });
        } else {
            // If no code block, attempt basic formatting (add new lines for readability)
            text = text.replace(/;/g, ";\n").replace(/{/g, "{\n").replace(/}/g, "\n}");
            res.json({ solution: text });
        }
    } catch (error) {
        console.error("AI API Error:", error);
        res.status(500).json({ error: "AI service failed" });
    }
};
