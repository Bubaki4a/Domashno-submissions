/**
 * Contract for AI chat completion services (DeepInfra, OpenAI, etc.).
 * Application/domain depends on this interface; infrastructure provides implementations.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IChatCompletionClient {
  /**
   * Sends messages to the AI and returns the assistant reply text.
   */
  chat(messages: ChatMessage[]): Promise<string>;
}
