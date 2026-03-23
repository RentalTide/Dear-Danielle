const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

const SYSTEM_PROMPT = `You are an expert fashion stylist and rental marketplace listing assistant for Dear Danielle, a fashion rental marketplace. Your job is to analyze clothing/accessory images and listing details to generate compelling rental listing content.

You must respond with valid JSON only, no markdown or explanation. The JSON must have this exact structure:
{
  "description": "A compelling 2-4 sentence rental listing description that highlights the item's appeal, fit, and ideal occasions. Write in an engaging, aspirational tone.",
  "suggestedSize": "one of: xxs, xs, s, m, l, xl, xxl, xxxl, one-size",
  "suggestedColor": "one of: black, white, red, blue, green, pink, purple, orange, yellow, brown, gray, navy, beige, gold, silver, multi",
  "suggestedOccasions": ["array of relevant occasions from: wedding, date-night, work, casual, formal, cocktail, vacation, brunch, festival, party"],
  "suggestedCategory": "a fashion category suggestion (e.g. Dresses, Tops, Bottoms, Outerwear, Accessories, Shoes, Bags, Jumpsuits, Swimwear)"
}

Guidelines:
- Make the description enticing for someone considering renting this item
- If you can see size labels or tags in images, use those for suggestedSize
- If no size is visible, make your best guess based on the garment proportions or say "m" as default
- Choose the single most dominant color for suggestedColor, or "multi" if truly multicolored
- Select 2-4 most relevant occasions for suggestedOccasions
- Be specific but concise in the description`;

module.exports = (req, res) => {
  const { imageUrls, category, title } = req.body || {};
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'AI assist is not configured. ANTHROPIC_API_KEY is missing.',
    });
  }

  // Build the user message content
  const contentParts = [];

  // Add images if provided (using Claude vision)
  if (imageUrls && imageUrls.length > 0) {
    imageUrls.forEach(url => {
      contentParts.push({
        type: 'image',
        source: {
          type: 'url',
          url: url,
        },
      });
    });
  }

  // Build text prompt
  let textPrompt = 'Please analyze this fashion item and generate a rental listing.';
  if (title) {
    textPrompt += `\nThe seller has titled it: "${title}"`;
  }
  if (category) {
    textPrompt += `\nThe seller categorized it as: "${category}"`;
  }
  if (!imageUrls || imageUrls.length === 0) {
    textPrompt +=
      '\nNo images were provided, so base your suggestions on the title and category only.';
  }

  contentParts.push({
    type: 'text',
    text: textPrompt,
  });

  const requestBody = {
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: contentParts,
      },
    ],
  };

  fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          console.error('Anthropic API error:', response.status, text);
          throw new Error(`Anthropic API returned ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      // Extract the text content from Claude's response
      const textContent = data.content && data.content.find(block => block.type === 'text');
      if (!textContent || !textContent.text) {
        throw new Error('No text content in AI response');
      }

      // Parse the JSON response from Claude
      let suggestions;
      try {
        suggestions = JSON.parse(textContent.text);
      } catch (parseError) {
        // Try to extract JSON from the response if it contains extra text
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      res.status(200).json(suggestions);
    })
    .catch(e => {
      console.error('AI listing assist error:', e);
      res.status(500).json({
        error: 'AI suggestions are temporarily unavailable. Please try again or fill in the details manually.',
      });
    });
};
