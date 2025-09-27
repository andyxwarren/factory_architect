// File: _external/concatenateCode.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Script & Config Paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_DIR = __dirname;
const CONFIG_FILE_PATH = path.join(SCRIPT_DIR, 'llm_workflow_config.json');
const PROMPT_FILE_PATH = path.join(SCRIPT_DIR, 'prompt.md');

// --- Script Arguments ---
// Arg 1: Specific sub-path within projectBasePath to scan (e.g., ".", "src/components")
const SUB_PATH_TO_SCAN = process.argv[2] || '.';
// Arg 2: Output filename (optional)
const DEFAULT_OUTPUT_FILENAME = 'llm_request.md';
let outputFileName = process.argv[3] || DEFAULT_OUTPUT_FILENAME;
if (!outputFileName.endsWith('.md')) {
    outputFileName += '.md';
}
const OUTPUT_FILE_PATH = path.join(SCRIPT_DIR, outputFileName);

// --- Configuration (EXCLUDED_FOLDERS, etc. - keep these as they are relevant to the scanned content) ---
const EXCLUDED_FOLDERS = [
    // Itself
    '_external',
    // Common package management
    'node_modules',
    // Version control
    '.git',
    // IDE & Editor folders
    '.vscode', '.idea',
    // Common build outputs
    'dist', 'build', 'out', '.next', '.cache',
    // Test and coverage folders
    'coverage', '__tests__',
    // Static and public assets (can be noisy)
    'public', 'static', 'assets',
    // Logs and temporary files
    'logs', 'tmp',
    // Custom folders to exclude
    '.claude'
];
const EXCLUDED_FILES = [
    // Lockfiles and environment variables
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    '.env', '.env.local', '.env.development', '.env.production',
    // Generated type definitions
    'next-env.d.ts',
    // Configuration and ignore files
    'components.json',
    '.gitignore',
    // Project-specific documentation files
    'CLAUDE.md',
    'FACTORY_ARCHITECTURE_FLOW_CHART.md',
    'FACTORY_MODEL_IMPLEMENTATION_GUIDE.md',
    'Factory_Architect_User_Guide.md',
    'README.md',
    'STUDENT_INTERFACE_PROJECT_PROPOSAL.md', '.md', '.csv'
];
const EXCLUDED_EXTENSIONS = [ /* ... your existing list ... */
    // Binary and media files
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.svg', '.bmp', '.tiff',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv',
    '.mp3', '.wav', '.ogg', '.flac', '.aac',
    // Archives and compressed files
    '.zip', '.tar', '.gz', '.rar', '.7z', '.bz2', '.xz',
    // Compiled and binary files
    '.exe', '.dll', '.so', '.dylib', '.class', '.pyc', '.pyo',
    '.o', '.obj', '.a', '.lib', '.jar', '.war', '.ear', '.node',
    // Cache, temp and logs
    '.log', '.tmp', '.bak', '.swp', '.swo', '.old', '.cache', '.lock',
    // Build artifacts
    '.map', '.tsbuildinfo',
    // Fonts and non-code assets
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    // Data files that might be large
    '.csv', '.tsv', '.db', '.sqlite', '.parquet',
    // IDE specific compilation files
    '.suo', '.user', '.userosscache', '.sln.docstates',
];
// No longer using INCLUDED_EXTENSIONS - including all files by default except those explicitly excluded
const LANGUAGE_HINTS = { /* ... your existing list ... */
    '.js': 'javascript', '.jsx': 'javascript', '.ts': 'typescript', '.tsx': 'typescript',
    '.mjs': 'javascript', '.py': 'python', '.java': 'java', '.rb': 'ruby',
    '.php': 'php', '.html': 'html', '.css': 'css', '.scss': 'scss',
    '.less': 'less', '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml',
    '.xml': 'xml', '.md': 'markdown', '.sh': 'bash', '.sql': 'sql',
    '.go': 'go', '.cs': 'csharp', '.c': 'c', '.cpp': 'cpp',
    '.h': 'c', '.hpp': 'cpp', '.vue': 'vue', '.svelte': 'svelte',
    '.rs': 'rust', '.prisma': 'prisma', '.toml': 'toml', '.svg': 'xml',
    // Additional language hints
    '.graphql': 'graphql', '.gql': 'graphql',
    '.proto': 'protobuf',
    '.module.css': 'css', '.module.scss': 'scss', '.module.less': 'less',
    '.test.js': 'javascript', '.test.jsx': 'javascript', '.test.ts': 'typescript', '.test.tsx': 'typescript',
    '.spec.js': 'javascript', '.spec.jsx': 'javascript', '.spec.ts': 'typescript', '.spec.tsx': 'typescript',
    '.stories.js': 'javascript', '.stories.jsx': 'javascript', '.stories.ts': 'typescript', '.stories.tsx': 'typescript',
    'babel.config.js': 'javascript', 'prettier.config.js': 'javascript', 
    'jest.config.js': 'javascript', 'jest.config.ts': 'typescript', 'jest.config.mjs': 'javascript',
    'vite.config.js': 'javascript', 'vite.config.ts': 'typescript',
    'vitest.config.js': 'javascript', 'vitest.config.ts': 'typescript',
    'Dockerfile': 'dockerfile',
    'docker-compose.yml': 'yaml', 'docker-compose.yaml': 'yaml',
    'vercel.json': 'json', 'netlify.toml': 'toml',
    '.babelrc': 'json', '.eslintrc.json': 'json', '.prettierrc': 'json',
    '.npmrc': 'ini', '.yarnrc': 'ini', '.gitignore': 'gitignore', '.dockerignore': 'gitignore',
    '.eslintignore': 'gitignore', '.nvmrc': 'text',
    'LICENSE': 'text', 'CHANGELOG.md': 'markdown', 'CONTRIBUTING.md': 'markdown'
};
// --- End Configuration ---


