export function transformBody(data: any): any {
  if (data === null || typeof data !== 'object' || data instanceof Date) {
    return data; // Base case: not an object, return as is
  }

  if (Array.isArray(data)){
    return data.map(item => transformBody(item))
  }

  const transformed: any = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];

      if (typeof value === 'object' && value !== null && value.hasOwnProperty('documentId')) {
        transformed[key] = value.documentId; // Extract ID if it's a nested object with an 'id'
      } else {
        transformed[key] = transformBody(value); // Recursively transform nested objects
      }
    }
  }
  return transformed;
}
