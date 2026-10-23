import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export function findJavaHome(): string | null {
  const configured = process.env.JAVA_HOME;
  if (configured && existsSync(join(configured, 'bin', 'java.exe'))) {
    return configured;
  }

  if (process.platform !== 'win32') {
    return null;
  }

  const localAppData =
    process.env.LOCALAPPDATA ??
    (process.env.USERPROFILE ? join(process.env.USERPROFILE, 'AppData', 'Local') : null);
  if (!localAppData) {
    return null;
  }

  const temurinDirectory = join(localAppData, 'Programs', 'Temurin-17');
  if (!existsSync(temurinDirectory)) {
    return null;
  }

  const installations = readdirSync(temurinDirectory, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((left, right) => right.name.localeCompare(left.name, undefined, { numeric: true }));

  for (const installation of installations) {
    const home = join(temurinDirectory, installation.name);
    if (existsSync(join(home, 'bin', 'java.exe'))) {
      return home;
    }
  }

  return null;
}
