import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findJavaHome } from './java-home.mts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.length === 0 || args.some(argument => !/^[\w=.:+-]+$/.test(argument))) {
  throw new Error('Gradle arguments are missing or contain unsupported characters.');
}

const wrapper = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const javaHome = findJavaHome();
if (javaHome) {
  process.env.JAVA_HOME = javaHome;
}

const result = spawnSync(wrapper, args, {
  cwd: join(ROOT, 'android'),
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

if (result.signal) {
  console.error(`Gradle wrapper terminated by signal ${result.signal}.`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
