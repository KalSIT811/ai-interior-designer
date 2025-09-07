export interface RedesignResult {
  image: string | null;
  text: string | null;
  colorPalette: string[] | null;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  originalImage: string; // base64 preview
  result: RedesignResult;
  designMode: '2d' | '3d';
}

export interface ImprovementSuggestion {
  suggestion: string;
  // Optional bounding box [x_min, y_min, x_max, y_max] with normalized coordinates (0-1)
  boundingBox?: [number, number, number, number]; 
}

export interface RoomAnalysis {
  currentSpace: {
    style: string;
    pros: string[];
    cons: string[];
  };
  improvementSuggestions: ImprovementSuggestion[];
  newStyleRecommendations: {
    name: string;
    description: string;
  }[];
}