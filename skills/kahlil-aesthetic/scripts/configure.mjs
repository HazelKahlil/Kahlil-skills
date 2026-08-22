import { absolutePath, defaultConfigPath, initLibrary, parseArgs, required, writeJson } from './lib.mjs';

try {
  const args = parseArgs(process.argv.slice(2));
  const libraryRoot = initLibrary(absolutePath(required(args, 'library'), 'Library root'));
  const configPath = args.config ? absolutePath(args.config, 'Config path') : defaultConfigPath();
  writeJson(configPath, { schemaVersion: 1, libraryRoot });
  console.log(`Configured kahlil-aesthetic library: ${libraryRoot}`);
  console.log(`Local configuration: ${configPath}`);
} catch (error) {
  console.error(`Configuration failed: ${error.message}`);
  process.exitCode = 1;
}
