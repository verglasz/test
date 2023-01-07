"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const services_1 = require("./services");
class PythonModelController {
  constructor(env, params) {
    this.flips = [];
    this.log = env.log;
    this.cwd = env.cwd;
    this.log.debug("Initializing model controller with params:", params);
    this.exampleNum = params.exampleNum;
  }
  run(inputs) {
    return __awaiter(this, void 0, void 0, function* () {
      this.debugInputs(inputs);
      const newFlips = inputs.exampleNum.map((n) => n.value);
      this.flips.push(...newFlips);
      const data = {
        flips: this.flips,
        N: this.flips.length,
      };
      const result = yield this.runData(data);
      return { exampleNum: this.exampleNum + result };
    });
  }
  debugInputs(inputs) {
    this.log.debug("Running model with the following updated inputs:");
    for (const [input, values] of Object.entries(inputs)) {
      this.log.debug(`Input '${input}'`);
      for (const v of values) {
        this.log.debug(`At ${v.timestamp.toISOString()}:`, v.value);
      }
    }
  }
  runData(data) {
    return __awaiter(this, void 0, void 0, function* () {
      const strData = JSON.stringify(data);
      const execution = services_1.cmdService.execute("python3", ["model.py"], {
        cwd: this.cwd,
      });
      yield new Promise((resolve, reject) => {
        var _a, _b, _c, _d;
        (_a = execution.execution.stdin) === null || _a === void 0
          ? void 0
          : _a.on("finish", resolve);
        (_b = execution.execution.stdin) === null || _b === void 0
          ? void 0
          : _b.on("error", reject);
        (_c = execution.execution.stdin) === null || _c === void 0
          ? void 0
          : _c.write(strData);
        (_d = execution.execution.stdin) === null || _d === void 0
          ? void 0
          : _d.end();
      });
      const result = yield execution.result;
      this.log.debug("Model execution completed with result:", result);
      const p = JSON.parse(result.stdout)["p"];
      const avg = p.reduce((a, b) => a + b) / p.length;
      return avg;
    });
  }
  check() {
    this.log.info("Model controller checked");
    return true;
  }
}
const initialize = (env, params) =>
  __awaiter(void 0, void 0, void 0, function* () {
    return new PythonModelController(env, params);
  });
exports.initialize = initialize;
//# sourceMappingURL=model.js.map

