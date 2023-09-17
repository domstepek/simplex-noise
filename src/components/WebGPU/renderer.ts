import shader from '../../shader/noise.wgsl?raw';

// Utilities
import { WebGPUInitError } from './utils';

// Meshes
import { GradientMesh } from './mesh';

class Renderer {
  canvas: HTMLCanvasElement;

  // Device/Context Objects
  adapter: GPUAdapter | undefined;
  device: GPUDevice | undefined;
  context: GPUCanvasContext | undefined;
  format: GPUTextureFormat | undefined;

  // Pipeline Objects
  bindGroup: GPUBindGroup | undefined;
  pipeline: GPURenderPipeline | undefined;

  // Assets
  gradientMesh: GradientMesh | undefined;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async init() {
    await this.setupDevice();
    this.createAssets();
    this.createPipeline();
  }

  async setupDevice() {
    if (!navigator.gpu) {
      throw new WebGPUInitError('gpu');
    }

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
      throw new WebGPUInitError('adapter');
    }

    this.adapter = adapter;

    const device = await adapter.requestDevice();

    this.device = device;

    this.context = <GPUCanvasContext>this.canvas.getContext('webgpu');

    this.format = navigator.gpu.getPreferredCanvasFormat();

    if (!this.context) {
      throw new WebGPUInitError('context');
    }

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: 'opaque',
    });
  }

  createAssets() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    this.gradientMesh = new GradientMesh(this.device);
  }

  createPipeline() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    if (!this.gradientMesh) {
      throw new Error('Assets not initialized');
    }

    const shaderModule = this.device.createShaderModule({
      code: shader,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [],
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    this.pipeline = this.device.createRenderPipeline({
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
        buffers: [this.gradientMesh.bufferLayout],
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
  }

  render() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    if (!this.context) {
      throw new Error('Context not initialized');
    }

    if (!this.pipeline) {
      throw new Error('Pipeline not initialized');
    }

    if (!this.gradientMesh) {
      throw new Error('Assets not initialized');
    }

    if (!this.bindGroup) {
      throw new Error('BindGroup not initialized');
    }

    //command encoder: records draw commands for submission
    const commandEncoder: GPUCommandEncoder =
      this.device.createCommandEncoder();
    //texture view: image view to the color buffer in this case
    const textureView: GPUTextureView = this.context
      .getCurrentTexture()
      .createView();
    //renderpass: holds draw commands, allocated from command encoder
    const renderpass: GPURenderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.5, g: 0.0, b: 0.25, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    renderpass.setPipeline(this.pipeline);
    renderpass.setVertexBuffer(0, this.gradientMesh.buffer);
    renderpass.setBindGroup(0, this.bindGroup);
    renderpass.draw(3, 1, 0, 0);
    renderpass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }
}

export default Renderer;
