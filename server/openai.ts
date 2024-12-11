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
              text: "この画像はアート作品です。この作品にふさわしいタイトルと説明文を日本語か英語で生成してください。タイトルは10文字程度、説明文は30文字程度でお願いします。必ずJSONフォーマットで返してください。例: {\"title\": \"青い静寂\", \"description\": \"深い青が織りなす静謐な世界\"}" 
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
      max_tokens: 300,
    });

    console.log('OpenAI API response:', response.choices[0].message);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('タイトルと説明文の生成に失敗しました。再度お試しください。');
    }

    try {
      const parsed = JSON.parse(content);
      
      if (!parsed.title || !parsed.description) {
        throw new Error('タイトルと説明文の形式が正しくありません。もう一度お試しください。');
      }

      const title = parsed.title;
      const description = parsed.description;

      console.log('Generated content:', { title, description });

      return { title, description };
    } catch (e) {
      console.error('JSON parse error:', e, 'Content:', content);
      throw new Error('生成されたコンテンツの解析に失敗しました');
    }
  } catch (error) {
    console.error('Error in generateArtworkDescription:', error);
    throw error;
  }
}
