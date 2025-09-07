// File: _external/concatenator/applyLLMChanges.js
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline'; // Keep for confirmation
import { fileURLToPath } from 'url';

// --- Script & Config Paths ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCRIPT_DIR = __dirname;
const CONFIG_FILE_PATH = path.join(SCRIPT_DIR, 'llm_workflow_config.json');

// --- Script Arguments ---
// Arg 1: Path to the LLM Markdown response file
const LLM_MARKDOWN_FILE = process.argv[2];
// Arg 2 (optional): --dry-run or -d
const IS_DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('-d');
// --- End Configuration ---

async function loadConfig() {
    try {
        const configContent = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
        const config = JSON.parse(configContent);
        if (!config.projectBasePath) {
            throw new Error("'projectBasePath' not defined in config file.");
        }
        return path.resolve(SCRIPT_DIR, config.projectBasePath);
    } catch (error) {
        console.error(`Error loading or parsing config file at ${CONFIG_FILE_PATH}:`, error.message);
        console.error("Please ensure 'llm_workflow_config.json' exists in the script directory and has a 'projectBasePath' key.");
        process.exit(1);
    }
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}
function createReadlineInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}
async function confirmExecution(operations, projectBase) {
    if (IS_DRY_RUN) {
        console.log("\nDRY RUN MODE: No actual file changes will be made.");
        return true;
    }
    if (operations.length === 0) {
        console.log("No operations to perform.");
        return false;
    }
    console.warn("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.warn("!!! WARNING: This script will modify files in your project !!!");
    console.warn(`!!! Project Base for changes: ${projectBase}`);
    console.warn("!!! MAKE SURE YOU HAVE COMMITTED YOUR CHANGES TO GIT OR HAVE A BACKUP !!!");
    console.warn("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("\nSummary of operations:");
    operations.forEach(op => console.log(`- ${op.type.toUpperCase()}: ${op.path}`));

    const rl = createReadlineInterface();
    return new Promise((resolve) => {
        rl.question('\nDo you want to proceed with these changes? (yes/no): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

async function applyChanges(markdownContent, configuredProjectBase) {
    console.log(`Starting to process changes for project base: ${configuredProjectBase}`);
    if (IS_DRY_RUN) {
        console.log("DRY RUN enabled. No files will be written or deleted.");
    }

    const operations = [];
    const fileBlockRegex = /<!-- FILE_START: (.*?) -->\s*```\s*(.*?)\s*\n([\s\S]*?)\n```\s*<!-- FILE_END: \1 -->/gs;    const deleteFileRegex = /<!-- DELETE_FILE: (.*?) -->/g;

    let match;
    const updatesAndCreates = [];
    const deletions = [];

    while ((match = deleteFileRegex.exec(markdownContent)) !== null) {
        const relativeFilePath = match[1].trim();
        deletions.push({ type: 'delete', path: relativeFilePath });
        console.log(`DEBUG: Found potential DELETE: ${relativeFilePath}`);
    }
    deleteFileRegex.lastIndex = 0;

    while ((match = fileBlockRegex.exec(markdownContent)) !== null) {
        const relativeFilePath = match[1].trim();
        const languageHint = match[2].trim();
        const fileContent = match[3];
        updatesAndCreates.push({ type: 'update/create', path: relativeFilePath, content: fileContent });
        console.log(`DEBUG: Found potential UPDATE/CREATE: ${relativeFilePath} (Lang: ${languageHint})`);
    }
    fileBlockRegex.lastIndex = 0;

    deletions.forEach(op => operations.push(op));
    updatesAndCreates.forEach(op => operations.push(op));

    if (operations.length > 0) {
        console.log(`DEBUG: Total operations collected: ${operations.length}`);
    } else {
        console.log("DEBUG: No operations were matched by the regex patterns.");
    }

    if (!(await confirmExecution(operations, configuredProjectBase))) {
        console.log("Operation cancelled by user or no operations to perform.");
        return;
    }

    console.log("\n--- Processing Deletions ---");
    for (const delOp of deletions) {
        const absoluteFilePath = path.join(configuredProjectBase, delOp.path);
        console.log(`DEBUG: Preparing to process DELETE: ${delOp.path}`);
        console.log(`DEBUG: Absolute path for DELETE: ${absoluteFilePath}`);
        console.log(`DEBUG: IS_DRY_RUN status for DELETE: ${IS_DRY_RUN}`);

        if (IS_DRY_RUN) {
            console.log(`DRY RUN: Would DELETE: ${delOp.path} (Full: ${absoluteFilePath})`);
            if (!(await fileExists(absoluteFilePath))) {
                console.log(`DRY RUN: (File ${delOp.path} does not exist anyway)`);
            }
            continue;
        }

        // ACTUAL DELETION LOGIC
        console.log(`DEBUG: EXECUTION MODE - Attempting to delete file: ${absoluteFilePath}`);
        try {
            if (await fileExists(absoluteFilePath)) {
                await fs.unlink(absoluteFilePath);
                console.log(`DELETED: ${delOp.path}`);
            } else {
                console.log(`DELETE SKIPPED (not found): ${delOp.path}`);
            }
        } catch (error) {
            console.error(`ERROR during actual delete for ${delOp.path}:`, error);
            console.error(`ERROR details - Path: ${absoluteFilePath}`);
        }
    }

    console.log("\n--- Processing File Updates/Creations ---");
    for (const upOp of updatesAndCreates) {
        const absoluteFilePath = path.join(configuredProjectBase, upOp.path);
        console.log(`DEBUG: Preparing to process UPDATE/CREATE: ${upOp.path}`);
        console.log(`DEBUG: Absolute path for UPDATE/CREATE: ${absoluteFilePath}`);
        console.log(`DEBUG: IS_DRY_RUN status for UPDATE/CREATE: ${IS_DRY_RUN}`);

        if (IS_DRY_RUN) {
            const action = (await fileExists(absoluteFilePath)) ? "UPDATE" : "CREATE";
            console.log(`DRY RUN: Would ${action}: ${upOp.path} (Full: ${absoluteFilePath})`);
            // console.log(`DRY RUN: Content snippet for ${upOp.path}:\n${upOp.content.substring(0,100)}...`);
            continue;
        }

        // ACTUAL UPDATE/CREATE LOGIC
        console.log(`DEBUG: EXECUTION MODE - Attempting to write file: ${absoluteFilePath}`);
        try {
            const dirName = path.dirname(absoluteFilePath);
            console.log(`DEBUG: Ensuring directory exists: ${dirName}`);
            await fs.mkdir(dirName, { recursive: true });

            console.log(`DEBUG: Content length for ${upOp.path}: ${upOp.content.length} characters`);
            // console.log(`DEBUG: Snippet of content to write for ${upOp.path}:\n${upOp.content.substring(0, 200)}...`);

            const action = (await fileExists(absoluteFilePath)) ? "UPDATED" : "CREATED";
            console.log(`DEBUG: Performing fs.writeFile for ${absoluteFilePath}`);
            await fs.writeFile(absoluteFilePath, upOp.content, 'utf8');
            console.log(`${action}: ${upOp.path}`);
        } catch (error) {
            console.error(`ERROR during actual write for ${upOp.path}:`, error);
            console.error(`ERROR details - Path: ${absoluteFilePath}`);
        }
    }
    console.log("\nFinished applying changes.");
}


async function main() {
    if (!LLM_MARKDOWN_FILE || process.argv.length > 4 || (process.argv.length > 3 && !IS_DRY_RUN)) {
        if (process.argv.includes('--help') || process.argv.includes('-h') || !LLM_MARKDOWN_FILE) {
            console.log("Usage: node applyLLMChanges.js <llm_markdown_file.md> [--dry-run | -d]");
            console.log("\nArguments:");
            console.log("  llm_markdown_file.md  (Required) The path to the Markdown file containing LLM-generated changes.");
            console.log("\nOptions:");
            console.log("  --dry-run, -d         Show what changes would be made without actually modifying any files.");
            console.log("\nConfiguration:");
            console.log("  This script reads 'projectBasePath' from 'llm_workflow_config.json' in its directory.");
            console.log("\nExamples:");
            console.log("  node applyLLMChanges.js ./llm_output.md");
            console.log("  node applyLLMChanges.js ../llm_response_for_proj.md --dry-run");
            process.exit(LLM_MARKDOWN_FILE ? 0 : 1);
        }
        console.error("Invalid arguments. Use --help for usage information.");
        process.exit(1);
    }

    const configuredProjectBase = await loadConfig();

    try {
        const absoluteLlmMarkdownFile = path.resolve(LLM_MARKDOWN_FILE);
        console.log(`Reading LLM response from: ${absoluteLlmMarkdownFile}`);
        const markdownInput = await fs.readFile(absoluteLlmMarkdownFile, 'utf8');
        await applyChanges(markdownInput, configuredProjectBase);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`Error: Markdown file not found at ${LLM_MARKDOWN_FILE}`);
        } else {
            console.error("Error reading or processing LLM markdown file:", error.message);
        }
        process.exit(1);
    }
}

main();