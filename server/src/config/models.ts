import { ModelConfig, VideoModelConfig } from '../types';

export const imageModels: Record<string, ModelConfig> = {
  'black-forest-labs/flux.2-flex': {
    id: 'black-forest-labs/flux.2-flex',
    name: 'Flux.2 Flex',
    type: 'image',
    maxPromptLength: 5000,
    parameters: {
      aspect_ratio: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3'],
      image_resolution: ['1K', '2K'],
      images: { min: 0, max: 8 }
    },
    defaults: {
      aspect_ratio: '1:1',
      image_resolution: '1K',
      images: 1
    }
  },
  'black-forest-labs/flux.2-pro': {
    id: 'black-forest-labs/flux.2-pro',
    name: 'Flux-2 Pro',
    type: 'image',
    maxPromptLength: 5000,
    parameters: {
      aspect_ratio: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3'],
      image_resolution: ['1K', '2K'],
      images: { min: 0, max: 8 }
    },
    defaults: {
      aspect_ratio: '1:1',
      image_resolution: '1K',
      images: 1
    }
  },
  'bytedance/seedream-5-lite': {
    id: 'bytedance/seedream-5-lite',
    name: 'Seedream 5.0 Lite',
    type: 'image',
    maxPromptLength: 2996,
    parameters: {
      aspect_ratio: ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'],
      quality: ['basic', 'high'],
      images: { min: 0, max: 10 }
    },
    defaults: {
      aspect_ratio: '1:1',
      quality: 'basic',
      images: 1
    }
  },
  'bytedance/seedream-4.5': {
    id: 'bytedance/seedream-4.5',
    name: 'Seedream 4.5',
    type: 'image',
    maxPromptLength: 3000,
    parameters: {
      aspect_ratio: ['1:1', '4:3', '3:4', '3:2', '2:3', '16:9', '9:16', '21:9'],
      quality: ['basic', 'high'],
      images: { min: 0, max: 14 }
    },
    defaults: {
      aspect_ratio: '1:1',
      quality: 'basic',
      images: 1
    }
  },
  'bytedance/seedream-4': {
    id: 'bytedance/seedream-4',
    name: 'Seedream 4',
    type: 'image',
    maxPromptLength: 5000,
    parameters: {
      aspect_ratio: ['1:1', '4:3', '3:4', '3:2', '2:3', '16:9', '9:16', '21:9'],
      image_resolution: ['1K', '2K', '4K'],
      images: { min: 0, max: 10 }
    },
    defaults: {
      aspect_ratio: '1:1',
      image_resolution: '2K',
      images: 1
    }
  },
  'bytedance/seedream': {
    id: 'bytedance/seedream',
    name: 'Seedream 3.0',
    type: 'image',
    maxPromptLength: 5000,
    parameters: {
      aspect_ratio: ['1:1', '4:3', '3:4', '16:9', '9:16'],
      seed: { min: 1, max: 4294967295 },
      guidance_scale: { min: 0, max: 20 },
      enable_safety_checker: [true, false]
    },
    defaults: {
      aspect_ratio: '1:1',
      guidance_scale: 2.5,
      enable_safety_checker: true
    }
  },
  'openai/gpt-image-1.5': {
    id: 'openai/gpt-image-1.5',
    name: 'GPT Image 1.5',
    type: 'image',
    maxPromptLength: 5000,
    parameters: {
      aspect_ratio: ['1:1', '2:3', '3:2'],
      quality: ['medium', 'high'],
      images: { min: 0, max: 16 }
    },
    defaults: {
      aspect_ratio: '1:1',
      quality: 'medium',
      images: 1
    }
  },
  'x-ai/grok-imagine-image': {
    id: 'x-ai/grok-imagine-image',
    name: 'Grok Image',
    type: 'image',
    maxPromptLength: 5000,
    parameters: {
      aspect_ratio: ['1:1', '2:3', '3:2'],
      images: { min: 0, max: 1 }
    },
    defaults: {
      aspect_ratio: '1:1',
      images: 1
    }
  },
  'qwen/image': {
    id: 'qwen/image',
    name: 'Qwen Image',
    type: 'image',
    maxPromptLength: 5000,
    parameters: {
      aspect_ratio: ['1:1', '4:3', '3:4', '16:9', '9:16'],
      output_format: ['png', 'jpeg', 'webp'],
      images: { min: 0, max: 1 }
    },
    defaults: {
      aspect_ratio: '1:1',
      output_format: 'png',
      images: 1
    }
  },
  'openai/gpt-5-image-mini': {
    id: 'openai/gpt-5-image-mini',
    name: 'OpenAI GPT-5 Image Mini',
    type: 'image',
    maxPromptLength: 32000,
    parameters: {
      images: { min: 0, max: 10 }
    },
    defaults: {
      images: 1
    }
  },
  'openai/gpt-5-image': {
    id: 'openai/gpt-5-image',
    name: 'OpenAI GPT-5 Image',
    type: 'image',
    maxPromptLength: 32000,
    parameters: {
      images: { min: 0, max: 10 }
    },
    defaults: {
      images: 1
    }
  },
  'google/gemini-2.5-flash-image': {
    id: 'google/gemini-2.5-flash-image',
    name: 'Nano Banana',
    type: 'image',
    maxPromptLength: 20000,
    parameters: {
      aspect_ratio: ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9'],
      output_format: ['png', 'jpeg'],
      images: { min: 0, max: 8 }
    },
    defaults: {
      aspect_ratio: '1:1',
      output_format: 'png',
      images: 1
    }
  },
  'google/gemini-3-pro-image-preview': {
    id: 'google/gemini-3-pro-image-preview',
    name: 'Nano Banana Pro',
    type: 'image',
    maxPromptLength: 20000,
    parameters: {
      aspect_ratio: ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9', 'auto'],
      image_resolution: ['1K', '2K', '4K'],
      images: { min: 0, max: 8 }
    },
    defaults: {
      aspect_ratio: '1:1',
      image_resolution: '2K',
      images: 1
    }
  },
  'google/gemini-3.1-flash-image-preview': {
    id: 'google/gemini-3.1-flash-image-preview',
    name: 'Nano Banana 2',
    type: 'image',
    maxPromptLength: 20000,
    parameters: {
      aspect_ratio: ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9', 'auto'],
      image_resolution: ['1K', '2K', '4K'],
      images: { min: 0, max: 8 }
    },
    defaults: {
      aspect_ratio: '1:1',
      image_resolution: '2K',
      images: 1
    }
  },
  'topaz/image-upscale': {
    id: 'topaz/image-upscale',
    name: 'Topaz Upscale',
    type: 'image',
    maxPromptLength: 1000,
    parameters: {
      upscale_factor: [1, 2, 4, 8]
    },
    defaults: {
      upscale_factor: 2
    }
  }
};

