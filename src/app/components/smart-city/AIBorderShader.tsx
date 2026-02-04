import { useEffect, useRef } from 'react';

interface AIBorderShaderProps {
  borderWidth?: number;
  animationSpeed?: number;
}

export const AIBorderShader = ({ 
  borderWidth = 2, 
  animationSpeed = 10 
}: AIBorderShaderProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const resolutionLocationRef = useRef<WebGLUniformLocation | null>(null);
  const timeLocationRef = useRef<WebGLUniformLocation | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    console.log('AIBorderShader: Canvas ref:', canvas);
    console.log('AIBorderShader: Container ref:', container);
    
    if (!canvas || !container) {
      console.warn('AIBorderShader: Missing canvas or container ref');
      return;
    }

    const gl = canvas.getContext('webgl', { 
      alpha: true, 
      antialias: true,
      premultipliedAlpha: false 
    });
    
    if (!gl) {
      console.error('AIBorderShader: WebGL not supported');
      return;
    }

    console.log('AIBorderShader: WebGL context created');
    glRef.current = gl;

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 resolution;
      uniform float time;
      uniform float borderWidth;
      
      // DGE Brand Colors
      const vec3 lightBlue = vec3(0.478, 0.643, 0.769);   // #7AA4C4
      const vec3 techBlue = vec3(0.129, 0.353, 0.620);    // #215A9E
      const vec3 reliableBlue = vec3(0.024, 0.200, 0.376); // #063360
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        vec2 center = vec2(0.5);
        
        // Calculate distance from edge
        float distFromEdge = min(
          min(uv.x, 1.0 - uv.x),
          min(uv.y, 1.0 - uv.y)
        ) * resolution.y;
        
        // Border mask
        float borderMask = smoothstep(0.0, 2.0, distFromEdge / borderWidth) * 
                          smoothstep(borderWidth + 2.0, borderWidth, distFromEdge);
        
        // Rotating gradient
        vec2 toCenter = uv - center;
        float angle = atan(toCenter.y, toCenter.x);
        float gradientPosition = fract(angle / (3.14159 * 2.0) + time * 0.05);
        
        // Color transitions
        vec3 color;
        if (gradientPosition < 0.33) {
          float t = gradientPosition / 0.33;
          color = mix(lightBlue, techBlue, smoothstep(0.0, 1.0, t));
        } else if (gradientPosition < 0.66) {
          float t = (gradientPosition - 0.33) / 0.33;
          color = mix(techBlue, reliableBlue, smoothstep(0.0, 1.0, t));
        } else {
          float t = (gradientPosition - 0.66) / 0.34;
          color = mix(reliableBlue, lightBlue, smoothstep(0.0, 1.0, t));
        }
        
        // Apply mask with subtle opacity
        float opacity = borderMask * 0.3;
        gl_FragColor = vec4(color, opacity);
      }
    `;

    // Compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Create program
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    programRef.current = program;

    // Geometry (fullscreen quad)
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const timeLocation = gl.getUniformLocation(program, 'time');
    const borderWidthLocation = gl.getUniformLocation(program, 'borderWidth');

    resolutionLocationRef.current = resolutionLocation;
    timeLocationRef.current = timeLocation;

    gl.uniform1f(borderWidthLocation, borderWidth);

    // Blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Resize with ResizeObserver
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    resizeCanvas(); // Initial size

    // Animation
    let startTime = Date.now();
    const animate = () => {
      if (!glRef.current || !timeLocationRef.current) return;
      
      const currentTime = (Date.now() - startTime) / 1000;
      gl.uniform1f(timeLocationRef.current, currentTime / animationSpeed);
      
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (program) {
        gl.deleteProgram(program);
      }
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, [borderWidth, animationSpeed]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* CSS Fallback - visible while WebGL loads or if WebGL fails */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(90deg, rgba(122,164,196,0.2) 0%, rgba(33,90,158,0.3) 50%, rgba(6,51,96,0.25) 100%)',
          padding: '2px',
        }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};