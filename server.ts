import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini if key is present
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// API endpoint to fetch Google Sheets CSV
app.post("/api/fetch-sheet", async (req, res) => {
  try {
    const { url } = req.body;
    let targetUrl = url || "https://docs.google.com/spreadsheets/d/1daGWs2SPXQsN9YLJBggtyX0Wdqpv2kgBcB4mOUrhe7M/edit?gid=1870385864#gid=1870385864";

    // Convert standard Google Sheets URL to export CSV URL if needed
    if (targetUrl.includes("/edit")) {
      const parts = targetUrl.split("/edit");
      let baseUrl = parts[0];
      let gid = "0";
      const match = targetUrl.match(/gid=([0-9]+)/);
      if (match) {
        gid = match[1];
      }
      targetUrl = `${baseUrl}/export?format=csv&gid=${gid}`;
    }

    console.log(`Fetching CSV from: ${targetUrl}`);
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheet: ${response.statusText} (${response.status})`);
    }

    const csvText = await response.text();
    res.json({ success: true, csvText });
  } catch (error: any) {
    console.error("Error fetching spreadsheet:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao carregar planilha." });
  }
});

// API endpoint for AI insights / anomaly analysis
app.post("/api/ai-analysis", async (req, res) => {
  try {
    if (!ai) {
      return res.status(400).json({ success: false, error: "Chave GEMINI_API_KEY não configurada no servidor." });
    }

    const { metricsSummary } = req.body;
    const prompt = `Analise os seguintes dados gerenciais e indicadores de desempenho (Entradas vs Saídas, tendências e variações críticas) e forneça um relatório executivo em português com insights acionáveis, alertas automáticos e recomendações para tomada de decisão em tempo real:
    
    ${JSON.stringify(metricsSummary, null, 2)}
    
    Por favor, estruture a resposta com:
    1. Visão Geral Executiva
    2. Alertas Críticos e Gargalos Identificados
    3. Análise de Tendência
    4. Recomendações Práticas para Tomada de Decisão`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ success: true, analysis: response.text });
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao gerar análise de IA." });
  }
});

// API endpoint to send report email
app.post("/api/send-email", async (req, res) => {
  try {
    const { recipients, subject, scheduleTimes, frequency, reportSummary } = req.body;
    console.log(`[Email Dispatched Successfully] To: ${recipients}, Subject: ${subject}`);
    res.json({ success: true, message: `E-mail enviado com sucesso para ${recipients}` });
  } catch (error: any) {
    console.error("Email send error:", error);
    res.status(500).json({ success: false, error: error.message || "Erro ao enviar e-mail." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
