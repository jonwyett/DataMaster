# Addendum: Type-Aware Error Handling Architecture
To create a truly robust API, the error handling system must respect the return type contract of every public method. The "Error as Data" principle is evolved to **"Error as Data of the Correct Type."**
The internal _handleError method will be enhanced to accept a returnTypeHint that dictates the format of its output in the default 'standard' error mode.
**New *****handleError Signature:**** *handleError(errorMessage, errorType, returnTypeHint)
**Error Handling Strategy by Return Type (standard mode):**
1. **For Methods Returning a DataMaster:**
   * **Hint:** 'DataMaster'
   * **Action:** Returns a new DataMaster instance containing a single error record (e.g., _fields: ['ErrorType', 'Message']). This makes the error immediately visible if the data is rendered.
2. **For Methods Returning an Array (e.g., .toRecordset(), .getColumn()):**
   * **Hint:** 'Array'
   * **Action:** Returns an Array containing a structured representation of the error, such as [{ ErrorType: '...', Message: '...' }]. The type contract is maintained, and the error is present in the data.
3. **For Methods Returning a String (e.g., .toCsv()):**
   * **Hint:** 'String'
   * **Action:** Returns a String formatted to represent the error, such as a valid one-row error CSV.
4. **For Methods Returning a Primitive (undefined, null, number - e.g., .getCell()):**
   * **Hint:** 'Primitive'
   * **Action:** Returns a graceful failure value (undefined or null). For these specific methods, direct error detection in standard mode relies on the user-provided onError callback, which will be fired before this value is returned.
This nuanced approach ensures that the library never violates a method's return type contract. It provides detectable, non-disruptive errors for complex types while using a standard callback-and-return-null pattern for primitives, resulting in a predictable and safe developer experience across the entire API.