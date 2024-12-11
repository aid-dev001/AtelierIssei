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
              text: "この画像はアート作品です。短く簡潔なタイトルと説明文を生成してください。タイトルは10文字以内で日本語か英語で（例: \"Serenity\" や \"静寂\"）、説明文は30文字以内の日本語でお願いします。必ずJSONフォーマットで返してください。例: {\"title\": \"Harmony\", \"description\": \"温かな色彩が織りなす静謐な世界\"}" 
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
      throw new Error('OpenAI APIからコンテンツが生成されませんでした');
    }

    try {
      const parsed = JSON.parse(content);
      
      if (!parsed.title || !parsed.description) {
        throw new Error('生成されたコンテンツにタイトルまたは説明文が含まれていません');
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
