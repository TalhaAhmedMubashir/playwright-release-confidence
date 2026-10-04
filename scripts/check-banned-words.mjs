// Fails if a banned word appears anywhere that will be public: tracked files, commit messages,
// author names and emails, branch names, the pull request's title and description (PR_TEXT), and
// any built folder named on the command line (CI passes dist).
//
// The words name the owner's employer's product, clients, systems and colleagues, so the list is
// private too: CI reads it from the BANNED_WORDS secret, a local run from the file named in
// BANNED_WORDS_FILE. Matches are reported by place and entry number, never by the word, so the
// log doesn't leak the list.
//
// List format, one entry per line ("#" starts a comment line):
//   a plain entry matches as a whole word or phrase, ignoring case; a space matches any whitespace
//   /an entry like this/flags is a regular expression
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const list = process.env['BANNED_WORDS'] || (process.env['BANNED_WORDS_FILE'] ? readFileSync(process.env['BANNED_WORDS_FILE'], 'utf8') : '');
const entries = list
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));
if (entries.length === 0) {
  console.error('No banned-words list. Set BANNED_WORDS (the CI secret) or BANNED_WORDS_FILE (a local file).');
  process.exit(1);
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = entries.map((entry) => {
  const regex = /^\/(.+)\/([a-z]*)$/.exec(entry);
  if (regex) return new RegExp(regex[1], [...new Set(`${regex[2]}gu`)].join(''));
  return new RegExp(`(?<![\\p{L}\\p{N}_])${escape(entry).replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}_])`, 'giu');
});

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const isBinary = (buffer) => buffer.subarray(0, 8000).includes(0);

/** Every file under a folder, as paths relative to the working directory. */
function filesIn(folder) {
  return readdirSync(folder, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative('.', join(entry.parentPath, entry.name)));
}

/** [place, text] pairs: everything that will be public. */
function sources() {
  const found = [];
  const add = (place, buffer) => isBinary(buffer) || found.push([place, buffer.toString('utf8')]);
  for (const file of git('ls-files', '-z').split('\0').filter(Boolean)) {
    if (existsSync(file)) add(file, readFileSync(file));
  }
  add('commit messages, authors and branch names', Buffer.from(git('log', '--all', '--format=%an%n%ae%n%cn%n%ce%n%B') + git('branch', '-a', '--format=%(refname:short)')));
  if (process.env['PR_TEXT']) add('pull request title and description', Buffer.from(process.env['PR_TEXT']));
  for (const folder of process.argv.slice(2)) {
    if (!existsSync(folder)) throw new Error(`${folder} does not exist; build the site first.`);
    for (const file of filesIn(folder)) add(file, readFileSync(file));
  }
  return found;
}

const all = sources();
const hits = [];
for (const [place, text] of all) {
  const lineStarts = [0, ...[...text.matchAll(/\n/g)].map((match) => match.index + 1)];
  patterns.forEach((pattern, index) => {
    for (const match of text.matchAll(pattern)) {
      const line = lineStarts.findLastIndex((start) => start <= match.index) + 1;
      hits.push(`${place}, line ${line}: banned entry #${index + 1}`);
    }
  });
}

if (hits.length > 0) {
  console.error(`Banned words found (${hits.length}):\n${hits.map((hit) => `  ${hit}`).join('\n')}`);
  process.exit(1);
}
console.log(`No banned words: ${entries.length} entries checked against ${all.length} files and texts.`);
