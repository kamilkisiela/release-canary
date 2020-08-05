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
const exec_1 = require("@actions/exec");
function execWithOutput(command, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        let myOutput = '';
        let myError = '';
        return {
            code: yield exec_1.exec(command, args, Object.assign({ listeners: {
                    stdout: (data) => {
                        myOutput += data.toString();
                    },
                    stderr: (data) => {
                        myError += data.toString();
                    }
                } }, options)),
            stdout: myOutput,
            stderr: myError
        };
    });
}
exports.execWithOutput = execWithOutput;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            core.debug('Running "Release Canary Version" action...');
            // Set default value first
            core.setOutput('released', 'false');
            const token = core.getInput('npm-token');
            const script = core.getInput('npm-script');
            const changesets = core.getInput('changesets');
            if (!token) {
                core.info('Skipping... Missing npm-token input');
                return;
            }
            if (!script) {
                throw new Error('npm-script input is missing');
            }
            if (changesets === 'true') {
                core.debug('Using "changesets" for publishing...');
                let releasedPackages = [];
                let [publishCommand, ...publishArgs] = script.split(/\s+/);
                let changesetPublishOutput = yield execWithOutput(publishCommand, publishArgs, { cwd: process.cwd() });
                let newTagRegex = /New tag:\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/;
                for (let line of changesetPublishOutput.stdout.split('\n')) {
                    let match = line.match(newTagRegex);
                    if (match === null) {
                        continue;
                    }
                    releasedPackages.push({
                        name: match[1],
                        version: match[2]
                    });
                }
                const publishedAsString = releasedPackages.map(t => `${t.name}@${t.version}`).join('\n');
                core.debug(`Published the following pakages: ${publishedAsString}`);
                const released = releasedPackages.length > 0;
                core.setOutput('released', released.toString());
                core.setOutput('changesetsPublishedPackages', publishedAsString);
            }
            else {
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
        }
        catch (error) {
            core.setFailed(`Failed to release canary version: ${error.message}`);
        }
    });
}
run();
