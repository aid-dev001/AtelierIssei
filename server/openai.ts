import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateArtworkDescription(imageUrl: string): Promise<{ title: string; description: string }> {
  try {
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Generating artwork description for image:', imageUrl);

    // Base64エンコードされた画像データの場合の処理を追加
    const imageUrlToUse = imageUrl.startsWith('data:image') 
      ? imageUrl 
      : `data:image/jpeg;base64,${Buffer.from(imageUrl).toString('base64')}`;

    console.log('Using image URL format:', imageUrlToUse.substring(0, 50) + '...');

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
                url: imageUrlToUse,
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
      console.error('Detailed error information:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error.message.includes('API')) {
        throw new Error('OpenAI APIとの通信に失敗しました。ネットワーク接続を確認してください。');
      } else if (error.message.includes('JSON')) {
        throw new Error('生成された内容の解析に失敗しました。再度お試しください。');
      } else if (error.message.includes('invalid_api_key')) {
        throw new Error('OpenAI APIキーが無効です。APIキーを確認してください。');
      } else if (error.message.includes('insufficient_quota')) {
        throw new Error('OpenAI APIの利用制限に達しました。');
      } else if (error.message.includes('rate_limit_exceeded')) {
        throw new Error('OpenAI APIのレート制限に達しました。しばらく待ってから再試行してください。');
      }
    }
    
    throw new Error(`予期せぬエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
}
