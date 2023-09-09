import { exec } from 'child_process';
import { join } from 'path';
import url from 'url';
import path from 'path';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export function flv2mp3(filename) {
  return new Promise((resolve, reject) => {
    exec(
      `node ${join(__dirname, '_flv2mp3.js')} "${filename}"`,
      { cwd: process.cwd() },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    );
  });
}
