
export function parseProductData(data) {
  if (!data) return null;
  if (typeof data === 'object') return data;

  try {
    // Try standard JSON parse first
    return JSON.parse(data);
  } catch (e) {
    // If that fails, try to handle Python-style stringified dicts
    // This is a basic heuristic: replace single quotes with double quotes, 
    // but be careful about nested quotes.
    // A safer way for simple cases:
    try {
        // Handle mixed quotes: {'Key': "Value"}
        if (data.includes("': \"")) {
             let mixedJson = data;
             // Replace start {' with {"
             mixedJson = mixedJson.replace(/^\s*{'/, '{"');
             
             // Replace ': " with ": "
             mixedJson = mixedJson.replace(/': "/g, '": "');
             // Replace ", ' with ", "
             mixedJson = mixedJson.replace(/", '/g, '", "');
             
             return JSON.parse(mixedJson);
        }

        // Standard Python-style dict parsing
        let jsonString = data;
        
        // 1. Replace {' with {"
        jsonString = jsonString.replace(/{'/g, '{"');
        // 2. Replace '} with "}
        jsonString = jsonString.replace(/'}/g, '"}');
        // 3. Replace ': ' with ": "
        jsonString = jsonString.replace(/': '/g, '": "');
        // 4. Replace ', ' with ", "
        jsonString = jsonString.replace(/', '/g, '", "');
        
        // Handle nested objects: ': {' -> ": {"
        jsonString = jsonString.replace(/': {/g, '": {');
        // Handle end of nested objects: '}, ' -> "}, "
        jsonString = jsonString.replace(/'}, /g, '"}, ');
        
        // Handle array start: ': [' -> ": ["
        jsonString = jsonString.replace(/': \[/g, '": [');
        
        return JSON.parse(jsonString);
    } catch (e2) {
        console.error("Failed to parse product data:", data);
        return data; // Return original string if all else fails
    }
  }
}
