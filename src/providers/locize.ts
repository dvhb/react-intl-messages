import { Provider } from './provider';
import { request, showError, showInfo } from '../utils';
import { Message } from '../types';

type LocizeKeys = { [key: string]: string };

export class Locize implements Provider {
  locizeKeys: LocizeKeys = {};
  newMessages: string[] = [];
  constructor(private projectId?: string, private apiKey?: string) {}

  async getKeys() {
    const headers = { 'content-type': 'application/json' };
    try {
      this.locizeKeys = await request<LocizeKeys>({
        headers,
        url: `https://api.locize.io/${this.projectId}/latest/en/test`,
        method: 'GET',
      });
    } catch (e) {
      showError(`Error while fetching strings from locize\n${e}`);
    }
  }

  getMessage(locale: string, id: string) {
    const key = Object.keys(this.locizeKeys).find(key => key === id);
    if (key) {
      return key;
    }
    if (locale === 'en') {
      this.newMessages.push(id);
    }
    return '';
  }

  async uploadMessages(messages: Message[]) {
    const headers = { Authorization: `Bearer ${this.apiKey}`, 'content-type': 'application/json' };
    const body = messages.reduce(
      (acc, { id, message, defaultMessage }) => {
        acc[id] = message || defaultMessage;
        return acc;
      },
      {} as LocizeKeys,
    );
    try {
      const response = await request<string>({
        headers,
        body,
        url: `https://api.locize.io/update/${this.projectId}/latest/en/test`,
        method: 'POST',
      });
      showInfo(`Response from locize: ${response}`);
    } catch (e) {
      showError(`Error while uploading strings to locize\n${e}`);
    }
  }
  getNewMessages() {
    return this.newMessages;
  }
}