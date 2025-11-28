export function parseProductData(data) {
  if (!data) return null
  
  if (typeof data === 'object') {
    return data
  }

  try {
    return JSON.parse(data)
  } catch (error) {
    // If standard JSON fails, try parsing as a JavaScript object literal
    // This handles cases where data is stored like {'key': 'value'} (single quotes)
    try {
      const trimmed = data.trim();
      // Basic safety check: ensure it starts/ends with braces or brackets
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        // Use new Function to safely evaluate the object literal
        return new Function('return ' + data)();
      }
    } catch (e) {
      // console.error("Failed to parse product data:", e);
    }
    
    return data
  }
}
