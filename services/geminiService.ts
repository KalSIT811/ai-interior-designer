import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import { RedesignResult, RoomAnalysis } from '../types';
import { REDESIGN_MODEL_NAME, ANALYSIS_MODEL_NAME } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Attempt to parse the message as JSON, which might contain the detailed API error
    try {
      const parsedError = JSON.parse(error.message);
      if (parsedError.error) {
        const { code, status } = parsedError.error;
        if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
          return 'API 사용 할당량을 초과했습니다. 잠시 후 다시 시도하거나, Google AI Studio에서 요금제 및 결제 세부 정보를 확인해주세요.';
        }
        // Return a slightly cleaner version of other API errors
        return `API 오류가 발생했습니다. (코드: ${code || 'N/A'}, 상태: ${status || 'N/A'}). 잠시 후 다시 시도해주세요.`;
      }
    } catch (e) {
      // Not a JSON error, so just return the original message
      return error.message;
    }
    return error.message;
  }
  return '알 수 없는 오류가 발생했습니다.';
}

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    currentSpace: {
      type: Type.OBJECT,
      properties: {
        style: { type: Type.STRING, description: '지배적인 스타일 (예: 미니멀리스트, 모던, 스칸디나비아 등). 혼합된 경우 설명.' },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3가지 긍정적인 측면 (예: "채광이 좋음", "기능적 공간 분리가 잘 되어 있음").' },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: '2-3가지 개선점 (예: "가구 배치가 다소 복잡함", "색상 조화가 아쉬움").' },
      },
      required: ['style', 'pros', 'cons']
    },
    improvementSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          suggestion: { type: Type.STRING, description: '실행 가능한 구체적인 제안 (예: "벽이 허전해 보이니 추상화 액자를 걸어 포인트를 주세요.").' },
          boundingBox: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER },
            description: '제안이 적용될 이미지 영역의 정규화된 경계 상자 [x_min, y_min, x_max, y_max]. 일반적인 제안의 경우 생략.'
          }
        },
        required: ['suggestion']
      },
      description: '3-5개의 실행 가능한 구체적인 제안 목록.'
    },
    newStyleRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: '추천 스타일의 이름 (예: "자연주의 (Japandi)").' },
          description: { type: Type.STRING, description: '이 스타일이 왜 잘 어울리는지에 대한 간략한 설명.' }
        },
        required: ['name', 'description']
      },
      description: '공간의 구조와 잠재력에 어울리는 2가지 대안 스타일을 제안.'
    }
  },
  required: ['currentSpace', 'improvementSuggestions', 'newStyleRecommendations']
};


