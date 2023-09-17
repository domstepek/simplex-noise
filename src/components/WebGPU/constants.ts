import { WebGPUErrorType } from './types';

export const WebGPUErrors: Record<WebGPUErrorType, string> = {
  gpu: 'WebGPU not supported, falling back to WebGL',
  adapter: 'Failed to find a suitable GPU adapter',
  context: 'Failed to create WebGPU context',
};
