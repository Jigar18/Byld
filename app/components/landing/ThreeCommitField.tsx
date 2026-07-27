"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeCommitField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const shell = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.35, 2)),
      new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.13,
      }),
    );
    shell.rotation.set(0.35, -0.5, 0.1);
    scene.add(shell);

    const pointCount = 190;
    const positions = new Float32Array(pointCount * 3);
    for (let index = 0; index < pointCount; index += 1) {
      const angle = index * 2.399963;
      const radius = 1.45 + ((index * 37) % 100) / 78;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] =
        Math.sin(angle * 0.73) * 2.05 + ((index % 7) - 3) * 0.08;
      positions[index * 3 + 2] = Math.sin(angle) * radius * 0.62;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0x67e8f9,
        size: 0.035,
        transparent: true,
        opacity: 0.65,
      }),
    );
    scene.add(points);

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };

    const cursor = new THREE.Vector2();
    const updateCursor = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      cursor.x = (event.clientX - bounds.left) / bounds.width - 0.5;
      cursor.y = (event.clientY - bounds.top) / bounds.height - 0.5;
    };

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let frame = 0;
    const render = () => {
      shell.rotation.y += reducedMotion ? 0 : 0.0018;
      points.rotation.y -= reducedMotion ? 0 : 0.0009;
      shell.rotation.x += (cursor.y * 0.22 - shell.rotation.x) * 0.025;
      shell.position.x += (cursor.x * 0.28 - shell.position.x) * 0.025;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    mount.addEventListener("pointermove", updateCursor);
    resize();
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mount.removeEventListener("pointermove", updateCursor);
      geometry.dispose();
      shell.geometry.dispose();
      (shell.material as THREE.Material).dispose();
      (points.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      aria-hidden="true"
    />
  );
}
