# JavaScript Library Refactoring Instructions

## Primary Role
You are an expert JavaScript developer specializing in API design and library refactoring. Your task is to rewrite an existing JavaScript library according to a detailed architectural redesign proposal.

## Core Task
Refactor the attached `datamaster.js` file into a new, single file that implements the architecture and API specified in the attached `redesign-proposal.md`.

## Provided Files (for context and implementation)

1. **datamaster.js (The Original Source):** This file contains the original, working implementation of all the data manipulation logic. You must reuse and adapt this logic to fit the new class-based structure and public API. Do not discard the core algorithms within it.

2. **README.md and DataQuery.md (Original Documentation):** These files provide context on the library's original features and intended use cases. They are for reference only; the new design specified in the proposal is the single source of truth for the final API.

3. **redesign-proposal.md (The Blueprint):** This is the **most important file** and your primary instruction set. You must adhere to all architectural principles, API method signatures, and coding style guidelines laid out in this document.

## Key Architectural Requirements from the Proposal

### 1. Single File Output
The final output must be a single, self-contained JavaScript file.

### 2. IIFE Wrapper
The entire library must be wrapped in an IIFE to create a private scope and avoid polluting the global namespace.

### 3. ES6 Class Structure
Refactor the main component into an ES6 DataMaster class.

### 4. Static Factory Methods
Implement the `fromRecordset`, `fromTable`, `fromCsv`, and `fromGenerator` static methods for instantiation. The old, overloaded constructor must be removed.

### 5. Public API Manifest
The public methods of the DataMaster instance must exactly match the finalized API manifest in the proposal. This includes:

- The clear separation of Mutator methods (returning `this`) and Accessor/Selector methods (returning a new value)
- The implementation of the new, simplified `.search()` and `.limit()` methods
- The implementation of the master `.query()` method and its discoverable wrappers (`.select()`, `.update()`, `.delete()`)
- The new, pure `toXXX()` serialization methods (`toRecordset`, `toCsv`, etc.)

### 6. Coding Style
- Use `const` and `let` appropriately; no `var`
- Use the `*` prefix for internal/protected properties and methods (e.g., `*table`, `_findFieldIndex`). Do not use the `#` syntax for private fields
- Adhere to clear, descriptive naming conventions

### 7. Error Handling
Implement the centralized `_handleError` method and the configurable `errorMode` system as specified.

### 8. UMD Export
The file must end with the provided UMD boilerplate to ensure compatibility with both Node.js (`module.exports`) and browsers (`window.jwdm`).

## Final Output
Your final output should be a single block of code representing the complete, refactored JavaScript file. Do not break it into multiple parts. Ensure it is ready to be saved as `datamaster.refactored.js`.