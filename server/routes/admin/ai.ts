import { openai } from '../../lib/openai';

export const generateExhibitionContent = async (title: string, location: string) => {
  try {
    const prompt = `アート展示会のタイトル「${title}」と開催場所「${location}」から、以下の内容を生成してください：
1. サブタイトル（50字以内）：展示会の雰囲気や特徴を表現した魅力的なフレーズ
2. 説明文（200字以内）：展示会の内容、特徴、見どころを説明する文章

形式：
{
  "subtitle": "生成されたサブタイトル",
  "description": "生成された説明文"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "あなたはアート展示会のキュレーターです。洗練された表現で展示会の魅力を伝えてください。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('AI content generation error:', error);
    throw new Error('展示会の内容生成に失敗しました');
  }
};
