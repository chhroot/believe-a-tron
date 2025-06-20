import { GoogleGenerativeAI } from "@google/generative-ai";
import { TweetData } from "../types/twitter.type";
import { AIAnalysis } from "../types/ai.type";


let genAI: GoogleGenerativeAI | null = null;

function initializeAI(): GoogleGenerativeAI | null {
  if (!genAI && process.env.AI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
  }
  return genAI;
}

export async function analyzeTweetWithAI(tweetData: TweetData | string): Promise<AIAnalysis> {
  const data: TweetData = typeof tweetData === 'string' 
    ? { text: tweetData, mediaUrls: [] }
    : tweetData;

  try {
    const ai = initializeAI();
    
    if (!ai) {
      console.log('AI_API_KEY not found, returning placeholder response');
      return {
        is_worth_buying: false,
        reason: 'AI_API_KEY not configured',
        confidence_score: 0
      };
    }

    const model = ai.getGenerativeModel({ 
      model: "gemini-2.0-flash"
    });

    const contentParts: any[] = [];
    
    const textPrompt = `
    Analyze the following tweet from a crypto project founder/team member and determine if it indicates a good buying opportunity.
    
    Tweet: "${data.text}"
    ${data.mediaUrls && data.mediaUrls.length > 0 ? 
      `\nThis tweet also contains ${data.mediaUrls.length} image(s). Please analyze both the text and the images together.` : ''}
    
    Consider:
    - Is this announcing a major update, partnership, or milestone?
    - Does it show positive momentum or development progress?
    - Is it just casual conversation or spam?
    - Does it indicate potential price movement?
    - If images are present, do they show charts, announcements, meetings, partnerships, product demos, or other bullish indicators?
    
    Respond ONLY in valid JSON format:
    {
      "is_worth_buying": true,
      "reason": "Brief explanation of your decision including any visual analysis",
      "confidence_score": 0.85
    }
    `;
    
    contentParts.push({ text: textPrompt });
    
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      for (const imageUrl of data.mediaUrls) {
        try {
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const imageData = Buffer.from(imageBuffer).toString('base64');
            
            contentParts.push({
              inlineData: {
                data: imageData,
                mimeType: imageResponse.headers.get('content-type') || 'image/jpeg'
              }
            });
          }
        } catch (imageError) {
          console.log(`Failed to fetch image ${imageUrl}:`, imageError);
        }
      }
    }

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const text = response.text();
    
    console.log('AI Response:', text);
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]) as Partial<AIAnalysis>;
        return {
          is_worth_buying: analysis.is_worth_buying || false,
          reason: analysis.reason || 'No reason provided',
          confidence_score: analysis.confidence_score || 0
        };
      }
    } catch (parseError) {
      console.log('Failed to parse AI response as JSON, using fallback');
    }
    
    const positiveKeywords = ['launch', 'partnership', 'update', 'milestone', 'announcement', 'bullish', 'moon'];
    const hasPositiveKeywords = positiveKeywords.some(keyword => 
      data.text.toLowerCase().includes(keyword)
    );
    
    return {
      is_worth_buying: hasPositiveKeywords,
      reason: hasPositiveKeywords ? 'Contains positive keywords' : 'No significant positive indicators',
      confidence_score: hasPositiveKeywords ? 0.6 : 0.3
    };
    
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return {
      is_worth_buying: false,
      reason: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence_score: 0
    };
  }
} 