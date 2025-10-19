// Test Digital Samba SDK import
import DigitalSambaEmbedded from '@digitalsamba/embedded-sdk';

console.log('Digital Samba SDK:', DigitalSambaEmbedded);

// Test creating a control
try {
  const testControl = DigitalSambaEmbedded.createControl({
    url: 'https://quest4knowledge.digitalsamba.com/test',
    root: document.body
  });
  console.log('Digital Samba control created:', testControl);
} catch (error) {
  console.error('Error creating Digital Samba control:', error);
}
