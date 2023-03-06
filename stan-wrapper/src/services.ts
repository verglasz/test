import { CmdService } from 'twinica-lib/services/cmd';
import { spawn } from 'child_process';
import * as fs from 'fs';
import { CsvService } from 'twinica-lib/services/csv';

export const cmdService = new CmdService(spawn);
export const csvService = new CsvService(fs);
