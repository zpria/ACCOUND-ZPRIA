
// AI Image Generation Service for Profile Pictures
// Uses Stability AI for image generation

const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY || '';
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

export interface ProfileImageParams {
  gender: 'male' | 'female' | 'other';
  ageRange: string;
  style: 'professional' | 'casual' | 'artistic' | 'modern';
}

// Generate AI profile image based on user demographics
export const generateProfileImage = async (params: ProfileImageParams): Promise<string | null> => {
  try {
    const prompt = buildImagePrompt(params);
    
    const response = await fetch(STABILITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: 'blurry, low quality, distorted, ugly, duplicate, watermark, signature, text, logo',
            weight: -1
          }
        ],
        cfg_scale: 7,
        samples: 1,
        steps: 30,
        width: 1024,
        height: 1024
      })
    });

    if (!response.ok) {
      throw new Error(`Stability API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.artifacts && data.artifacts.length > 0) {
      // Return base64 image
      return `data:image/png;base64,${data.artifacts[0].base64}`;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to generate AI image:', error);
    return null;
  }
};

// Build prompt based on user parameters
const buildImagePrompt = (params: ProfileImageParams): string => {
  const { gender, ageRange, style } = params;
  
  let prompt = `Professional portrait avatar of a ${ageRange} ${gender}, `;
  
  // Style variations
  switch (style) {
    case 'professional':
      prompt += 'business attire, confident pose, clean background, high quality, photorealistic, studio lighting, sharp focus';
      break;
    case 'casual':
      prompt += 'casual clothing, friendly smile, natural background, high quality, photorealistic, soft lighting';
      break;
    case 'artistic':
      prompt += 'artistic style, creative composition, vibrant colors, digital art style, unique character design';
      break;
    case 'modern':
      prompt += 'modern style, trendy look, gradient background, minimal aesthetic, high quality, clean design';
      break;
    default:
      prompt += 'professional look, clean background, high quality, photorealistic';
  }
  
  // Add common quality enhancers
  prompt += ', 8k resolution, detailed, professional photography, portrait style, centered composition';
  
  return prompt;
};

// Generate avatar from initials (fallback)
export const generateInitialsAvatar = (firstName: string, lastName: string): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = 512;
  canvas.height = 512;
  
  // Generate color from name
  const color = generateColorFromString(`${firstName}${lastName}`);
  
  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add gradient overlay
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Text
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 200px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 256, 256);
  
  return canvas.toDataURL('image/png');
};

// Generate color from string
const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#0071e3', '#34c759', '#ff9500', '#ff3b30', '#af52de',
    '#5856d6', '#ff2d55', '#5ac8fa', '#ffcc00', '#ff6482'
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (imageBase64: string): Promise<string | null> => {
  try {
    const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
    const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
    
    const formData = new FormData();
    formData.append('file', imageBase64);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'zpria_profiles');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Failed to upload to Cloudinary:', error);
    return null;
  }
};

// Auto-generate and save profile image
export const autoGenerateProfileImage = async (
  userId: string,
  firstName: string,
  lastName: string,
  gender: string,
  dob: string
): Promise<string | null> => {
  try {
    // Calculate age from DOB
    const age = calculateAge(dob);
    const ageRange = getAgeRange(age);
    
    // Determine style based on age
    const style = determineStyle(age);
    
    // Generate AI image
    const imageBase64 = await generateProfileImage({
      gender: gender?.toLowerCase() as 'male' | 'female' | 'other' || 'other',
      ageRange,
      style
    });
    
    if (!imageBase64) {
      // Fallback to initials avatar
      return generateInitialsAvatar(firstName, lastName);
    }
    
    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(imageBase64);
    
    if (imageUrl) {
      // Save to database
      const { supabase } = await import('./supabaseService');
      await supabase
        .from('users')
        .update({ avatar_url: imageUrl, ai_generated_avatar: true })
        .eq('id', userId);
    }
    
    return imageUrl || imageBase64;
  } catch (error) {
    console.error('Auto-generation failed:', error);
    return generateInitialsAvatar(firstName, lastName);
  }
};

// Calculate age from DOB
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Get age range string
const getAgeRange = (age: number): string => {
  if (age < 18) return 'young';
  if (age < 30) return 'young adult';
  if (age < 50) return 'adult';
  return 'mature';
};

// Determine image style based on age
const determineStyle = (age: number): 'professional' | 'casual' | 'artistic' | 'modern' => {
  if (age < 25) return 'modern';
  if (age < 40) return 'professional';
  if (age < 60) return 'casual';
  return 'professional';
};

export default {
  generateProfileImage,
  generateInitialsAvatar,
  uploadToCloudinary,
  autoGenerateProfileImage
};
