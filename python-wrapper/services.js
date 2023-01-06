"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdService = void 0;
const cmd_1 = require("twinica-lib/dist/services/cmd");
const child_process_1 = require("child_process");
exports.cmdService = new cmd_1.CmdService(child_process_1.spawn);
//# sourceMappingURL=services.js.map