async function loadConfig() {
    try {
        const configContent = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
        const config = JSON.parse(configContent);
        if (!config.projectBasePath) {
            throw new Error("'projectBasePath' not defined in config file.");
        }
        // Resolve projectBasePath relative to the config file's directory (SCRIPT_DIR)
        return path.resolve(SCRIPT_DIR, config.projectBasePath);
    } catch (error) {
        console.error(`Error loading or parsing config file at ${CONFIG_FILE_PATH}:`, error.message);
        console.error("Please ensure 'llm_workflow_config.json' exists in the script directory and has a 'projectBasePath' key.");
        process.exit(1);
    }
}

async function getFileContent(filePath, isOptional = false) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return content;
    } catch (error) {
        if (isOptional && error.code === 'ENOENT') {
            console.warn(`Warning: Optional file not found at ${filePath}. Proceeding without it.`);
            return '';
        }
        console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
        return null;
    }
}

async function traverseDirectory(currentScanDir, configuredProjectBase, collectedContent) {
    try {
        const entries = await fs.readdir(currentScanDir, { withFileTypes: true });
        entries.sort((a, b) => a.name.localeCompare(b.name));

        for (const entry of entries) {
            const fullPath = path.join(currentScanDir, entry.name);
            // Relative path for LLM output MUST be relative to configuredProjectBase
            const relativePathForLLM = path.relative(configuredProjectBase, fullPath);

            if (entry.isDirectory()) {
                const dirNameLower = entry.name.toLowerCase();
                // Exclusion checks can use dirNameLower or relativePathForLLM depending on specificity
                if (EXCLUDED_FOLDERS.some(excluded => dirNameLower === excluded || relativePathForLLM.toLowerCase().startsWith(excluded + path.sep) || relativePathForLLM.toLowerCase() === excluded)) {
                    continue;
                }
                await traverseDirectory(fullPath, configuredProjectBase, collectedContent);
            } else if (entry.isFile()) {
                const fileNameLower = entry.name.toLowerCase();
                const fileExtLower = path.extname(fileNameLower);

                if (EXCLUDED_FILES.some(excludedFile => fileNameLower === excludedFile || relativePathForLLM.toLowerCase() === excludedFile)) {
                    continue;
                }
                if (EXCLUDED_EXTENSIONS.includes(fileExtLower)) {
                    continue;
                }
                // No longer using INCLUDED_EXTENSIONS - including all files by default

                const content = await getFileContent(fullPath);
                if (content !== null) {
                    const langHint = LANGUAGE_HINTS[fileExtLower] || LANGUAGE_HINTS[fileNameLower] || '';
                    collectedContent.push(
                        `--- START FILE: ${relativePathForLLM} ---\n` + // Use path relative to configuredProjectBase
                        `\`\`\`${langHint}\n` +
                        content +
                        `\n\`\`\`\n` +
                        `--- END FILE: ${relativePathForLLM} ---\n\n`
                    );
                }
            }
        }
    } catch (error) {
        console.error(`Error traversing directory ${currentScanDir}: ${error.message}`);
    }
}

