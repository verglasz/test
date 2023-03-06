import path from "path";
import fsp from "fs/promises";
import { Logger } from "twinica-lib/logging";
import {
  EnvParams,
  InputUpdates,
  ModelController,
  ModelInitializer,
} from "twinica-lib/network/model";
import { cmdService } from "./services";
import { Inputs, Outputs, ModelParameters } from "./types";

class PythonModelController
  implements ModelController<Inputs, Outputs, ModelParameters>
{
  log: Logger;
  cwd: string;
  flips: number[] = [];
  exampleNum: number;

  constructor(env: EnvParams, params: ModelParameters) {
    this.log = env.log;
    this.cwd = env.cwd;
    this.log.debug("Initializing model controller with params:", params);
    this.exampleNum = params.exampleNum;
  }

  async run(inputs: InputUpdates<Inputs>): Promise<Outputs> {
    this.debugInputs(inputs);
    const newFlips = inputs.exampleNum.map((n) => n.value);
    this.flips.push(...newFlips);
    const data = {
      flips: this.flips,
      N: this.flips.length,
    };
    const result = await this.runData(data);
    return { exampleNum: this.exampleNum + result };
  }

  debugInputs(inputs: InputUpdates<Inputs>) {
    this.log.debug("Running model with the following updated inputs:");
    for (const [input, values] of Object.entries(inputs)) {
      this.log.debug(`Input '${input}'`);
      for (const v of values) {
        this.log.debug(`At ${v.timestamp.toISOString()}:`, v.value);
      }
    }
  }

  async runData(data: any) {
    const strData = JSON.stringify(data);
    const execution = cmdService.execute("python3", ["model.py"], {
      cwd: this.cwd,
    });
    await new Promise((resolve, reject) => {
      execution.execution.stdin?.on("finish", resolve);
      execution.execution.stdin?.on("error", reject);
      execution.execution.stdin?.write(strData);
      execution.execution.stdin?.end();
    });
    const result = await execution.result;
    this.log.debug("Model execution completed with result:", result);
    const p: number[] = JSON.parse(result.stdout)["p"];
    const avg = p.reduce((a, b) => a + b) / p.length;
    return avg;
  }

  check() {
    this.log.info("Model controller checked");
    return true;
  }
}

export const initialize: ModelInitializer<
  Inputs,
  Outputs,
  ModelParameters
> = async (env, params) => {
  return new PythonModelController(env, params);
};
