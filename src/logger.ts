import { Logger } from '@nestjs/common';
import * as fs from 'fs';

const logFile = "./apilog.log"

export class FileLogger extends Logger {
  error(message: string, trace: string) {
    fs.writeFileSync(logFile, `${message} ${trace}`);
    super.error(message, trace);
  }
}