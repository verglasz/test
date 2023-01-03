"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
const compile_1 = require("setup/compile");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const services_1 = require("services");
class StanModelController {
    constructor(env, params) {
        this.flips = [];
        this.log = env.log;
        this.cwd = env.cwd;
        this.log.debug('Initializing model controller with params:', params);
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
        this.log.debug('Running model with the following updated inputs:');
        for (const [input, values] of Object.entries(inputs)) {
            this.log.debug(`Input '${input}'`);
            for (const v of values) {
                this.log.debug(`At ${v.timestamp.toISOString()}:`, v.value);
            }
        }
    }
    runData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = 'data.json';
            promises_1.default.writeFile(path_1.default.join(this.cwd, filename), JSON.stringify(data));
            const execution = this.uncheckedRunFile(filename, 'output.csv');
            const result = yield execution.result;
            this.log.debug('Model execution completed with result:', result);
            const output = yield services_1.csvService.readNumericCsv(path_1.default.join(this.cwd, 'output.csv'));
            const p = output['p'];
            const avg = p.reduce((a, b) => a + b) / p.length;
            return avg;
        });
    }
    /**
     * Run the model with the given data file, resolving to the execution result
     * (or to undefined if the model isn't ready).
     * This builds a command line option with the given string so it should only
     * be called with trusted input.
     */
    uncheckedRunFile(datafile, outfile = 'output.csv') {
        return services_1.cmdService.execute(path_1.default.join(this.cwd, 'model'), ['sample', 'data', `file=${datafile}`, `output`, `file=${outfile}`], { cwd: this.cwd });
    }
    check() {
        this.log.info('Model controller checked');
        return true;
    }
}
const initialize = (env, params) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = yield (0, compile_1.compile)(env.cwd, env.log);
    if (code !== 0) {
        throw new Error('Model compilation failed, aborting');
    }
    return new StanModelController(env, params);
});
exports.initialize = initialize;
//# sourceMappingURL=model.js.map