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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = void 0;
class GenericModelController {
    constructor(log, params) {
        this.log = log;
        log.debug('Initializing model controller with params:', params);
        this.example = params.example;
    }
    run(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.debug('Running model with the following updated inputs:');
            for (const [input, values] of Object.entries(inputs)) {
                this.log.debug(input);
                for (const v of values) {
                    this.log.debug(`At ${v.timestamp.toDateString()}:`, v.value);
                }
            }
            return { example: `example string: '${this.example}'` };
        });
    }
    check() {
        this.log.info('Model controller checked');
        return true;
    }
}
const initialize = (log, params) => __awaiter(void 0, void 0, void 0, function* () { return new GenericModelController(log, params); });
exports.initialize = initialize;
//# sourceMappingURL=model.js.map