async function main() {
    if (process.argv.length > 4) { // node script.js [subPathToScan] [outputFile]
        console.log("Usage: node concatenateCode.js [subPathToScan] [outputFileName.md]");
        console.log("   subPathToScan: (Optional) Specific sub-path within the configured 'projectBasePath' to scan. Defaults to '.' (the projectBasePath itself).");
        console.log("   outputFileName.md: (Optional) Name of the output Markdown file. Defaults to 'concatenated_code_with_prompt.md'.");
        console.log("   The output file will be saved in the same directory as this script.");
        console.log("   A 'prompt.md' and 'llm_workflow_config.json' (with 'projectBasePath') must exist in the script's directory.");
        process.exit(1);
    }

    const configuredProjectBase = await loadConfig();
    const absoluteRootDirToScan = path.resolve(configuredProjectBase, SUB_PATH_TO_SCAN); // Scan path is projectBase + subPath

    console.log(`Configured Project Base Path: ${configuredProjectBase}`);
    console.log(`Attempting to read prompt file from: ${PROMPT_FILE_PATH}`);
    const promptContent = await getFileContent(PROMPT_FILE_PATH, true);

    console.log(`\nStarting concatenation. Root directory to scan: ${absoluteRootDirToScan}`);
    console.log(`Output will be saved to: ${OUTPUT_FILE_PATH}`);

    const collectedCodeContent = [];

    console.log("\n--- Scanning Code Files ---");
    // Pass configuredProjectBase to traverseDirectory for correct relative path calculation
    await traverseDirectory(absoluteRootDirToScan, configuredProjectBase, collectedCodeContent);
    console.log("--- Finished Scanning Code Files ---\n");

    const headerContent = `# Codebase Context: Scanned from '${SUB_PATH_TO_SCAN}' within project base '${configuredProjectBase}'\n` +
        `# All file paths below are relative to: ${configuredProjectBase}\n` +
        `# Generated on: ${new Date().toISOString()}\n\n`;

    const finalOutputContent = (promptContent ? promptContent.trim() + "\n\n" : "") +
        headerContent +
        collectedCodeContent.join('');

    try {
        await fs.mkdir(SCRIPT_DIR, { recursive: true });
        await fs.writeFile(OUTPUT_FILE_PATH, finalOutputContent, 'utf8');
        if (promptContent) {
            console.log(`Successfully prepended content from ${PROMPT_FILE_PATH}.`);
        }
        console.log(`\nSuccessfully concatenated codebase to ${OUTPUT_FILE_PATH}`);
    } catch (error) {
        console.error(`Error writing to output file ${OUTPUT_FILE_PATH}: ${error.message}`);
    }
}

main();