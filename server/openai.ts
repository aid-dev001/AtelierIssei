import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateArtworkDescription(imageUrl: string): Promise<{ title: string; description: string }> {
  try {
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Generating artwork description for image:', imageUrl);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    if (!imageUrl) {
      throw new Error('画像URLが提供されていません');
    }

    // 画像データの取得を試みる
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`画像の取得に失敗しました: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const buffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    const imageUrlToUse = `data:image/jpeg;base64,${base64Image}`;
    console.log('Successfully converted image to base64');

    // OpenAI APIにリクエストを送信
    console.log('Sending request to OpenAI API...');
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      max_tokens: 300,
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
    });

    if (!openaiResponse.choices?.[0]?.message?.content) {
      console.error('Invalid response from OpenAI:', openaiResponse);
      throw new Error('OpenAI APIからの応答が不正です');
    }

    const content = openaiResponse.choices[0].message.content;
    console.log('Raw content from OpenAI:', content);

    // Extract JSON from the response using a safer method
    const matches = content.match(/\{[^]*\}/);
    if (!matches) {
      throw new Error('JSONフォーマットの応答が見つかりませんでした');
    }

    const jsonString = matches[0];
    console.log('Extracted JSON string:', jsonString);

    try {
      const parsed = JSON.parse(jsonString) as { title?: string; description?: string };
      console.log('Parsed JSON content:', parsed);
      
      if (!parsed.title || !parsed.description) {
        console.error('Missing title or description in parsed JSON:', parsed);
        throw new Error(`タイトルまたは説明文が見つかりません。受信したデータ: ${JSON.stringify(parsed)}`);
      }

      const title = parsed.title.trim();
      const description = parsed.description.trim();

      console.log('Successfully generated content:', { title, description });
      return { title, description };
    } catch (error) {
      console.error('JSON parse error:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      throw new Error(`生成されたコンテンツの解析に失敗しました。エラー: ${errorMessage}`);
    }
  } catch (error) {
    console.error('Error in generateArtworkDescription:', error);
    if (error instanceof Error) {
      if (error.message.includes('API')) {
        throw new Error(`OpenAI APIエラー: ${error.message}`);
      }
      if (error.message.includes('deprecated')) {
        throw new Error('OpenAIのモデルが更新されました。システム管理者に連絡してください。');
      }
      throw new Error(`画像処理エラー: ${error.message}`);
    }
    throw new Error('予期せぬエラーが発生しました');
  }
}
