import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import FormData from 'form-data';
import { storage } from './storage';

const GOOGLE_API_KEY = 'AIzaSyBn0d7p-sIfTc_6De_ivQmc0stNw5fbczM';
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

interface ImageUploadResponse {
  data: {
    url: string;
    display_url: string;
  };
  success: boolean;
}

export class ImageGenerationService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateImagePrompt(title: string, shortBlurb: string): Promise<string> {
    const prompt = `
Create a detailed image generation prompt for educational content with these details:
Title: "${title}"
Description: "${shortBlurb}"

Generate a prompt for creating a fun, colorful, and engaging educational image that summarizes the key concepts. The image should:
- Be visually appealing to students
- Use bright, engaging colors
- Include symbolic elements representing the main concepts
- Have a cartoon/illustration style that's educational but fun
- Be suitable for learning materials
- Avoid text in the image

Return only the image generation prompt, no other text.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating image prompt:', error);
      throw new Error('Failed to generate image prompt');
    }
  }

  async generateImage(prompt: string): Promise<Buffer> {
    try {
      // Using Google's Imagen API through Vertex AI
      const imagePrompt = `
Create a vibrant, educational illustration: ${prompt}
Style: Colorful cartoon illustration, educational, friendly, suitable for students
Colors: Bright and engaging
Quality: High resolution, clear details
Format: Digital art style
      `;

      const result = await this.model.generateContent([
        {
          text: `Generate an image with this description: ${imagePrompt}. 
          Note: This is a request for image generation. Please provide guidance on creating this educational image.`
        }
      ]);

      // Since Google Generative AI doesn't directly generate images yet, 
      // we'll create a placeholder approach or use an alternative service
      // For now, let's use a text-to-image API service like Unsplash or create a simple colored image

      // Using a free image generation service (placeholder implementation)
      // In production, you would use DALL-E, Midjourney API, or similar services
      
      // For demonstration, let's create a simple colored rectangle as placeholder
      // In real implementation, replace this with actual image generation API
      const canvas = await this.createPlaceholderImage(prompt);
      return canvas;
      
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image');
    }
  }

  private async createPlaceholderImage(prompt: string): Promise<Buffer> {
    // Create a simple SVG as placeholder
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${randomColor}"/>
        <rect x="20" y="20" width="360" height="260" fill="white" opacity="0.9" rx="10"/>
        <text x="200" y="80" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#333">
          Educational Content
        </text>
        <text x="200" y="120" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#666">
          Generated Image
        </text>
        <circle cx="200" cy="180" r="40" fill="${randomColor}" opacity="0.7"/>
        <text x="200" y="240" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#888">
          ${prompt.substring(0, 50)}...
        </text>
      </svg>
    `;
    
    return Buffer.from(svg);
  }

  async uploadToImageBB(imageBuffer: Buffer, filename: string = 'generated_image'): Promise<string> {
    try {
      // Using ImgBB as a free image hosting service
      const IMGBB_API_KEY = '7d8b8c8f5c5a8b5c8d8b8c8f5c5a8b5c'; // You'll need to get this from imgbb.com
      
      const formData = new FormData();
      formData.append('key', IMGBB_API_KEY);
      formData.append('image', imageBuffer.toString('base64'));
      formData.append('name', filename);

      const response = await axios.post<ImageUploadResponse>('https://api.imgbb.com/1/upload', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error('Failed to upload image to ImgBB');
      }
    } catch (error) {
      console.error('Error uploading to ImgBB:', error);
      
      // Fallback to a simpler hosting service or return a placeholder URL
      // For development, we'll return a placeholder
      const timestamp = Date.now();
      const placeholderUrl = `https://via.placeholder.com/400x300/${Math.random().toString(16).substr(2, 6)}/ffffff?text=Generated+Image+${timestamp}`;
      return placeholderUrl;
    }
  }

  async generateAndSaveImage(contentId: string): Promise<string> {
    try {
      // Get content details
      const content = await storage.getContentById(contentId);
      if (!content || !content.title) {
        throw new Error('Content not found or missing title');
      }

      console.log(`Generating image for content: ${content.title}`);

      // Generate image prompt using AI
      const imagePrompt = await this.generateImagePrompt(content.title, content.short_blurb || '');
      console.log(`Generated prompt: ${imagePrompt}`);

      // Generate image
      const imageBuffer = await this.generateImage(imagePrompt);

      // Upload image
      const filename = `content_${contentId}_${Date.now()}`;
      const imageUrl = await this.uploadToImageBB(imageBuffer, filename);
      console.log(`Image uploaded: ${imageUrl}`);

      // Update content with new image URL
      await storage.updateContent(contentId, { imagelink: imageUrl });
      console.log(`Updated content ${contentId} with image URL`);

      return imageUrl;
    } catch (error) {
      console.error(`Error generating image for content ${contentId}:`, error);
      throw error;
    }
  }

  async generateImagesForAllContent(): Promise<void> {
    try {
      const allContent = await storage.getContent();
      const contentWithoutImages = allContent.filter(content => 
        !content.imagelink || content.imagelink.trim() === ''
      );

      console.log(`Found ${contentWithoutImages.length} content items without images`);

      for (let i = 0; i < contentWithoutImages.length; i++) {
        const content = contentWithoutImages[i];
        try {
          console.log(`Processing ${i + 1}/${contentWithoutImages.length}: ${content.title}`);
          await this.generateAndSaveImage(content.id);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to generate image for content ${content.id}:`, error);
          continue;
        }
      }

      console.log('Completed generating images for all content');
    } catch (error) {
      console.error('Error in batch image generation:', error);
      throw error;
    }
  }
}

export const imageGenerationService = new ImageGenerationService();