export class Mesh {
  buffer: GPUBuffer;
  bufferLayout: GPUVertexBufferLayout;

  constructor(device: GPUDevice) {
    // x y r g b
    const verticies: Float32Array = new Float32Array([
      0.0, 0.5, 1.0, 0.0, 0.0, -0.5, -0.5, 0.0, 1.0, 0.0, 0.5, -0.5, 0.0, 0.0,
      1.0,
    ]);

    const usage: GPUBufferUsageFlags =
      GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

    const descriptor: GPUBufferDescriptor = {
      size: verticies.byteLength,
      usage,
      mappedAtCreation: true,
    };

    this.buffer = device.createBuffer(descriptor);

    new Float32Array(this.buffer.getMappedRange()).set(verticies);

    this.buffer.unmap();

    this.bufferLayout = {
      // 4 bytes per float and 5 floats per vertex
      arrayStride: 4 * 5,
      attributes: [
        {
          shaderLocation: 0,
          format: 'float32x2',
          offset: 0,
        },
        {
          shaderLocation: 1,
          format: 'float32x3',
          offset: 4 * 2,
        },
      ],
    };
  }
}
