import * as fs from 'fs';
import { URL } from 'url';
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

export const toHash = <T>(array: T[], key: string): { [id: string]: T } =>
  Array.prototype.reduce.call(
    array,
    // @ts-ignore
    (acc: { [id: string]: T }, data: T, index: number) => ((acc[key ? data[key] : index] = data), acc),
    {},
  );
export const tail = <T>(arr: T[]) => (arr.length > 1 ? arr.slice(1) : arr);
export const head = <T>(arr: T[]) => arr[0];

type Options = https.RequestOptions & {
  url: string;
  body?: object;
  qs?: querystring.ParsedUrlQueryInput;
};
export const request = <T>({ url, body, qs, headers = {}, ...rest }: Options) => {
  const { hostname, pathname } = new URL(url);
  const searchParams = qs && querystring.stringify(qs);
  const path = searchParams ? `${pathname}?${searchParams}` : pathname;

  const bodyString = JSON.stringify(body);

  if (body) {
    headers['Content-Length'] = Buffer.byteLength(bodyString, 'utf8');
  }

  return new Promise<T>((resolve, reject) => {
    const request = https.request({ headers, hostname, path, ...rest }, response => {
      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => resolve({ ...JSON.parse(data), headers: response.headers }));
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
export const asyncForEach = async <T>(array: T[], callback: (item: T, index: number, array: T[]) => Promise<void>) => {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
};
