import { Provider } from './provider';
import { request, showError, showInfo } from '../utils';
import { Message } from '../types';

type LocizeKeys = { [key: string]: { value: string; context: { text: string } } };

const BASE_URL = 'https://api.locize.io';

export class Locize implements Provider {
  locizeKeys: LocizeKeys = {};
  newMessages: string[] = [];
  constructor(private projectId?: string, private apiKey?: string) {}

  async getKeys() {
    const headers = { 'content-type': 'application/json' };
    try {
      this.locizeKeys = await request<LocizeKeys>({
        headers,
        url: `${BASE_URL}/${this.projectId}/latest/en/test`,
        method: 'GET',
      });
    } catch (e) {
      showError(`Error while fetching strings from locize\n${e}`);
    }
  }

  getMessage(locale: string, id: string) {
    const key = Object.keys(this.locizeKeys).find(key => key === id);
    if (key) {
      return this.locizeKeys[key].value;
    }
    if (locale === 'en') {
      this.newMessages.push(id);
    }
    return '';
  }

  async uploadMessages(messages: Message[]) {
    const headers = { Authorization: `Bearer ${this.apiKey}`, 'content-type': 'application/json' };
    const body = messages.reduce(
      (acc, { id, message, defaultMessage, description }) => {
        acc[id] = { value: message || defaultMessage, context: { text: description || '' } };
        return acc;
      },
      {} as LocizeKeys,
    );
    try {
      const response = await request<string>({
        headers,
        body,
        url: `${BASE_URL}/missing/${this.projectId}/latest/en/test`,
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
