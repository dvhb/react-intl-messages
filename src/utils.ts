import * as fs from 'fs';
import * as G from 'glob';
import * as https from 'https';
import * as querystring from 'querystring';

export const glob = (pattern: string, ignore?: string | string[]): Promise<string[]> =>
  new Promise((resolve, reject) => {
    G(pattern, { ignore }, (err, val) => (err ? reject(err) : resolve(val)));
  });

export const readFile = (file: string): Promise<string> =>
  new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => (err ? reject(err) : resolve(data)));
  });

export const writeFile = (file: string, contents: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.writeFile(file, contents, 'utf8', err => (err ? reject(err) : resolve()));
  });

export const posixPath = (fileName: string) => fileName.replace(/\\/g, '/');

type Options = https.RequestOptions & {
  url: string;
  body?: object;
  qs?: object;
};
export const request = <T>({ url, body, qs, headers = {}, ...rest }: Options) => {
  const newUrl = qs ? `${url}?${querystring.stringify(qs)}` : url;

  const bodyString = JSON.stringify(body);

  if (body) {
    headers['Content-Length'] = Buffer.byteLength(bodyString, 'utf8');
  }

  return new Promise<T>((resolve, reject) => {
    const request = https.request(newUrl, { headers, ...rest }, response => {
      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => resolve(JSON.parse(data)));
    });

    if (body) {
      request.write(bodyString);
    }

    request.on('error', err => {
      reject(err);
    });
    request.end();
  });
};

const format = (time: Date) => time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
export const showError = (message: string) => console.error('\x1b[31m', message, '\x1b[0m');
export const showInfo = (message: string) => console.info(`\x1b[34m[${format(new Date())}]\x1b[0m`, `${message}`);
