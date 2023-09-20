struct ProjectionValues {
  fov: f32,
  aspect: f32,
  near: f32,
  far: f32,
}

struct ModelValues {
  position: vec3f,
  rotation: vec3f,
  scale: vec3f,
}

struct ViewValues {
  eye: vec3f,
  center: vec3f,
  up: vec3f,
}

struct Transform {
  resolution: vec2f,
  @align(16) projection: ProjectionValues,
  model: ModelValues,
  view: ViewValues,
}

struct Time {
  offset: f32,
}

struct NoiseSettings {
  frequency: f32,
  amplitude: f32,
  roughness: f32,
  octaves: f32,
  lacunarity: f32,
}

struct ColorSettings {
  primaryColor: vec3f,
  secondaryColor: vec3f,
}

struct ClampSettings {
  clamp: i32,
}

@binding(0) @group(0) var<uniform> transform: Transform;

@binding(1) @group(0) var<uniform> time: Time;

@binding(2) @group(0) var<uniform> noiseSettings: NoiseSettings;

@binding(3) @group(0) var<uniform> colorSettings: ColorSettings;

@binding(4) @group(0) var<uniform> clampSettings: ClampSettings;

fn permute(x: vec4f) -> vec4f {
  return ((x * 34.0) + 1.0) * x % 289.0;
}

fn taylorInvSqrt(r: vec4f) -> vec4f {
  return 1.79284291400159 - 0.85373472095314 * r;
}

