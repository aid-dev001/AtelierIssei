import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateArtworkDescription(imageUrl: string): Promise<{ title: string; description: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "この画像はアート作品です。この作品にふさわしいタイトルと説明文を日本語で生成してください。タイトルは30文字以内、説明文は100文字以内でお願いします。JSONフォーマットで返してください。" 
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

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || '無題',
        description: parsed.description || '説明なし',
      };
    } catch (e) {
      // JSONのパースに失敗した場合のフォールバック
      return {
        title: '無題',
        description: content.slice(0, 100),
      };
    }
  } catch (error) {
    console.error('Error generating artwork description:', error);
    return {
      title: '無題',
      description: 'アート作品の説明文を自動生成できませんでした。',
    };
  }
}
