import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const colors = { github: 0xb54d3f, drive: 0x306579, signal: 0xc79b49, local: 0xe8dac0 };

export function Brain3D({ graph, onSelect }) {
  const mount = useRef(null);
  useEffect(() => {
    const host = mount.current;
    if (!host || !graph.nodes.length) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x102e38);
    scene.fog = new THREE.FogExp2(0x102e38, 0.016);
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 3, 13);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !reduced;
    controls.autoRotate = !reduced;
    controls.autoRotateSpeed = 0.35;
    controls.minDistance = 5;
    controls.maxDistance = 24;
    controls.enablePan = true;
    const light = new THREE.AmbientLight(0xffffff, 2.1);
    scene.add(light);
    const point = new THREE.PointLight(0xd9ad68, 70);
    point.position.set(5, 4, 7);
    scene.add(point);
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    const pickable = [];
    for (const node of graph.nodes) {
      const geometry = new THREE.SphereGeometry(0.105, 12, 8);
      const material = new THREE.MeshStandardMaterial({ color: colors[node.source] || colors.local, roughness: 0.42, emissive: colors[node.source] || colors.local, emissiveIntensity: 0.11 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...node.position);
      mesh.userData.node = node;
      pickable.push(mesh);
      scene.add(mesh);
    }
    for (const edge of graph.edges) {
      const a = byId.get(edge.source);
      const b = byId.get(edge.target);
      if (!a || !b) continue;
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a.position), new THREE.Vector3(...b.position)]);
      const material = new THREE.LineBasicMaterial({ color: 0xa6b7ac, transparent: true, opacity: Math.min(0.45, edge.score * 0.38) });
      scene.add(new THREE.Line(geometry, material));
    }
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pick = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickable, false)[0];
      if (hit) onSelect(hit.object.userData.node);
    };
    renderer.domElement.addEventListener('click', pick);
    let frame = 0;
    const render = () => { controls.update(); renderer.render(scene, camera); if (!reduced) frame = requestAnimationFrame(render); };
    const resize = () => { const width = Math.max(host.clientWidth, 1); const height = Math.max(host.clientHeight, 1); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); if (reduced) render(); };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    if (reduced) controls.addEventListener('change', render);
    resize();
    if (!reduced) render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener('click', pick);
      controls.dispose();
      scene.traverse((object) => { object.geometry?.dispose(); if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose()); else object.material?.dispose(); });
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [graph, onSelect]);
  return <div className="brain-canvas" ref={mount} role="img" aria-label={`${graph.nodes.length} knowledge nodes and ${graph.edges.length} lexical similarity connections. Use the accessible node list below to inspect a record.`} />;
}
