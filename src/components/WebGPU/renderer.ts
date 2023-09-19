import shader from '../../shader/noise.wgsl?raw';

// Utilities
import { WebGPUInitError } from './utils';

// Constants
import { NoiseValues, ColorValues, TransformValues } from '../../App.constants';
import { hexToVectorArray } from '../../utils/misc';

class Renderer {
  canvas: HTMLCanvasElement;

  // Device/Context Objects
  adapter: GPUAdapter | undefined;
  device: GPUDevice | undefined;
  context: GPUCanvasContext | undefined;
  format: GPUTextureFormat | undefined;

  // Pipeline Objects
  transformBuffer: GPUBuffer | undefined;
  timeBuffer: GPUBuffer | undefined;
  noiseBuffer: GPUBuffer | undefined;
  colorBuffer: GPUBuffer | undefined;
  clampBuffer: GPUBuffer | undefined;

  bindGroup: GPUBindGroup | undefined;
  pipeline: GPURenderPipeline | undefined;

  // Binding Group 0
  transform = TransformValues;

  // Binding Group 1
  time: number = 0;

  // Binding Group 2
  noiseSettings = {
    freq: NoiseValues.freq,
    amp: NoiseValues.amp,
    hardness: NoiseValues.hardness,
    octaves: NoiseValues.octaves,
    lacunarity: NoiseValues.lacunarity,
  };

  // Binding Group 3
  colorSettings = {
    primaryColor: hexToVectorArray(ColorValues.primaryColor),
    secondaryColor: hexToVectorArray(ColorValues.secondaryColor),
  };

  // Binding Group 4
  clampSettings = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  async init() {
    await this.setupDevice();
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
      alphaMode: 'premultiplied',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  createPipeline() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    const shaderModule = this.device.createShaderModule({
      code: shader,
    });

    // #region Buffer Creation
    this.transformBuffer = this.device.createBuffer({
      // 4 bytes per float/uint and 24 floats/uints + 4 * 8 bytes for padding
      size: 4 * 24 + 4 * 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.timeBuffer = this.device.createBuffer({
      // 4 bytes per float/uint and 1 float/uint
      size: 4 * 1,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.noiseBuffer = this.device.createBuffer({
      // 4 bytes per float/uint and 5 floats/uints
      size: 4 * 5,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.colorBuffer = this.device.createBuffer({
      // 4 bytes per float/uint and 6 floats/uints (8 bytes for padding)
      size: 4 * 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.clampBuffer = this.device.createBuffer({
      // 4 bytes per float/uint and 1 float/uint
      size: 4 * 1,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    // #endregion

    this.updateModelViewProjectionSettings();
    this.updateNoiseSettings();
    this.updateColorSettings();
    this.updateClampSettings();

    const bindingGroups = [
      [this.transformBuffer, GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX],
      [this.timeBuffer, GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX],
      [this.noiseBuffer, GPUShaderStage.FRAGMENT],
      [this.colorBuffer, GPUShaderStage.FRAGMENT],
      [this.clampBuffer, GPUShaderStage.FRAGMENT],
    ] as const;

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: bindingGroups.map((binding, i) => ({
        binding: i,
        visibility: binding[1],
        buffer: {},
      })),
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: bindingGroups.map((binding, i) => ({
        binding: i,
        resource: {
          buffer: binding[0],
        },
      })),
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    this.pipeline = this.device.createRenderPipeline({
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main',
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
      primitive: {
        topology: 'triangle-strip',
      },
      layout: pipelineLayout,
    });
  }

  updateModelViewProjectionSettings() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    if (!this.transformBuffer) {
      throw new Error('ModelViewProjectionBuffer not initialized');
    }

    const transformArray = new Float32Array([
      this.canvas.width,
      this.canvas.height,
    ]);

    const TransformValues = new ArrayBuffer(128);
    const TransformViews = {
      resolution: new Float32Array(TransformValues, 0, 2),
      projection: {
        fov: new Float32Array(TransformValues, 16, 1),
        aspect: new Float32Array(TransformValues, 20, 1),
        near: new Float32Array(TransformValues, 24, 1),
        far: new Float32Array(TransformValues, 28, 1),
      },
      model: {
        position: new Float32Array(TransformValues, 32, 3),
        rotation: new Float32Array(TransformValues, 48, 3),
        scale: new Float32Array(TransformValues, 64, 3),
      },
      view: {
        eye: new Float32Array(TransformValues, 80, 3),
        center: new Float32Array(TransformValues, 96, 3),
        up: new Float32Array(TransformValues, 112, 3),
      },
    };

    TransformViews.resolution.set(transformArray);
    TransformViews.projection.fov.set([this.transform.projection.fov]);
    TransformViews.projection.aspect.set([
      this.canvas.width / this.canvas.height,
    ]);
    TransformViews.projection.near.set([this.transform.projection.near]);
    TransformViews.projection.far.set([this.transform.projection.far]);
    TransformViews.model.position.set(this.transform.model.position);
    TransformViews.model.rotation.set(this.transform.model.rotation);
    TransformViews.model.scale.set(this.transform.model.scale);
    TransformViews.view.eye.set(this.transform.view.eye);
    TransformViews.view.center.set(this.transform.view.center);
    TransformViews.view.up.set(this.transform.view.up);

    this.device.queue.writeBuffer(this.transformBuffer, 0, TransformValues);
  }

  updateNoiseSettings() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    if (!this.noiseBuffer) {
      throw new Error('UniformBuffer not initialized');
    }

    const noiseArray = new Float32Array([
      this.noiseSettings.freq,
      this.noiseSettings.amp,
      this.noiseSettings.hardness,
      this.noiseSettings.octaves,
      this.noiseSettings.lacunarity,
    ]);

    this.device.queue.writeBuffer(this.noiseBuffer, 0, noiseArray);
  }

  updateColorSettings() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    if (!this.colorBuffer) {
      throw new Error('UniformBuffer not initialized');
    }

    const ColorSettingsValues = new ArrayBuffer(32);
    const ColorSettingsViews = {
      primaryColor: new Float32Array(ColorSettingsValues, 0, 3),
      secondaryColor: new Float32Array(ColorSettingsValues, 16, 3),
    };

    ColorSettingsViews.primaryColor.set(this.colorSettings.primaryColor);
    ColorSettingsViews.secondaryColor.set(this.colorSettings.secondaryColor);

    this.device.queue.writeBuffer(this.colorBuffer, 0, ColorSettingsValues);
  }

  updateClampSettings() {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    if (!this.clampBuffer) {
      throw new Error('UniformBuffer not initialized');
    }

    const clampArray = new Float32Array([this.clampSettings ? 1 : 0]);

    this.device.queue.writeBuffer(this.clampBuffer, 0, clampArray);
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

    this.time += 0.01;
    const timeArray = new Float32Array([this.time]);

    this.device.queue.writeBuffer(this.timeBuffer, 0, timeArray);

    renderpass.setBindGroup(0, this.bindGroup);
    renderpass.draw(6, 1, 0, 0);
    renderpass.end();

    this.device.queue.submit([commandEncoder.finish()]);

    requestAnimationFrame(() => this.render.bind(this)());
  }
}

export default Renderer;
