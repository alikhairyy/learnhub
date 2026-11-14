/**
 * One-command local demo: no MongoDB install or .env needed.
 * Run with:  npm run demo   (from the server folder)
 *
 * - starts a temporary in-memory MongoDB (data is wiped when you stop it)
 * - seeds the demo users and courses
 * - builds the React client if needed
 * - serves API + website together on http://localhost:5000
 */
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

const clientDir = path.join(__dirname, '..', 'client');

function run(cmd, args, cwd, env = process.env) {
  const result = spawnSync(cmd, args, { cwd, env, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`\n"${cmd} ${args.join(' ')}" failed in ${cwd}`);
    process.exit(result.status || 1);
  }
}

async function main() {
  // 1. Build the React client once
  if (!fs.existsSync(path.join(clientDir, 'dist', 'index.html'))) {
    console.log('Building the React client (first run only)...');
    if (!fs.existsSync(path.join(clientDir, 'node_modules'))) run('npm', ['install'], clientDir);
    run('npm', ['run', 'build'], clientDir);
  }

  // 2. Temporary database
  console.log('Starting in-memory MongoDB (first run downloads it, ~1-2 min)...');
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri('learnhub');

  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'learnhub-demo-secret-change-me';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  process.env.PORT = process.env.PORT || '5000';

  // 3. Seed demo data
  run('node', ['seed.js'], __dirname, process.env);

  // 4. Serve API + built client together
  process.env.NODE_ENV = 'production';
  require('./server');

  const stop = async () => {
    await mongo.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  console.log(`\nOpen http://localhost:${process.env.PORT} in your browser. Press Ctrl+C to stop.\n`);
}

main().catch((err) => {
  console.error('Demo failed to start:', err.message);
  process.exit(1);
});
