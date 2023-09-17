import { WebGPUErrors } from './constants';
import { WebGPUErrorType } from './types';

export class WebGPUInitError extends Error {
  type: WebGPUErrorType;

  constructor(type: WebGPUErrorType) {
    super(WebGPUErrors[type]);
    this.name = 'WebGPUInitError';
    this.type = type;
  }
}
