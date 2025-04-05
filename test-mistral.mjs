import { Mistral } from '@mistralai/mistralai';

try {
  const client = new Mistral({ apiKey: 'dummy-api-key' });
  
  // Check what methods are available on chat
  console.log('Chat prototype methods:', Object.getOwnPropertyNames(client.chat.__proto__));
  
  // Try to get information about the chat method
  console.log('Chat method:', client.chat);
  
  // Check if there are any properties that might be methods
  for (const prop in client.chat) {
    console.log(`Property ${prop}:`, typeof client.chat[prop]);
  }
} catch (error) {
  console.error('Error:', error.message);
}
