import { Message } from '../types';

export interface Provider {
  getKeys(): Promise<void>;
  getMessage(locale: string, id: string): string;
  uploadMessages(messages: Message[]): Promise<void>;
  getNewMessages(): string[];
}
