import { compile } from "./setup/compile";
import path from "path";
import fsp from "fs/promises";
import { Logger } from "twinica-lib/logging";
import {
  EnvParams,
  InputUpdates,
  ModelController,
  ModelInitializer,
} from "twinica-lib/network/model";
import { cmdService, csvService } from "./services";
import { Inputs, ModelParameters, Outputs } from "./types";

class StanModelController
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
    const filename = "data.json";
    fsp.writeFile(path.join(this.cwd, filename), JSON.stringify(data));
    const execution = this.uncheckedRunFile(filename, "output.csv");
    const result = await execution.result;
    this.log.debug("Model execution completed with result:", result);
    const output = await csvService.readNumericCsv(
      path.join(this.cwd, "output.csv")
    );
    const p = output["p"]!;
    const avg = p.reduce((a, b) => a + b) / p.length;
    return avg;
  }

  /**
   * Run the model with the given data file, resolving to the execution result
   * (or to undefined if the model isn't ready).
   * This builds a command line option with the given string so it should only
   * be called with trusted input.
   */
  uncheckedRunFile(datafile: string, outfile = "output.csv") {
    return cmdService.execute(
      path.join(this.cwd, "model"),
      ["sample", "data", `file=${datafile}`, `output`, `file=${outfile}`],
      { cwd: this.cwd }
    );
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
  const { code } = await compile(env.cwd, env.log);
  if (code !== 0) {
    throw new Error("Model compilation failed, aborting");
  }
  return new StanModelController(env, params);
};