fn snoise(v: vec3f) -> f32 {
  var C = vec2f(1.0/6.0, 1.0/3.0) ;
  var D = vec4f(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, C.yyy) );
  var x0 = v - i + dot(i, C.xxx);

  // Other corners
  var g = step(x0.yzx, x0.xyz);
  var l = 1.0 - g;
  var i1 = min( g.xyz, l.zxy );
  var i2 = max( g.xyz, l.zxy );

  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - i2 + 2.0 * C.xx ;
  // x3 = x0 - 1.0 + 3.0 * C.xx ;

  var x1 = x0 - i1 + 1.0 * C.xxx;
  var x2 = x0 - i2 + 2.0 * C.xxx;
  var x3 = x0 - 1.0 + 3.0 * C.xxx;

  // Permutations
  i = i % 289.0;
  var p = permute( permute( permute( 
    i.z + vec4f(0.0, i1.z, i2.z, 1.0 ))
  + i.y + vec4f(0.0, i1.y, i2.y, 1.0 )) 
  + i.x + vec4f(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
  var n_ = 1.0/7.0; // N=7
  var ns = n_ * D.wyz - D.xzx;

  var j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  var x_ = floor(j * ns.z);
  var y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  var x = x_ *ns.x + ns.yyyy;
  var y = y_ *ns.x + ns.yyyy;
  var h = 1.0 - abs(x) - abs(y);

  var b0 = vec4f( x.xy, y.xy );
  var b1 = vec4f( x.zw, y.zw );

  var s0 = floor(b0)*2.0 + 1.0;
  var s1 = floor(b1)*2.0 + 1.0;
  var sh = -step(h, vec4f(0.0));

  var a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  var a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  var p0 = vec3f(a0.xy,h.x);
  var p1 = vec3f(a0.zw,h.y);
  var p2 = vec3f(a1.xy,h.z);
  var p3 = vec3f(a1.zw,h.w);

  //Normalise gradients
  var norm = taylorInvSqrt(vec4f(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  var m_ = 0.6 - vec4f(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3));
  var m = max(m_, vec4f(0.0));
  m = m * m;
  return 42.0 * dot( m*m, vec4f( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

fn snoise3_fractal(v: vec3f) -> f32 {
  var f = 0.0;

  for (var i = 0.0; i < noiseSettings.octaves; i += 1.0) {
    var scale = pow(noiseSettings.lacunarity, i);
    var gain = pow(0.5, i);
    f += gain * snoise(v * scale);
  }

  return f;
}

fn map(value: f32, low1: f32, high1: f32, low2: f32, high2: f32) -> f32 {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

fn projectionMatrix(
  fov: f32,
  aspect: f32,
  near: f32,
  far: f32
) -> mat4x4f {
  var top = tan(fov * 0.5) * near;
  var bottom = -top;
  var right = top * aspect;
  var left = -right;

  var x = (2.0 * near) / (right - left);
  var y = (2.0 * near) / (top - bottom);
  var a = (right + left) / (right - left);
  var b = (top + bottom) / (top - bottom);
  var c = -(far + near) / (far - near);
  var d = -(2.0 * far * near) / (far - near);

  return mat4x4f(
    vec4f(x, 0.0, 0.0, 0.0),
    vec4f(0.0, y, 0.0, 0.0),
    vec4f(a, b, c, -1.0),
    vec4f(0.0, 0.0, d, 0.0)
  );
}

fn modelMatrix(
  position: vec3f,
  rotation: vec3f,
  scale: vec3f
) -> mat4x4f {
  var x = rotation.x;
  var y = rotation.y;
  var z = rotation.z;

  var a = cos(x);
  var b = sin(x);
  var c = cos(y);
  var d = sin(y);
  var e = cos(z);
  var f = sin(z);

  var ac = a * c;
  var bc = b * c;

  return mat4x4f(
    vec4f(c * e, -c * f, d, 0.0),
    vec4f(bc * e + a * f, -bc * f + a * e, -b * d, 0.0),
    vec4f(-ac * e + b * f, ac * f + b * e, a * d, 0.0),
    vec4f(position.x, position.y, position.z, 1.0)
  );
}

fn lookAtMatrix(
  eye: vec3f,
  center: vec3f,
  up: vec3f
) -> mat4x4f {
  var z = normalize(eye - center);
  var x = normalize(cross(up, z));
  var y = normalize(cross(z, x));

  return mat4x4f(
    vec4f(x.x, y.x, z.x, 0.0),
    vec4f(x.y, y.y, z.y, 0.0),
    vec4f(x.z, y.z, z.z, 0.0),
    vec4f(-dot(x, eye), -dot(y, eye), -dot(z, eye), 1.0)
  );
}

fn get_uvs(coord: vec3f) -> vec4f {
  // var t_v = map(time.offset / 20., 0., 1., 0., 360.);

  var fov = 90.;
  var aspect = 1.;
  var near = 0.1;
  var far = 100.;

  var position = transform.model.position;
  var rotation = transform.model.rotation;
  var scale = vec3f(vec2f(1., 1.) * 100., 1.);

  var eye = transform.view.eye;
  var center = vec3f(0., 0., 0.);
  var up = vec3f(0., 1., 0.);

  // var projection = projectionMatrix(fov, aspect, near, far);
  // var projection = projectionMatrix(transform.projection.fov, transform.projection.aspect, transform.projection.near, transform.projection.far);
  var projection = projectionMatrix(fov, aspect, near, 100.);
  var model = modelMatrix(position, rotation, scale);
  var view = lookAtMatrix(eye, center, up);

  var uv = vec4f(coord, 1.);

  uv = projection * view * model * uv;

  return uv;
}

fn get_height_displacement(xyPosition: vec2f) -> f32 {
  var noise = snoise3_fractal(vec3f(xyPosition / noiseSettings.frequency, time.offset * noiseSettings.frequency));
  var displacement = noise * noiseSettings.amplitude;
  return displacement;
}

struct VertexIn {
  position: vec2f,
}

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
}

@vertex
fn vs_main(@location(0) position: vec2f) -> VertexOut {
  /*
    This shader will displace the plane mesh like a wave. The wave works as follows:
    - At (x,y) where y is 1 or -1, the vertex will be displaced along the z-axis according to the noise function
    - At (x,y) where y is between -1 and 1, the vertex will be displaced along the z-axis according to a value that is smoothly interpolated between (x,1) and (x,-1)
    - The color of the vertex will be based on the displacement, smoothly interpolating between the primary and secondary color
  */
   
  var output: VertexOut;

  output.position = vec4f(position, 0., 1.);

  var displacement: f32 = 0.;
  if (output.position.y == 1. || output.position.y == -1.) {
    displacement = get_height_displacement(output.position.xy);
  } else {
    var displacement_y0 = get_height_displacement(vec2f(output.position.x, 1.));
    var displacement_y1 = get_height_displacement(vec2f(output.position.x, -1.));

    // interpolate between the two displacements
    var t = map(output.position.y, -1., 1., 0., 1.);
    displacement = mix(displacement_y0, displacement_y1, t) * noiseSettings.roughness;
  }

  // apply displacement
  output.position.z += displacement;

  // color based on displacement
  var _primaryColor = colorSettings.primaryColor / 255.;
  // var _primaryColor = vec3f(0.0, 0.0, 0.0);
  var _secondaryColor = colorSettings.secondaryColor / 255.;
  // var _secondaryColor = vec3f(1.0, 1.0, 1.0);
  var color = mix(_primaryColor, _secondaryColor, map(displacement, -1., 1., 0., 1.));
  output.color = vec4f(color, 1.);


  // apply projection
  output.position = get_uvs(output.position.xyz);

  return output;
}

@fragment
fn fs_main(input: VertexOut) -> @location(0) vec4f
{
  return input.color;
}
