import { request, showError, showInfo } from '../utils';
import { Provider } from './provider';
import { Message } from '../types';

export type LokaliseKey = {
  key_id: number;
  created_at: string;
  key_name: {
    ios: string;
    android: string;
    web: string;
    other: string;
  };
  filenames: {
    ios: string;
    android: string;
    web: string;
    other: string;
  };
  description: string;
  platforms: string[];
  tags: string[];
  comments: {
    comment_id: number;
    comment: string;
    added_by: number;
    added_by_email: string;
    added_at: string;
  }[];
  screenshots: {
    screenshot_id: number;
    title: string;
    description: string;
    screenshot_tags: string[];
    url: string;
    created_at: string;
  }[];
  translations: {
    translation_id: number;
    key_id: number;
    language_iso: string;
    translation: string;
    modified_by: number;
    modified_by_email: string;
    modified_at: string;
    is_reviewed: boolean;
    reviewed_by: number;
    words: number;
  }[];
};

type LocalizeResponse = {
  keys: LokaliseKey[];
};

export class Lokalise implements Provider {
  lokaliseKeys: LokaliseKey[] = [];
  newMessages: string[] = [];
  constructor(private projectId?: string, private token?: string) {}

  async getKeys() {
    const headers = { 'x-api-token': this.token, 'content-type': 'application/json' };
    try {
      const response = await request<LocalizeResponse>({
        headers,
        url: `https://api.lokalise.co/api2/projects/${this.projectId}/keys`,
        method: 'GET',
        qs: { include_translations: '1', limit: 5000 },
      });
      this.lokaliseKeys = response.keys;
    } catch (e) {
      showError(`Error while fetching strings from lokalise\n${e}`);
    }
  }

  getMessage(locale: string, id: string) {
    const key = this.lokaliseKeys.find(key => key.key_name.web === id);
    const lokaliseString = key && key.translations.find(translation => translation.language_iso === locale);
    if (lokaliseString) {
      return lokaliseString.translation;
    }
    if (locale === 'en') {
      this.newMessages.push(id);
    }
    return '';
  }

  async uploadMessages(messages: Message[]) {
    const headers = { 'x-api-token': this.token, 'content-type': 'application/json' };
    const body = {
      keys: messages.map(message => ({
        key_name: message.id,
        description: message ? message.description : '',
        platforms: ['ios', 'android', 'web', 'other'],
        translations: [{ language_iso: 'en', translation: message ? message.defaultMessage : '' }],
      })),
    };
    try {
      const response = await request<any>({
        headers,
        body,
        url: `https://api.lokalise.co/api2/projects/${this.projectId}/keys`,
        method: 'POST',
      });
      showInfo(`Response from lokalise: ${response}`);
    } catch (e) {
      showError(`Error while uploading strings to lokalise\n${e}`);
    }
  }
  getNewMessages() {
    return this.newMessages;
  }
}
