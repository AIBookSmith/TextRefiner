const { Mistral } = require('@mistralai/mistralai');

// Log the Mistral constructor to see what it is
console.log('Mistral constructor:', typeof Mistral);

// Try to create an instance with a dummy API key
try {
  const client = new Mistral('dummy-api-key');
  console.log('Client created successfully:', typeof client);
  console.log('Client methods:', Object.keys(client).filter(k => typeof client[k] === 'function'));
} catch (error) {
  console.error('Error creating client:', error.message);
}
