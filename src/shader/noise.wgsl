struct Transform {
  resolution: vec2f,
}

struct Time {
  @location(0) offset: f32,
}

struct NoiseSettings {
  @location(0) frequency: f32,
  @location(1) amplitude: f32,
  @location(2) hardness: f32,
  @location(3) octaves: f32,
  @location(4) lacunarity: f32,
}

struct ColorSettings {
  primaryColor: vec3f,
  secondaryColor: vec3f,
}

@binding(0) @group(0) var<uniform> transform: Transform;

@binding(1) @group(0) var<uniform> time: Time;

@binding(2) @group(0) var<uniform> noiseSettings: NoiseSettings;

@binding(3) @group(0) var<uniform> colorSettings: ColorSettings;

struct VertexIn {
  @location(0) position : vec2f
}

struct VertexOut {
  @builtin(position) position : vec4f,
}

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> VertexOut
{
  var output : VertexOut;
  
  let pos = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(1.0, 1.0),

    vec2<f32>(-1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, 1.0)
  );

  output.position = vec4<f32> (pos[index], 0.0, 1.0);
  return output;
}

fn get_uvs(coord: vec2<f32>) -> vec2<f32> {
  var uv = coord / transform.resolution;

  uv.y = 1.0 - uv.y;

  return uv;
}

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

@fragment
fn fs_main(fragData: VertexOut) -> @location(0) vec4f
{
  var color : vec4f;

  var uv = get_uvs(fragData.position.xy);

  var lTime = sin(time.offset / 5.0) * 5.0 * noiseSettings.amplitude;
  var noise: f32 = snoise3_fractal(vec3f(uv * noiseSettings.frequency, lTime)) * noiseSettings.hardness;
  // map noise to 0-1 range
  noise = (noise + 1.0) * 0.5;

  var _color1 = colorSettings.primaryColor * 0.00392156862;
  var _color2 = colorSettings.secondaryColor * 0.00392156862;

  var mixColor = mix(_color1, _color2, noise);

  color = vec4f(mixColor, 1.0);

  return color;
}