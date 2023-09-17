struct VertexOut {
  @builtin(position) position : vec4f,
  @location(0) color : vec4f
}

@vertex
fn vs_main(@location(0) vertexPosition: vec2f, @location(1) vertexColor: vec3f) -> VertexOut
{
  var output : VertexOut;

  output.position = vec4f(vertexPosition, 0.0, 1.0);
  output.color = vec4f(vertexColor, 1.0);
  return output;
}

@fragment
fn fs_main(fragData: VertexOut) -> @location(0) vec4f
{
  return fragData.color;
}