import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
};

export const summarizeText = async (text: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const modelName = 'gemini-2.5-flash';

    const prompt = `Anda adalah asisten AI yang ahli dalam meringkas teks. Buat ringkasan yang jelas dan ringkas dari transkripsi berikut dalam Bahasa Indonesia. Fokus pada poin-poin utama dan ide-ide sentral.\n\nTranskripsi:\n"${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing text:", error);
        throw new Error("Gagal membuat ringkasan. Model AI tidak dapat memproses permintaan.");
    }
};
  
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const modelName = 'gemini-2.5-flash';
    
    const base64Data = await blobToBase64(audioBlob);

    const prompt = "Transkripsikan audio berikut dalam Bahasa Indonesia. Hasilnya harus berupa teks transkripsi saja, tanpa tambahan apapun.";

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: audioBlob.type || 'audio/webm',
                            data: base64Data,
                        }
                    }
                ]
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Gagal mentranskripsi audio. Model AI tidak dapat memproses permintaan.");
    }
};

export const analyzeMedia = async (file: File): Promise<AnalysisResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Use gemini-2.5-pro for video for its superior understanding capabilities, and flash for audio.
    const modelName = file.type.startsWith('video/') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    const base64Data = await fileToBase64(file);

    const prompt = `Anda adalah asisten AI untuk agensi Humas. Analisis konten audio dari file media berikut yang disediakan dalam format base64. Lakukan tugas-tugas berikut dalam bahasa Indonesia:
1.  **Transkripsi dan Diarisasi Pembicara**: Transkripsikan audio secara lengkap. Identifikasi dan tandai setiap pembicara yang berbeda (misal: [Pembicara 1], [Pembicara 2]).
2.  **Ringkasan Eksekutif**: Buat ringkasan eksekutif (maksimal 300 kata) yang menyoroti poin-poin keputusan, pernyataan kunci, dan nama instansi atau tokoh penting yang disebutkan.
3.  **Poin-Poin Penting**: Sajikan 5 hingga 10 poin utama atau topik yang dibahas dalam format daftar.
4.  **Ekstraksi Topik**: Identifikasi dan ekstrak topik-topik utama dan kata kunci yang relevan.
5.  **Analisis Sentimen**: Tentukan sentimen keseluruhan dari konten (Positif, Negatif, atau Netral).

Format output Anda HARUS berupa objek JSON yang valid sesuai dengan skema yang diberikan.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            transkripsi: {
                type: Type.STRING,
                description: "Transkripsi lengkap dengan label pembicara (diarisasi)."
            },
            ringkasanEksekutif: {
                type: Type.STRING,
                description: "Ringkasan eksekutif maksimal 300 kata."
            },
            poinPenting: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Daftar 5-10 poin utama."
            },
            topik: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Daftar topik utama dan kata kunci."
            },
            sentimen: {
                type: Type.STRING,
                description: "Sentimen keseluruhan (Positif, Negatif, atau Netral)."
            }
        },
        required: ["transkripsi", "ringkasanEksekutif", "poinPenting", "topik", "sentimen"]
    };

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: file.type,
                            data: base64Data,
                        }
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnalysisResult;

    } catch (error) {
        console.error("Error analyzing media:", error);
        throw new Error("Failed to analyze media. The AI model could not process the request.");
    }
};