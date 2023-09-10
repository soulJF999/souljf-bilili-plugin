import fs from 'fs';
import { createHash } from 'crypto';
import { getDataByUrl } from './getDataByUrl.js';
import { createProgressBar } from './progress.js';
import { getName } from './naming.js';
import agent from './agent.js';
import axios from 'axios';

async function _download(url, title, filename, index) {
  try {
    await fs.promises.stat(filename);
    await fs.promises.unlink(filename);
  } catch (err) {
    console.log(err);
  }
  return new Promise((resolve, reject) => {
    agent({
      url,
      method: 'GET',
      responseType: 'stream',
      headers: {
        Range: `bytes=${0}-`,
        'User-Agent': 'PostmanRuntime/7.28.4',
        Referer: 'https://www.bilibili.com/',
      },
    })
      .then(({ data, headers }) => {
        const writeStream = fs.createWriteStream(filename);
        const total = parseInt(headers['content-length'], 10);
        const bar = createProgressBar(index, title, total);
        let failed = false;
        data.pipe(writeStream);
        data.on('data', (chunk) => {
          if (failed) {
            return;
          }
          bar.tick(chunk.length, { status: 'downloading' });
        });
        data.on('end', () => {
          if (failed) {
            return;
          }
          writeStream.close();
          resolve(bar);
        });
        data.on('error', (err) => {
          failed = true;
          bar.tick(total);
          bar.tick({ status: 'error' });
          writeStream.close();
          reject(err);
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function download(url, index) {
  const data = await getDataByUrl(url);
  const { videoData } = data;
  const { pages } = videoData;
  const isSingle = pages.length === 1;
  const pid = data.p;
  const cid = pages[pid - 1].cid;
  const title = (isSingle ? videoData.title : pages[pid - 1].part).replace(
    /\s/g,
    '-',
  );
  const date = new Date(videoData.ctime * 1000);
  const dateString = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;
  const author = videoData.owner.name;
  const filename = `${getName(index, title, author, dateString)}.flv`;

  const params = `appkey=iVGUTjsxvpLeuDCf&cid=${cid}&otype=json&qn=112&quality=112&type=`;
  const sign = createHash('md5')
    .update(params + 'aHRmhWMLkdeMuILqORnYZocwMBpMEOdt')
    .digest('hex');
  const playUrl = `https://interface.bilibili.com/v2/playurl?${params}&sign=${sign}`;

  const playResult = await axios.get(playUrl);
  const videoDownloadUrl = playResult.data.durl[0].url;
  const bar = await _download(videoDownloadUrl, title, filename, index);
  return { filename, bar };
}
