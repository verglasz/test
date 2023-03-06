import { ExecutionResult } from 'twinica-lib/services/cmd';
import os from 'os';
import { Logger } from 'twinica-lib/logging';
import { cmdService } from '../services';

const CMDSTAN_DIR = '/home/node/cmdstan';

function getHalfCpus() {
  const halfcount = Math.floor(os.cpus().length / 2);
  return halfcount === 0 || !isFinite(halfcount) ? 1 : halfcount;
}

export async function compile(
  cwd: string,
  log: Logger,
): Promise<ExecutionResult> {
  const compilation = cmdService.execute(
    'make',
    ['-j', getHalfCpus().toString(), `${cwd}/model`],
    {
      cwd: CMDSTAN_DIR,
    },
  );
  const result = await compilation.result;
  log.debug('Compilation completed with result:', result);
  return result;
}
