export type Message = {
  id: string;
  defaultMessage: string;
  message?: string;
  description?: string;
  files?: string[];
};

export type Config = {
  messagesDir: string;
  langs: string;
  pattern: string;
  ignore: string;
};
