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
const core = require("@actions/core");
const exec = require("@actions/exec");
const Github = require("@actions/github");
const ghClient = process.env['GITHUB_TOKEN'] ? Github.getOctokit(process.env['GITHUB_TOKEN']) : null;
const { GITHUB_REPOSITORY = '' } = process.env;
let execLogs = '';
const execOptions = {
    listeners: {
        stdout: (data) => {
            execLogs += data.toString();
        },
        stderr: (data) => {
            execLogs += data.toString();
        },
    },
};
const git = (args) => __awaiter(void 0, void 0, void 0, function* () { return exec.exec('git', args, execOptions); });
const rebase = (args) => __awaiter(void 0, void 0, void 0, function* () {
    yield git(['config', '--local', 'user.name', args.username]);
    yield git(['config', '--local', 'user.email', args.email]);
    yield git(['fetch', '--all']);
    yield git(['checkout', args.to]);
    yield git(['merge', '--ff-only', args.from]);
    yield git(['push', 'origin', `${args.to}`]);
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    const from = core.getInput('from');
    const to = core.getInput('to');
    const [owner] = GITHUB_REPOSITORY.split('/');
    if (!ghClient)
        throw new Error('Failed to load Github client from token.');
    if (!owner)
        throw new Error('Failed to parse owner from repository.');
    const { data: { email }, } = yield ghClient.rest.users.getByUsername({ username: owner });
    try {
        yield rebase({
            email: email !== null && email !== void 0 ? email : '',
            username: owner,
            from,
            to,
        });
    }
    catch (error) {
        console.error(error);
        core.setFailed(execLogs);
    }
});
void run();
