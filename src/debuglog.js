import fs from 'fs';
import { join } from 'path';

export function debuglog(data) {
  fs.appendFileSync(
    join(process.cwd(), 'bilili-plugin-error.log'),
    data.toString() + '\n',
  );
}
