import { Timestamped } from "twinica-lib/common";
import { Logger, LogLevel } from "twinica-lib/logging";
import {
  InputUpdates,
  ModelController,
  ModelInitializer,
} from "twinica-lib/network/model";
import { Inputs, Outputs, Parameters } from "./types";

class ExampleModelController
  implements ModelController<Inputs, Outputs, Parameters>
{
  exampleNum: number;
  constructor(private log: Logger, params: Parameters) {
    this.log.setLevel(LogLevel.DEBUG);
    log.debug("Initializing model controller with params:", params);
    this.exampleNum = params.exampleNum;
  }

  async run(inputs: InputUpdates<Inputs>): Promise<Outputs> {
    this.log.debug("Running model with the following updated inputs:");
    for (const [input, values] of Object.entries(inputs)) {
      this.log.debug(input);
      for (const v of values) {
        this.log.debug(`At ${v.timestamp.toDateString()}:`, v.value);
      }
    }
    return { exampleNum: this.exampleNum };
  }

  check() {
    this.log.info("Model controller checked");
    return true;
  }
}

export const initialize: ModelInitializer<Inputs, Outputs, Parameters> = async (
  env,
  params
) => new ExampleModelController(env.log, params);
