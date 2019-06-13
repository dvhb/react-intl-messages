import { Provider } from './provider';
import { request, showError, showInfo } from '../utils';
import { Message } from '../types';

type LocizeKeys = { [key: string]: { value: string; context: { text: string } } };

const BASE_URL = 'https://api.locize.io';

export class Locize implements Provider {
  locizeKeys: { [locale: string]: LocizeKeys } = {};
  newMessages: string[] = [];
  constructor(
    private projectId?: string,
    private apiKey?: string,
    private version?: string,
    private namespace?: string,
  ) {}

  async getKeys(locales: string[]) {
    const headers = { 'content-type': 'application/json' };
    locales.forEach(async locale => {
      try {
        this.locizeKeys[locale] = await request<LocizeKeys>({
          headers,
          url: `${BASE_URL}/${this.projectId}/${this.version}/${locale}/${this.namespace}`,
          method: 'GET',
        });
      } catch (e) {
        showError(`Error while fetching strings from locize\n${e}`);
      }
    });
  }

  getMessage(locale: string, id: string) {
    const key = Object.keys(this.locizeKeys[locale]).find(key => key === id);
    if (key) {
      return this.locizeKeys[locale][key].value;
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
        url: `${BASE_URL}/missing/${this.projectId}/${this.version}/en/${this.namespace}`,
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
