import { imageGenerationService } from './server/imageGenerator';

async function testImageGeneration() {
  console.log('Testing Image Generation Service...');
  
  try {
    // Test with the first content item that doesn't have an image
    const contentId = '00cegh8'; // Feedback Loop content
    
    console.log(`Generating image for content ID: ${contentId}`);
    const imageUrl = await imageGenerationService.generateAndSaveImage(contentId);
    
    console.log(`✅ Successfully generated image: ${imageUrl}`);
    
    // Test the image prompt generation
    const prompt = await imageGenerationService.generateImagePrompt(
      'Feedback Loop: Outputs become inputs in cycles.',
      'Feedback loops are part of chaos theory, where seemingly random events eventually loop back into each other and form a repeating pattern.'
    );
    
    console.log(`✅ Generated AI prompt: ${prompt}`);
    
  } catch (error) {
    console.error('❌ Error testing image generation:', error);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testImageGeneration();
}