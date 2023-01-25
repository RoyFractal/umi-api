import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';

const logFile = "./apilog.log"

export class FileLogger extends ConsoleLogger {
  error(message: string, trace: string) {
    fs.writeFileSync(logFile, `${message} ${trace}`);
    super.error(message, trace);
  }
}