export const videoModels: Record<string, VideoModelConfig> = {
  'bytedance/seedance-1.5-pro': {
    id: 'bytedance/seedance-1.5-pro',
    name: 'Seedance 1.5 Pro',
    type: 'video',
    maxPromptLength: 2500,
    parameters: {
      aspect_ratio: ['1:1', '21:9', '4:3', '3:4', '16:9', '9:16'],
      resolution: ['480p', '720p', '1080p'],
      duration: [4, 8, 12],
      images: { min: 0, max: 2 },
      fixed_lens: [true, false],
      generate_audio: [true, false]
    },
    defaults: {
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: 8,
      fixed_lens: false,
      generate_audio: false
    }
  },
  'kling/v3': {
    id: 'kling/v3',
    name: 'Kling 3.0',
    type: 'video',
    maxPromptLength: 2500,
    parameters: {
      aspect_ratio: ['16:9', '9:16', '1:1'],
      duration: { min: 3, max: 15 },
      images: { min: 0, max: 2 },
      mode: ['std', 'pro'],
      sound: [true, false]
    },
    defaults: {
      aspect_ratio: '16:9',
      duration: 5,
      mode: 'std',
      sound: false
    }
  },
  'kling/v3-motion-control': {
    id: 'kling/v3-motion-control',
    name: 'Kling 3.0 Motion Control',
    type: 'video',
    maxPromptLength: 2500,
    parameters: {
      mode: ['720p', '1080p'],
      character_orientation: ['image', 'video']
    },
    defaults: {
      mode: '720p',
      character_orientation: 'image'
    },
    requiresImage: true,
    requiresVideo: true
  },
  'kling/v2.6-motion-control': {
    id: 'kling/v2.6-motion-control',
    name: 'Kling 2.6 Motion Control',
    type: 'video',
    maxPromptLength: 2500,
    parameters: {
      mode: ['720p', '1080p'],
      character_orientation: ['image', 'video']
    },
    defaults: {
      mode: '720p',
      character_orientation: 'image'
    },
    requiresImage: true,
    requiresVideo: true
  },
  'wan/2.6': {
    id: 'wan/2.6',
    name: 'Wan 2.6',
    type: 'video',
    maxPromptLength: 5000,
    parameters: {
      resolution: ['720p', '1080p'],
      duration: [5, 10, 15],
      images: { min: 0, max: 1 },
      multi_shots: [true, false]
    },
    defaults: {
      resolution: '720p',
      duration: 5,
      multi_shots: false
    }
  },
  'wan/2.5': {
    id: 'wan/2.5',
    name: 'Wan 2.5',
    type: 'video',
    maxPromptLength: 800,
    parameters: {
      aspect_ratio: ['16:9', '9:16', '1:1'],
      resolution: ['720p', '1080p'],
      duration: [5, 10],
      images: { min: 0, max: 1 },
      seed: { min: -1, max: 2147483647 },
      negative_prompt: { maxLength: 500 },
      enable_prompt_expansion: [true, false]
    },
    defaults: {
      aspect_ratio: '16:9',
      resolution: '720p',
      duration: 5,
      seed: -1,
      enable_prompt_expansion: false
    }
  },
  'openai/sora-2-pro': {
    id: 'openai/sora-2-pro',
    name: 'Sora 2 Pro',
    type: 'video',
    maxPromptLength: 10000,
    parameters: {
      aspect_ratio: ['9:16', '16:9'],
      duration: [10, 15],
      images: { min: 0, max: 1 },
      size: ['standard', 'high']
    },
    defaults: {
      aspect_ratio: '16:9',
      duration: 10,
      size: 'high'
    }
  },
  'openai/sora-2': {
    id: 'openai/sora-2',
    name: 'Sora 2',
    type: 'video',
    maxPromptLength: 10000,
    parameters: {
      aspect_ratio: ['9:16', '16:9'],
      duration: [10, 15],
      images: { min: 0, max: 1 }
    },
    defaults: {
      aspect_ratio: '16:9',
      duration: 10
    }
  },
  'kling/v2.5-turbo': {
    id: 'kling/v2.5-turbo',
    name: 'Kling 2.5 Turbo',
    type: 'video',
    maxPromptLength: 2500,
    parameters: {
      aspect_ratio: ['16:9', '9:16', '1:1'],
      duration: [5, 10],
      images: { min: 0, max: 1 },
      cfg_scale: { min: 0, max: 1 },
      tail_image_url: { type: 'string' },
      negative_prompt: { type: 'string' }
    },
    defaults: {
      aspect_ratio: '16:9',
      duration: 5,
      cfg_scale: 1
    }
  },
  'google/veo3': {
    id: 'google/veo3',
    name: 'Veo 3.1 Quality',
    type: 'video',
    maxPromptLength: 2000,
    parameters: {
      aspect_ratio: ['16:9', '9:16', 'auto'],
      seed: { min: 10000, max: 99999 },
      watermark: { maxLength: 50 },
      images: { min: 0, max: 2 },
      mode: ['TEXT_2_VIDEO', 'FIRST_AND_LAST_FRAMES_2_VIDEO']
    },
    defaults: {
      aspect_ratio: '16:9',
      mode: 'TEXT_2_VIDEO'
    }
  },
  'google/veo3_fast': {
    id: 'google/veo3_fast',
    name: 'Veo 3.1 Fast',
    type: 'video',
    maxPromptLength: 2000,
    parameters: {
      aspect_ratio: ['16:9', '9:16', 'auto'],
      seed: { min: 10000, max: 99999 },
      watermark: { maxLength: 50 },
      images: { min: 0, max: 3 },
      mode: ['TEXT_2_VIDEO', 'FIRST_AND_LAST_FRAMES_2_VIDEO', 'REFERENCE_2_VIDEO']
    },
    defaults: {
      aspect_ratio: '16:9',
      mode: 'TEXT_2_VIDEO'
    }
  }
};

export function getAllModels() {
  return {
    image: Object.values(imageModels),
    video: Object.values(videoModels)
  };
}

export function getModelConfig(modelId: string) {
  return imageModels[modelId] || videoModels[modelId];
}
