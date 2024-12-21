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
    console.log('Starting artwork description generation...');
    console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      throw new Error('OpenAI APIキーが設定されていません');
    }

    // OpenAI APIにリクエストを送信
    console.log('Sending request to OpenAI API...');
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたはアート作品の専門家です。芸術的な感性を持って、作品のタイトルと説明文を生成してください。"
        },
        {
          role: "user",
          content: "新しいアート作品のタイトルと説明文を生成してください。以下の条件に従ってください：\n" +
                  "1. タイトルは10文字程度で、作品の本質を捉えた印象的なものにする\n" +
                  "2. 説明文は30文字程度で、作品の特徴や感情を表現する\n" +
                  "3. 必ずJSONフォーマットで返す\n" +
                  "例: {\"title\": \"青い静寂\", \"description\": \"深い青が織りなす静謐な世界\"}"
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
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
          content: "あなたはアートギャラリーのキュレーターです。展示会の説明文を生成してください。以下の形式で返してください：\n{\"subtitle\": \"サブタイトル\", \"description\": \"説明文\"}"
        },
        {
          role: "user",
          content: `展示会「${title}」（開催場所: ${location}）のサブタイトル（20文字程度）と概要（50文字程度）を生成してください。芸術的で魅力的な表現を使用してください。`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('OpenAI response content is empty');
      throw new Error('説明文の生成に失敗しました');
    }

    console.log('Raw OpenAI response:', content);

    try {
      const parsed = JSON.parse(content) as { subtitle?: string; description?: string };
      
      if (!parsed.subtitle || !parsed.description) {
        console.error('Missing required fields in parsed response:', parsed);
        throw new Error('生成された応答に必要なフィールドが含まれていません');
      }

      return {
        subtitle: parsed.subtitle.trim(),
        description: parsed.description.trim(),
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Response content:', content);
      throw new Error('生成された応答の解析に失敗しました');
    }
  } catch (error) {
    console.error('Error generating exhibition description:', error);
    if (error instanceof Error) {
      throw new Error(`展示会の説明文生成に失敗しました: ${error.message}`);
    }
    throw new Error('展示会の説明文生成に失敗しました');
  }
}