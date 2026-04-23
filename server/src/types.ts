export interface ModelParameter {
  aspect_ratio?: string[];
  image_resolution?: string[];
  images?: { min: number; max: number };
  quality?: string[];
  seed?: { min: number; max: number };
  guidance_scale?: { min: number; max: number };
  enable_safety_checker?: boolean[];
  output_format?: string[];
  upscale_factor?: number[];
  resolution?: string[];
  duration?: number[] | { min: number; max: number };
  fixed_lens?: boolean[];
  generate_audio?: boolean[];
  mode?: string[];
  sound?: boolean[];
  character_orientation?: string[];
  multi_shots?: boolean[];
  negative_prompt?: { maxLength?: number; type?: string };
  enable_prompt_expansion?: boolean[];
  size?: string[];
  cfg_scale?: { min: number; max: number };
  tail_image_url?: { type: string };
  watermark?: { maxLength: number };
}

export interface ModelConfig {
  id: string;
  name: string;
  type: 'image';
  maxPromptLength: number;
  parameters: ModelParameter;
  defaults: Record<string, any>;
  requiresImage?: boolean;
  requiresVideo?: boolean;
}

export interface VideoModelConfig {
  id: string;
  name: string;
  type: 'video';
  maxPromptLength: number;
  parameters: ModelParameter;
  defaults: Record<string, any>;
  requiresImage?: boolean;
  requiresVideo?: boolean;
}
