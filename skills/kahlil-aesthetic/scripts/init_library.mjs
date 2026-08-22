import { absolutePath, initLibrary, parseArgs, required } from './lib.mjs';

try {
  const args = parseArgs(process.argv.slice(2));
  const root = initLibrary(absolutePath(required(args, 'library'), 'Library root'));
  console.log(`Initialized aesthetic library: ${root}`);
} catch (error) {
  console.error(`Initialization failed: ${error.message}`);
  process.exitCode = 1;
}
