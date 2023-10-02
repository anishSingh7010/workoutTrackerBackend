import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const logEvents = async (req, message, logFileName) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
  // logging req details and custom message
  const logItem = `${dateTime}\t${uuid()}\t${req.method}\t${req.url}\t${
    req.headers.origin
  }\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
      await fs.promises.mkdir(path.join(__dirname, '..', '..', 'logs'));
    }
    await fs.promises.appendFile(
      path.join(__dirname, '..', '..', 'logs', logFileName),
      logItem
    );
  } catch (err) {
    // check why messages are not getting logged
    console.log(err);
  }
};

export { logEvents };
