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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const child_process_1 = require("child_process");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core.debug('Running "Release Canary Version" action...');
            const token = core.getInput('npm-token');
            const script = core.getInput('npm-script');
            if (!token) {
                core.info('Skipping... Missing npm-token input');
                return;
            }
            if (!script) {
                throw new Error('npm-script input is missing');
            }
            try {
                fs_1.unlinkSync('out.txt');
            }
            catch (e) { }
            fs_1.writeFileSync('.npmrc', `//registry.npmjs.org/:_authToken=${token}`, {
                encoding: 'utf-8'
            });
            child_process_1.execSync(`npm run ${script} > out.txt`, {
                encoding: 'utf-8'
            });
            const output = fs_1.readFileSync('out.txt', {
                encoding: 'utf-8'
            });
            const results = output.match(/=\> ([a-z0-9\.\-\+]+)/);
            if (!results) {
                throw new Error(`Failed to find a version number. Are you sure you're using lerna publish?`);
            }
            const version = results[1];
            core.setOutput('version', version);
            core.setOutput('released', 'true');
        }
        catch (error) {
            core.setFailed(`Failed to release canary version: ${error.message}`);
        }
    });
}
run();
