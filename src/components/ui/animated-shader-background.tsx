import React, { useEffect, useRef, memo } from 'react';
import * as THREE from 'three';

interface AnimatedShaderBackgroundProps {
  className?: string;
}

const AnimatedShaderBackground = memo(({ className }: AnimatedShaderBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Helper to get color from CSS variable
    const getThemeColor = (variable: string) => {
      const style = getComputedStyle(document.documentElement);
      const colorStr = style.getPropertyValue(variable).trim();
      if (!colorStr) return new THREE.Color(0xf97316); // Default sunshine fallback
      
      // Parse HSL "142 70% 45%"
      const parts = colorStr.split(' ');
      if (parts.length === 3) {
        const h = parseInt(parts[0]!, 10) / 360;
        const s = parseInt(parts[1]!, 10) / 100;
        const l = parseInt(parts[2]!, 10) / 100;
        return new THREE.Color().setHSL(h, s, l);
      }
      return new THREE.Color(0xf97316);
    };

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uPrimary: { value: getThemeColor('--primary') },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float iTime;
        uniform vec2 iResolution;
        uniform vec2 uMouse;
        uniform vec3 uPrimary;

        float ripple(vec2 p, vec2 m) {
          float d = distance(p, m);
          return sin(d * 8.0 - iTime * 1.8) * exp(-d * 2.0);
        }

        float wave(vec2 p) {
          return
            sin(p.x * 1.2 + iTime * 1.2) +
            sin(p.y * 1.4 - iTime * 1.1) +
            sin((p.x + p.y) * 0.8 + iTime * 0.9);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          vec2 p = uv * 5.0;
          
          float base = wave(p) * 0.5;
          float mouseEffect = ripple(uv, uMouse) * 0.6;
          
          float intensity = smoothstep(-1.5, 1.5, base + mouseEffect);
          
          // Darkened even more as requested
          vec3 baseWhite = vec3(1.0);
          vec3 color = mix(
            baseWhite * 0.8,     // Deeper light base
            uPrimary * 0.65,     // Deeper theme primary edges
            intensity
          );
          
          gl_FragColor = vec4(color, 0.72); 
        }
      `,
      transparent: true
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let frameId: number;
    const mouse = new THREE.Vector2(0.5, 0.5);
    const targetMouse = new THREE.Vector2(0.5, 0.5);

    const animate = () => {
      material.uniforms['iTime']!.value += 0.04; // Increased speed from 0.02 to 0.04
      
      // Update colors periodically to react to theme changes
      // This is efficient enough for a background shader
      if (Math.floor(material.uniforms['iTime']!.value * 10) % 5 === 0) {
        material.uniforms['uPrimary']!.value.copy(getThemeColor('--primary'));
      }

      mouse.lerp(targetMouse, 0.05);
      material.uniforms['uMouse']!.value.copy(mouse);
      
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms['iResolution']!.value.set(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      targetMouse.set(
        event.clientX / window.innerWidth,
        1.0 - (event.clientY / window.innerHeight)
      );
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 pointer-events-none ${className || ''}`}
      style={{ zIndex: 0 }}
    />
  );
});

AnimatedShaderBackground.displayName = "AnimatedShaderBackground";

export default AnimatedShaderBackground;
