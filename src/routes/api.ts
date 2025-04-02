import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Define Zod validation schemas
const embedModelSchema = z.object({
  model: z.string().min(1, 'Model name is required'),
  input: z.union([
    z.string().min(1, 'Input text cannot be empty'),
    z.array(z.string().min(1, 'Input text cannot be empty')),
  ]),
  truncate: z.boolean().optional().default(true),
  options: z.record(z.any()).optional().default({}),
  keep_alive: z.string().optional().default('5m'),
});

const embeddingsModelSchema = z.object({
  model: z.string().min(1, 'Model name is required'),
  prompt: z.string().min(1, 'Prompt cannot be empty'),
  options: z.record(z.any()).optional().default({}),
  keep_alive: z.string().optional().default('5m'),
});

// Generate embeddings (new endpoint)
app.post('/embed', async c => {
  try {
    const body = await c.req.json();

    // Validate request body using Zod
    const validationResult = embedModelSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          error: 'Input validation error',
          details: validationResult.error.format(),
        },
        400,
      );
    }

    const { model, input } = validationResult.data;

    // Use Cloudflare AI to generate embeddings
    const env = c.env;

    if (!env.AI) {
      return c.json({ error: 'AI binding not available' }, 500);
    }

    // Generate embeddings using Workers AI
    // Pass the user's requested model to Cloudflare AI
    // In a real implementation, you might want to map Ollama model names to Cloudflare AI model names
    const embeddings = (await env.AI.run(model as keyof AiModels, {
      text: input,
    })) as AiTextEmbeddingsOutput;

    // Format the response to match Ollama API format
    const response = {
      model: model, // Return the requested model name in the response
      embeddings: Array.isArray(input)
        ? embeddings.data.map(embedding => embedding)
        : [embeddings.data[0]],
      total_duration: 14143917, // Mock duration since Workers AI doesn't provide this
      load_duration: 1019500, // Mock duration
      prompt_eval_count: 8, // Mock count
    };

    return c.json(response);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return c.json(
      { error: 'Internal server error', message: error.message },
      500,
    );
  }
});

// Generate embedding (legacy endpoint)
app.post('/embeddings', async c => {
  try {
    const body = await c.req.json();

    // Validate request body using Zod
    const validationResult = embeddingsModelSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json(
        {
          error: 'Input validation error',
          details: validationResult.error.format(),
        },
        400,
      );
    }

    const { model, prompt } = validationResult.data;

    // Use Cloudflare AI to generate embeddings
    const env = c.env;

    if (!env.AI) {
      return c.json({ error: 'AI binding not available' }, 500);
    }

    // Generate embeddings using Workers AI
    // Pass the user's requested model to Cloudflare AI
    // In a real implementation, you might want to map Ollama model names to Cloudflare AI model names
    const embeddings = (await env.AI.run(model as keyof AiModels, {
      text: prompt,
    })) as AiTextEmbeddingsOutput;

    // Format the response to match Ollama API format for legacy endpoint
    const response = {
      embedding: embeddings.data[0],
    };

    return c.json(response);
  } catch (error) {
    console.error('Error generating embedding:', error);
    return c.json(
      { error: 'Internal server error', message: error.message },
      500,
    );
  }
});

export default app;
