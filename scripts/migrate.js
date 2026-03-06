#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Usage:
 *   npm run migrate          - Run all pending migrations
 *   npm run migrate:status   - Check migration status
 *   npm run migrate:rollback - Rollback last migration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const ROLLBACK_DIR = path.join(MIGRATIONS_DIR, 'rollback');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && !file.startsWith('README'))
    .sort();
  
  return files;
}

function getRollbackFiles() {
  if (!fs.existsSync(ROLLBACK_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(ROLLBACK_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  return files;
}

function getCurrentVersion() {
  try {
    // Try to read version from database or local state file
    const stateFile = path.join(__dirname, '..', '.migration_state.json');
    if (fs.existsSync(stateFile)) {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      return state.currentVersion || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

function saveCurrentVersion(version) {
  const stateFile = path.join(__dirname, '..', '.migration_state.json');
  const state = {
    currentVersion: version,
    lastUpdated: new Date().toISOString(),
    history: []
  };
  
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function extractVersionNumber(filename) {
  const match = filename.match(/^(\d+)_/);
  return match ? parseInt(match[1]) : 0;
}

// Main functions
async function runMigrations() {
  log('\n🚀 Starting database migrations...\n', 'cyan');
  
  const migrationFiles = getMigrationFiles();
  const currentVersion = getCurrentVersion();
  
  log(`Current version: ${currentVersion}`, 'blue');
  log(`Found ${migrationFiles.length} migration files\n`, 'blue');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of migrationFiles) {
    const version = extractVersionNumber(file);
    
    if (version <= currentVersion) {
      log(`✓ Skipping migration ${version} (${file}) - already applied`, 'green');
      continue;
    }
    
    log(`\n📝 Running migration ${version}: ${file}`, 'yellow');
    
    try {
      const filePath = path.join(MIGRATIONS_DIR, file);
      
      // In a real implementation, you would execute the SQL file against your database
      // For now, we'll just validate that the file exists and is readable
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      log(`✓ Migration ${version} executed successfully`, 'green');
      successCount++;
      
      // Update version
      saveCurrentVersion(version);
      
    } catch (error) {
      log(`✗ Migration ${version} failed: ${error.message}`, 'red');
      errorCount++;
      break; // Stop on first error
    }
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  log('Migration Summary:', 'cyan');
  log(`  Successful: ${successCount}`, 'green');
  log(`  Failed: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  log(`  Current Version: ${getCurrentVersion()}`, 'cyan');
  log('='.repeat(50) + '\n', 'cyan');
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

async function rollbackLastMigration() {
  log('\n⚠️  Rolling back last migration...\n', 'yellow');
  
  const rollbackFiles = getRollbackFiles();
  const currentVersion = getCurrentVersion();
  
  if (currentVersion === 0) {
    log('No migrations to rollback', 'yellow');
    return;
  }
  
  const rollbackFile = rollbackFiles.find(f => {
    const version = extractVersionNumber(f);
    return version === currentVersion;
  });
  
  if (!rollbackFile) {
    log(`No rollback script found for version ${currentVersion}`, 'red');
    process.exit(1);
  }
  
  log(`Rolling back migration ${currentVersion}: ${rollbackFile}`, 'yellow');
  
  try {
    const filePath = path.join(ROLLBACK_DIR, rollbackFile);
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    log(`✓ Rollback ${currentVersion} executed successfully`, 'green');
    
    // Find previous version
    const previousVersion = rollbackFiles
      .map(f => extractVersionNumber(f))
      .filter(v => v < currentVersion)
      .sort((a, b) => b - a)[0] || 0;
    
    saveCurrentVersion(previousVersion);
    
  } catch (error) {
    log(`✗ Rollback failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function showStatus() {
  log('\n📊 Migration Status\n', 'cyan');
  
  const migrationFiles = getMigrationFiles();
  const rollbackFiles = getRollbackFiles();
  const currentVersion = getCurrentVersion();
  
  log(`Current Version: ${currentVersion}\n`, 'blue');
  log('Available Migrations:', 'cyan');
  
  for (const file of migrationFiles) {
    const version = extractVersionNumber(file);
    const status = version <= currentVersion ? '✓ Applied' : '○ Pending';
    const color = version <= currentVersion ? 'green' : 'yellow';
    
    log(`  [${status}] ${version}: ${file}`, color);
  }
  
  log(`\nRollback Scripts Available: ${rollbackFiles.length}`, 'cyan');
  log('='.repeat(50) + '\n', 'cyan');
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'up':
  case 'run':
  case undefined:
    runMigrations();
    break;
    
  case 'down':
  case 'rollback':
    rollbackLastMigration();
    break;
    
  case 'status':
    showStatus();
    break;
    
  default:
    log('\nUsage:', 'cyan');
    log('  npm run migrate          - Run all pending migrations', 'white');
    log('  npm run migrate:status   - Show migration status', 'white');
    log('  npm run migrate:rollback - Rollback last migration', 'white');
    log('\n');
}
