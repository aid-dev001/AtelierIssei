import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateArtworkDescription(imageUrl: string): Promise<{ title: string; description: string }> {
  try {
    console.log('Generating artwork description for image:', imageUrl);

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "この画像はアート作品です。この作品にふさわしいタイトルと説明文を日本語か英語で生成してください。必ずJSONフォーマットで返してください。例: {\"title\": \"青い静寂\", \"description\": \"深い青が織りなす静謐な世界\"}" 
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    console.log('OpenAI API response:', response.choices[0].message);

    const content = response.choices[0].message.content;
    if (!content) {
      console.error('No content returned from OpenAI');
      throw new Error('タイトルと説明文の生成に失敗しました。再度お試しください。');
    }

    // Extract JSON from the response
    const jsonString = content.replace(/.*?(\{.*\}).*/s, '$1');
    
    try {
      const parsed = JSON.parse(jsonString);
      
      if (!parsed.title || !parsed.description) {
        console.error('Missing title or description in parsed JSON:', parsed);
        throw new Error('タイトルまたは説明文が見つかりません。再度お試しください。');
      }

      const title = parsed.title.trim();
      const description = parsed.description.trim();

      console.log('Successfully generated content:', { title, description });

      return { title, description };
    } catch (e) {
      console.error('JSON parse error:', e, 'Content:', content);
      throw new Error('生成されたコンテンツの解析に失敗しました。再度お試しください。');
    }
  } catch (error) {
    console.error('Error in generateArtworkDescription:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API')) {
        throw new Error('OpenAI APIとの通信に失敗しました。ネットワーク接続を確認してください。');
      } else if (error.message.includes('JSON')) {
        throw new Error('生成された内容の解析に失敗しました。再度お試しください。');
      }
    }
    
    throw error;
  }
}
