import type { ConnectorHandler } from "./types";

export const openAiConnector: ConnectorHandler = async ({ payload, node, settings }) => {
  const prompt = String(node.data.config.prompt ?? "Summarize this payload.");
  const model = String(node.data.config.model ?? "gpt-4.1-mini");

  if (!settings.openaiApiKey) {
    return {
      output: {
        ...payload,
        openai: {
          model,
          output:
            "OpenAI API key is not configured. Returning fallback summary from local execution engine.",
          fallback: true,
        },
      },
    };
  }

  const requestBody = {
    model,
    input: [
      {
        role: "user",
        content: `${prompt}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
    max_output_tokens: 240,
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openaiApiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}.`);
  }

  const body = (await response.json()) as {
    output_text?: string;
  };

  return {
    output: {
      ...payload,
      openai: {
        model,
        output: body.output_text ?? "",
      },
    },
  };
};
