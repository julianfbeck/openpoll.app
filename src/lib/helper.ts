export function getAllOptions(formData: FormData) {
  // Initialize an array to hold the 'options' values
  const options = [];

  // Use FormData.entries() to iterate over key-value pairs
  for (const [key, value] of formData.entries()) {
    // Check if the key matches the pattern 'options[index]'
    if (key.startsWith('options[')) {
      options.push(value as string);
    }
  }

  return options;
}
