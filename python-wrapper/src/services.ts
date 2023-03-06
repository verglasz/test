import { CmdService } from 'twinica-lib/services/cmd';
import { spawn } from 'child_process';
import * as fs from 'fs';

export const cmdService = new CmdService(spawn);
