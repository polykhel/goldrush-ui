// Helper function to handle empty/blank strings
export const formatValue = (value?: string | null): string => {
  const trimmedValue = value?.trim();
  if (trimmedValue) return trimmedValue;
  return '';
}

// Helper function to format paired values with dash
export const formatPairedValues = (
  value1?: string | null,
  value2?: string | null,
  separator: string = '-',
): string => {
  const formattedValue1 = formatValue(value1);
  const formattedValue2 = formatValue(value2);

  if (!formattedValue1 && !formattedValue2) return '';
  if (!formattedValue1)
    return ' '.repeat(formattedValue2.length + 1) + formattedValue2;
  if (!formattedValue2) return formattedValue1;
  return `${formattedValue1} ${separator} ${formattedValue2}`;
};
