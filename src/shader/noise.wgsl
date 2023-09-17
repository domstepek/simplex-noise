struct Transform {
  @location(0) offset: f32,
}


struct NoiseSettings {
  @location(0) frequency: f32,
  @location(1) amplitude: f32,
  @location(2) hardness: f32,
  @location(3) octaves: i32,
  @location(4) lacunarity: f32,
}

@binding(0) @group(0) var<uniform> transform: Transform;

@binding(1) @group(0) var<uniform> noiseSettings: NoiseSettings;

struct VertexIn {
  @location(0) position : vec2f
}

struct VertexOut {
  @builtin(position) position : vec4f,
}

@vertex
fn vs_main(vertex: VertexIn) -> VertexOut
{
  var output : VertexOut;

  output.position = vec4f(vertex.position.xy, 0.0, 1.0);

  return output;
}

@fragment
fn fs_main(fragData: VertexOut) -> @location(0) vec4f
{
  var color : vec4f;

  var noise: f32 = sin(transform.offset * 5.0);

  color = vec4f(noiseSettings.frequency, noiseSettings.frequency, 0.0, 1.0);

  return color;
}