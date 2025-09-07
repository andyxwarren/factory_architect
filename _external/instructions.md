
**How to Run Now:**
Make sure you are in: factory_architect

node ./_external/concatenateCode.js . llm_request.md
node ./_external/concatenateCode.js "./src/components" llm_request.md

node ./_external/applyLLMChanges.js ./_external/llm_response.md --dry-run
node ./_external/applyLLMChanges.js ./_external/llm_response.md



*   **To process the entire `factory_architect` project and save output to the script's folder:**
    ```powershell
    node ./_external/concatenateCode.js . myCodebase.md
    ```
    *   Output file will be: `C:\Users\Andyx\Documents\projects\factory_architect\_external\myCodebase.md`

*   **To process a specific subfolder, e.g., `factory_architect/src/components` and save output to script's folder:**
    ```powershell
    node ./_external/concatenateCode.js "./src/components" myCodebase.md
    ```
    *   Output file will be: `C:\Users\Andyx\Documents\projects\factory_architect\_external\components_specific_code.md`

*   **If you omit the output filename:**
    ```powershell
    node ./_external/concatenateCode.js .
    ```
    *   Output file will be: `C:\Users\Andyx\Documents\projects\factory_architect\_external\concatenated_codebase.md` (using the `DEFAULT_OUTPUT_FILENAME`)