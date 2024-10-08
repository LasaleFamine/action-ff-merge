import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as Github from '@actions/github';

const ghClient = process.env['GITHUB_TOKEN'] ? Github.getOctokit(process.env['GITHUB_TOKEN']) : null;

const { GITHUB_REPOSITORY = '' } = process.env;

let execLogs = '';

const execOptions = {
  listeners: {
    stdout: (data: Buffer): void => {
      execLogs += data.toString();
    },
    stderr: (data: Buffer): void => {
      execLogs += data.toString();
    },
  },
};

const git = async (args: string[]): Promise<number> => exec.exec('git', args, execOptions);

interface RebaseArgs {
  email: string;
  from: string;
  to: string;
  username: string;
}

const rebase = async (args: RebaseArgs): Promise<void> => {
  await git(['config', '--local', 'user.name', args.username]);
  await git(['config', '--local', 'user.email', args.email]);
  await git(['fetch', '--all']);
  await git(['checkout', args.to]);
  await git(['merge', '--ff-only', args.from]);
  await git(['push', 'origin', `${args.to}`]);
};

const run = async (): Promise<void> => {
  const from = core.getInput('from');
  const to = core.getInput('to');
  const [owner] = GITHUB_REPOSITORY.split('/');

  if (!ghClient) throw new Error('Failed to load Github client from token.');
  if (!owner) throw new Error('Failed to parse owner from repository.');

  const {
    data: { email },
  } = await ghClient.rest.users.getByUsername({ username: owner });

  try {
    await rebase({
      email: email ?? '',
      username: owner,
      from,
      to,
    });
  } catch (error: unknown) {
    console.error(error);
    core.setFailed(execLogs);
  }
};

void run();
