import { download } from './download';
import { flv2mp3 } from './flv2mp3';
import * as fs from 'fs';
import { program } from 'commander';
import { sleep } from './util';
import { resolve } from 'path';

export async function download2mp3({ url, index }) {
  const argv = program.opts();
  const offsetIndex = (argv.indexOffset || 0) + index;
  let b;
  try {
    const { filename, bar } = await download(url, offsetIndex);
    b = bar;
    if (!argv.skipMp3) {
      bar.tick({ status: 'converting' });
      await flv2mp3(filename);
      await fs.promises.unlink(filename);
    }
    bar.tick({ status: 'done' });
  } catch (err) {
    b?.tick({ status: 'error' });
    if (argv.debug) {
      const logFile = resolve(process.cwd(), 'bilili-plugin-error.log');
      await fs.promises.appendFile(
        logFile,
        `index: ${offsetIndex}\n` + `url:${url}\n` + err.stack + '\n\n',
      );
    }
    await sleep(2000);
    await download2mp3({ url, index });
  }
}
