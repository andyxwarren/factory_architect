
```markdown
Hello! I am providing you with a concatenated text document representing a codebase or a portion of it. Each file within this document is formatted as follows:

--- START FILE: path/to/relative/file.ext ---
```[language_hint]
// File content here
```
--- END FILE: path/to/relative/file.ext ---

**Your Task:**

I've attached some csv files with feedback to questions which have been generated in my first question factory. Please can you analyse the feedback and propose changes to my question factory to address the notes in the csv files?


**End of task**

**Output Format Instructions (Strict Adherence Required):**

When you provide your response with the modified code, it is **ABSOLUTELY CRITICAL** that you follow this specific Markdown format for **EVERY** file that is changed, created, or deleted. This output will be parsed by an automated script.

1.  **For AMENDED (Modified) or NEW (Newly Created) Files:**
    *   You **MUST** provide the **ENTIRE, COMPLETE** content of the file, even if only one line has changed. Do not provide diffs, snippets, or summaries of changes *within* the code block itself.
    *   Each file's content **MUST** be enclosed in the following structure:

        ```markdown
        <!-- FILE_START: path/to/your/file.ext -->
        ```[language_hint]
        // The ENTIRE new or modified content of this file goes here.
        // For example, if it's a JavaScript file:
        function example() {
          console.log("This is the full file content.");
        }
        export default example;
        ```
        <!-- FILE_END: path/to/your/file.ext -->
        ```
    *   Replace `path/to/your/file.ext` with the **exact relative file path** as it was in the input document (for amended files), or the intended path for a new file. This path **MUST** be relative to the root of the provided codebase context.
    *   Replace `[language_hint]` (e.g., `javascript`, `python`, `typescript`, `css`, `html`) with the appropriate language for the code block. If no language hint is appropriate (e.g., for a `.txt` or `.json` file), you can use `text` or omit the language hint (e.g., just ```).
    *   Please **always** use forward slashes in file paths like this `/`.

2.  **For Files to be DELETED:**
    *   Use the following specific comment format:
        ```markdown
        <!-- DELETE_FILE: path/to/obsolete/file.ext -->
        ```
    *   Replace `path/to/obsolete/file.ext` with the **exact relative file path** of the file to be deleted.
    *   Do **NOT** include any code block or `FILE_START`/`FILE_END` markers for deleted files.

**Important Rules for Your Output (Critical for Automation):**

*   **COMPLETE FILES ONLY (FOR AMEND/NEW):** I reiterate, for any file you list using `FILE_START` and `FILE_END`, you must provide the **full and complete source code** for that file, reflecting all your changes.
*   **PATH ACCURACY:** The relative file paths used in `FILE_START:`, `FILE_END:`, and `DELETE_FILE:` must be **identical** to the paths provided in the input document (for existing/deleted files) or the correct intended paths (for new files). Paths are case-sensitive on many systems.
*   **ONLY AFFECTED FILES:** Only include entries (using `FILE_START`/`FILE_END` or `DELETE_FILE`) for files that have actually been modified, created, or need to be deleted. **Do not include files that remain unchanged from the input.**
*   **EXPLANATIONS:** You are welcome to provide explanations, comments, or summaries of your changes *outside* of these structured blocks. For example, you can write text before the first `<!-- FILE_START... -->` or between a `<!-- FILE_END... -->` block and the next `<!-- FILE_START... -->` block. My script will ignore text outside these specific markers and their associated code blocks.
*   **NO EXTRA TEXT WITHIN MARKERS:** Do not add any explanatory text *inside* the `<!-- ... -->` comments themselves, other than the required file path.
*   **NO NESTING:** Do not nest these marker blocks.

**Example of Expected Output Structure:**

```markdown
Okay, I've made the requested changes. Here's the updated code:

Some general explanation about the overall changes can go here.

<!-- FILE_START: src/services/UserService.js -->
```javascript
// ENTIRE content of the AMENDED UserService.js
async function getUser(id) {
  // ... new async/await implementation ...
  return user;
}
// ... other functions ...
export { getUser };
```
<!-- FILE_END: src/services/UserService.js -->

I've refactored `UserService.js` to use async/await. I also created a new utility function.

<!-- FILE_START: src/utils/errorHandler.js -->
```javascript
// ENTIRE content of the NEW errorHandler.js
export function handleGlobalError(error) {
  console.error("Global Error:", error);
  // ... more logic ...
}
```
<!-- FILE_END: src/utils/errorHandler.js -->

And I've removed an old API file.

<!-- DELETE_FILE: src/legacy/api.js -->

Please review these changes.
```

**Confirmation:**
Do you understand these formatting instructions completely? It is vital for my automated workflow that you adhere to them precisely.

---
***CODEBASE FOLLOWS:***
```

**How this `prompt.md` will be used:**

1.  When you run `concatenateCode.js`, it will read this `prompt.md` file.
2.  It will then write the content of `prompt.md` to the *top* of the output file (e.g., `concatenated_code_with_prompt.md`).
3.  Following this prompt, the script will append the header (`# Codebase from...`) and then all your concatenated code files.
4.  You will then open the generated output file (e.g., `concatenated_code_with_prompt.md`), **find the `[<<< IMPORTANT: ... >>>]` placeholder**, and **replace it with your specific instructions for that particular LLM interaction.**
5.  Finally, you copy the *entire content* of that edited file and paste it into the LLM.