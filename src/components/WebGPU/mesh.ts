export class GradientMesh {
  buffer: GPUBuffer;
  bufferLayout: GPUVertexBufferLayout;
  vertexCount: number;

  constructor(
    device: GPUDevice,
    screenSize: {
      width: number;
      height: number;
    }
  ) {
    // Create a square mesh that covers the entire screen
    const verticies = new Float32Array(
      screenSize.width * screenSize.height * 2
    );

    let i = 0;
    for (let y = 0; y < screenSize.height; y++) {
      for (let x = 0; x < screenSize.width; x++) {
        verticies[i++] = x;
        verticies[i++] = y;
      }
    }

    this.vertexCount = verticies.length / 2;

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
      // 4 bytes per float and 2 floats per vertex
      arrayStride: 4 * 2,
      attributes: [
        {
          shaderLocation: 0,
          format: 'float32x2',
          offset: 0,
        },
      ],
    };
  }
}
