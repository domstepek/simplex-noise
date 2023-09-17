import shader from '../../shader/noise.wgsl?raw';

// Utilities
import { WebGPUInitError } from './utils';

// Meshes
import { GradientMesh } from './mesh';

// Constants
import { NoiseValues } from '../../App.constants';

class Renderer {
  canvas: HTMLCanvasElement;

  // Device/Context Objects
  adapter: GPUAdapter | undefined;
  device: GPUDevice | undefined;
  context: GPUCanvasContext | undefined;
  format: GPUTextureFormat | undefined;

  // Pipeline Objects
  timeBuffer: GPUBuffer | undefined;
  uniformBuffer: GPUBuffer | undefined;
  bindGroup: GPUBindGroup | undefined;
  pipeline: GPURenderPipeline | undefined;

  // Assets
  gradientMesh: GradientMesh | undefined;

  // Bindings
  time: number = 0;
  frequency: number = NoiseValues.freq;
  amplitude: number = NoiseValues.amp;
  hardness: number = NoiseValues.hardness;
  octaves: number = NoiseValues.octaves;
  lacunarity: number = NoiseValues.lacunarity;

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

    this.uniformBuffer = this.device.createBuffer({
      // 4 bytes per float/uint and 5 floats/uints
      size: 4 * 5,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.timeBuffer = this.device.createBuffer({
      // 4 bytes per float/uint and 1 float/uint
      size: 4 * 1,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.updateUniforms();

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {},
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          buffer: {},
        },
      ],
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.timeBuffer,
          },
        },
        {
          binding: 1,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
      ],
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

  updateUniforms() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    if (!this.uniformBuffer) {
      throw new Error('UniformBuffer not initialized');
    }

    const uniformArray = new Float32Array([
      this.frequency,
      this.amplitude,
      this.hardness,
      this.octaves,
      this.lacunarity,
    ]);

    this.device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      uniformArray.buffer,
      uniformArray.byteOffset,
      uniformArray.byteLength
    );
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

    if (!this.timeBuffer) {
      throw new Error('TimeBuffer not initialized');
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
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    renderpass.setPipeline(this.pipeline);
    renderpass.setVertexBuffer(0, this.gradientMesh.buffer);

    this.time += 0.01;

    const timeArray = new Float32Array([this.time]);

    this.device.queue.writeBuffer(
      this.timeBuffer,
      0,
      timeArray.buffer,
      timeArray.byteOffset,
      timeArray.byteLength
    );

    renderpass.setBindGroup(0, this.bindGroup);
    renderpass.draw(3, 1, 0, 0);
    renderpass.end();

    this.device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(() => {
      this.render.bind(this)();
    });
  }
}

export default Renderer;
