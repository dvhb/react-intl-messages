import { Message } from '../types';

export interface Provider {
  getKeys(locales: string[]): Promise<void>;
  getMessage(locale: string, id: string): string;
  uploadMessages(messages: Message[], locales: string[]): Promise<void>;
  getNewMessages(): string[];
}
