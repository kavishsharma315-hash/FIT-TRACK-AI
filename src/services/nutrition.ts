/**
 * Edamam Nutrition Analysis API Service
 * Provides real-time nutrition data for ingredients or meals.
 */

const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

export interface NutritionData {
  calories: number;
  totalWeight: number;
  dietLabels: string[];
  healthLabels: string[];
  totalNutrients: {
    PROCNT: { label: string; quantity: number; unit: string }; // Protein
    FAT: { label: string; quantity: number; unit: string };    // Fat
    CHOCDF: { label: string; quantity: number; unit: string }; // Carbs
  };
}

export async function getNutritionInfo(query: string): Promise<NutritionData | null> {
  if (!APP_ID || !APP_KEY) {
    console.warn("Edamam API credentials missing. Please set VITE_EDAMAM_APP_ID and VITE_EDAMAM_APP_KEY.");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.edamam.com/api/nutrition-data?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Edamam API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Edamam returns 0 calories if it can't parse the ingredient
    if (data.calories === 0 && (!data.totalNutrients || Object.keys(data.totalNutrients).length === 0)) {
      return null;
    }

    return data as NutritionData;
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return null;
  }
}