export const analyzeRoom = async (imageFile: File): Promise<RoomAnalysis> => {
  try {
    const base64ImageData = await fileToBase64(imageFile);
    
    const prompt = `You are an expert AI interior designer with a keen eye for aesthetics, functionality, and current trends. Your task is to analyze the user's room photo and return a structured JSON response based on the provided schema. Provide the analysis entirely in Korean.

For each \`improvementSuggestions\`, if the suggestion refers to a specific, identifiable area in the image, you MUST provide a \`boundingBox\` array with four normalized floating-point numbers: [x_min, y_min, x_max, y_max].
- (0, 0) is the top-left corner of the image.
- (1, 1) is the bottom-right corner.
- For example, to highlight the entire left half of the image, the box would be [0, 0, 0.5, 1].
- If a suggestion is general and does not apply to a specific spot (e.g., "Improve overall lighting"), you MUST omit the \`boundingBox\` field for that suggestion.

Your tone should be encouraging, professional, and inspiring. The goal is to give the user valuable, expert-level feedback they can act upon.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: ANALYSIS_MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: imageFile.type,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    if (response.promptFeedback?.blockReason) {
      console.error(`Request blocked. Reason: ${response.promptFeedback.blockReason}`, response.promptFeedback);
      const reason = response.promptFeedback.blockReason.replace(/_/g, ' ').toLowerCase();
      throw new Error(`AI가 안전상의 이유로 분석 요청을 처리할 수 없습니다 (${reason}).`);
    }

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("AI로부터 분석 내용을 받지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
    
    try {
      return JSON.parse(textResponse) as RoomAnalysis;
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError, "응답:", textResponse);
      throw new Error("AI 응답을 파싱하는 데 실패했습니다. 형식이 올바르지 않을 수 있습니다.");
    }

  } catch (error) {
    console.error("방 분석 중 오류:", error);
    throw new Error(getApiErrorMessage(error));
  }
};

export const redesignRoom = async (
  imageFile: File,
  prompt: string,
  designMode: '2d' | '3d'
): Promise<RedesignResult> => {
  try {
    const base64ImageData = await fileToBase64(imageFile);
    
    const modeInstruction = designMode === '3d' 
      ? "Re-render the photo as a hyper-realistic 3D visualization. Use the original photo as a direct reference for layout, scale, and composition. The final image must look like a professional 3D render, with realistic lighting, materials, shadows, and reflections. Do not change the camera angle or perspective. The goal is to show what the exact same room would look like as a high-quality 3D render with the user's requested changes applied."
      : "Redesign the room while strictly maintaining the original camera perspective and layout. The changes should be seamlessly integrated into the original photo.";

    const fullPrompt = `**Strict instructions: You MUST return a new image as your primary output.**

You are an expert AI interior designer. Your goal is to modify the user's room photo based on their request. Your response will be parsed by a program and must follow a specific format.

Your response must contain exactly two parts in this order:
1.  The edited image.
2.  A text description.

**Image Generation Rules:**
${modeInstruction}

**Text Description Rules:**
- First, briefly describe the design changes you made.
- After the description, provide a 5-color palette in hex codes. The format must be exactly:
[PALETTE]
#1A2B3C
#D4E5F6
#789ABC
#DEF012
#FFFFFF
[/PALETTE]

**User Request:** "${prompt}"`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: REDESIGN_MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: imageFile.type,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.promptFeedback?.blockReason) {
      console.error(`Request blocked. Reason: ${response.promptFeedback.blockReason}`, response.promptFeedback);
      const reason = response.promptFeedback.blockReason.replace(/_/g, ' ').toLowerCase();
      throw new Error(`AI가 안전상의 이유로 요청을 처리할 수 없습니다 (${reason}). 다른 이미지나 문구를 사용해 주세요.`);
    }

    const candidate = response.candidates?.[0];

    if (!candidate) {
        throw new Error("AI로부터 응답을 받지 못했습니다. 네트워크 문제일 수 있으니 잠시 후 다시 시도해 주세요.");
    }

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        const reason = candidate.finishReason.replace(/_/g, ' ').toLowerCase();
        let userMessage = `디자인 생성이 중단되었습니다 (이유: ${reason}).`;
        if (candidate.finishReason === 'SAFETY') {
            userMessage = `AI가 안전상의 이유로 결과 생성을 중단했습니다. 다른 이미지나 문구를 사용해 주세요.`;
        } else if (candidate.finishReason === 'MAX_TOKENS') {
            userMessage = `생성된 디자인이 너무 길어 결과가 잘렸습니다. 요청을 좀 더 간결하게 수정해 보세요.`;
        }
        throw new Error(userMessage);
    }
    
    if (!candidate.content?.parts || candidate.content.parts.length === 0) {
        throw new Error("AI가 응답했지만 결과물을 생성하지 못했습니다. 요청을 수정하여 다시 시도해 주세요.");
    }

    const result: RedesignResult = { image: null, text: null, colorPalette: null };
    let rawText = '';

    for (const part of candidate.content.parts) {
      if (part.text) {
        rawText += part.text;
      } else if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        result.image = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }

    const paletteRegex = /\[PALETTE\]([\s\S]*?)\[\/PALETTE\]/;
    const paletteMatch = rawText.match(paletteRegex);

    if (paletteMatch && paletteMatch[1]) {
      const hexCodes = paletteMatch[1]
        .trim()
        .split(/[\n,]+/)
        .map(hex => hex.trim())
        .filter(hex => /^#([0-9A-F]{3}){1,2}$/i.test(hex));
      
      if (hexCodes.length > 0) {
        result.colorPalette = hexCodes;
      }
    }
    
    result.text = rawText.replace(paletteRegex, '').trim();

    if (!result.image) {
      if (result.text) {
        console.warn("API returned text but no image. Text:", result.text);
        throw new Error("AI가 이미지를 생성하지 못했습니다. 요청을 좀 더 구체적으로 작성하여 다시 시도해 주세요. 예: '소파를 빨간색으로 바꾸고 나무 바닥을 추가해줘.'");
      }
      throw new Error("API 응답에 이미지 데이터가 포함되어 있지 않습니다. 다시 시도해 주세요.");
    }

    return result;
  } catch (error) {
    console.error("방 디자인 변경 중 오류:", error);
    throw new Error(getApiErrorMessage(error));
  }
};