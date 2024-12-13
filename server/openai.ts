import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCollectionDescription(title: string): Promise<string> {
  try {
    console.log('Generating collection description for title:', title);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたはアートギャラリーのキュレーターです。アートコレクションの説明文を生成してください。"
        },
        {
          role: "user",
          content: `コレクション「${title}」の説明文を50文字程度で生成してください。アート作品群の特徴や意図を優雅に表現してください。`
        }
      ],
    });

    const description = response.choices[0]?.message?.content;
    if (!description) {
      throw new Error('説明文の生成に失敗しました');
    }

    console.log('Generated collection description:', description);
    return description.trim();
  } catch (error) {
    console.error('Error generating collection description:', error);
    throw error;
  }
}

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

export async function generateExhibitionDescription(
  title: string,
  location: string
): Promise<{ subtitle: string; description: string }> {
  try {
    console.log('Generating exhibition description for:', { title, location });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI APIキーが設定されていません');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたはアートギャラリーのキュレーターです。展示会の説明文を生成してください。"
        },
        {
          role: "user",
          content: `展示会「${title}」（開催場所: ${location}）のサブタイトル（20文字程度）と概要（50文字程度）を生成してください。必ずJSONフォーマットで返してください。例: {"subtitle": "色彩と光の饗宴", "description": "都市の喧騒を離れ、静謐な空間で色彩の織りなす物語に身を委ねる、特別な時間。"}`
        }
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('説明文の生成に失敗しました');
    }

    // Extract JSON from the response
    const matches = content.match(/\{[^]*\}/);
    if (!matches) {
      throw new Error('JSONフォーマットの応答が見つかりませんでした');
    }

    const jsonString = matches[0];
    const parsed = JSON.parse(jsonString) as { subtitle?: string; description?: string };
    
    if (!parsed.subtitle || !parsed.description) {
      throw new Error('サブタイトルまたは説明文が見つかりません');
    }

    return {
      subtitle: parsed.subtitle.trim(),
      description: parsed.description.trim(),
    };
  } catch (error) {
    console.error('Error generating exhibition description:', error);
    throw error;
  }
}