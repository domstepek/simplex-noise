import shader from '../../shader/noise.wgsl?raw';

import { Mesh } from './mesh';

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

export const getWebGPUDevice = async () => {
  if (!navigator.gpu) {
    throw new WebGPUInitError('gpu');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new WebGPUInitError('adapter');
  }

  const device = await adapter.requestDevice();

  return device;
};

export const getContext = (canvas: HTMLCanvasElement, device: GPUDevice) => {
  const context = canvas.getContext('webgpu');

  if (!context) {
    throw new WebGPUInitError('context');
  }

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'opaque',
  });

  return context;
};

export const renderImage = async (
  context: GPUCanvasContext,
  device: GPUDevice
) => {
  const shaderModule = device.createShaderModule({
    code: shader,
  });

  const mesh = new Mesh(device);

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [],
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [],
  });

  const pipelineLayout = device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  });

  const renderPipeline = device.createRenderPipeline({
    vertex: {
      module: shaderModule,
      entryPoint: 'vs_main',
      buffers: [mesh.bufferLayout],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs_main',
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
    // primitive: {
    //   topology: 'triangle-list',
    // },
    layout: pipelineLayout,
  });

  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
        loadOp: 'clear',
        storeOp: 'store',
        view: context.getCurrentTexture().createView(),
      },
    ],
  });

  passEncoder.setPipeline(renderPipeline);
  passEncoder.setBindGroup(0, bindGroup);

  passEncoder.setVertexBuffer(0, mesh.buffer);

  passEncoder.draw(3);

  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);
};
