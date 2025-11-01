import { AI_PROVIDERS, callAIAPI, type AIProvider } from './aiApi';

// Mock fetch
global.fetch = jest.fn();

describe('AI API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call OpenAI compatible API correctly', async () => {
    const mockResponse = {
      choices: [{ message: { content: 'Test response' } }],
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const provider: AIProvider = {
      ...AI_PROVIDERS.deepseek,
      apiKey: 'test-key',
    };

    const result = await callAIAPI(provider, [
      { role: 'user', content: 'Hello' },
    ]);

    expect(result.success).toBe(true);
    expect(result.content).toBe('Test response');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.deepseek.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key',
        },
      })
    );
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Invalid API key' } }),
    });

    const provider: AIProvider = {
      ...AI_PROVIDERS.deepseek,
      apiKey: 'invalid-key',
    };

    const result = await callAIAPI(provider, [
      { role: 'user', content: 'Hello' },
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid API key');
  });
});