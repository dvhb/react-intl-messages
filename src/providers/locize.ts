import { Provider } from './provider';
import { asyncForEach, request, showError, showInfo } from '../utils';
import { Message } from '../types';

type LocizeKeys = { [key: string]: string };
type LocizeUploadKeys = { [key: string]: { value: string; context: { text: string } } };

const BASE_URL = 'https://api.locize.io';

export class Locize implements Provider {
  locizeKeys: { [locale: string]: LocizeKeys } = {};
  newMessages: string[] = [];

  private static getHeaders(apiKey?: string) {
    return {
      'content-type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    };
  }

  constructor(
    private defaultLocale?: string,
    private projectId?: string,
    private apiKey?: string,
    private version?: string,
    private namespace?: string,
  ) {}

  async getKeys(locales: string[]) {
    showInfo('Start fetching messages from Locize');
    const headers = Locize.getHeaders();
    return asyncForEach(locales, async (locale: string) => {
      try {
        this.locizeKeys[locale] = await request<LocizeKeys>({
          headers,
          url: `${BASE_URL}/${this.projectId}/${this.version}/${locale}/${this.namespace}`,
          method: 'GET',
        });
        showInfo('Finish fetching messages from Locize');
      } catch (e) {
        showError(`Error while fetching strings from locize\n${e}`);
      }
    });
  }

  getMessage(locale: string, id: string) {
    const key = Object.keys(this.locizeKeys[locale]).find(key => key === id);
    if (key) {
      return this.locizeKeys[locale][key];
    }
    if (locale === this.defaultLocale) {
      this.newMessages.push(id);
    }
    return '';
  }

  async uploadMessages(messages: Message[], locale = this.defaultLocale) {
    const headers = Locize.getHeaders(this.apiKey);
    const body = messages.reduce(
      (acc, { id, message, defaultMessage, description }) => {
        acc[id] = {
          value: locale === this.defaultLocale ? message || defaultMessage : message || '',
          context: { text: description || '' },
        };
        return acc;
      },
      {} as LocizeUploadKeys,
    );
    try {
      const response = await request<string>({
        headers,
        body,
        url: `${BASE_URL}/${locale === this.defaultLocale ? 'missing' : 'update'}/${this.projectId}/${
          this.version
        }/${locale}/${this.namespace}`,
        method: 'POST',
      });
      showInfo(`Response from locize: ${JSON.stringify(response, null, 2)}`);
    } catch (e) {
      showError(`Error while uploading strings to locize\n${e}`);
    }
  }
  getNewMessages() {
    return this.newMessages;
  }
}
