import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function material(color, roughness = 0.58, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function addMesh(parent, geometry, surface, position, scale) {
  const mesh = new THREE.Mesh(geometry, surface);
  mesh.position.set(...position);
  if (scale) mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeFanPanel(innerRadius, outerRadius, startAngle, endAngle) {
  const shape = new THREE.Shape();
  shape.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
  shape.lineTo(Math.cos(startAngle) * outerRadius, Math.sin(startAngle) * outerRadius);
  shape.quadraticCurveTo(0, outerRadius * 1.12, Math.cos(endAngle) * outerRadius, Math.sin(endAngle) * outerRadius);
  shape.lineTo(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius);
  shape.quadraticCurveTo(0, innerRadius * 0.92, Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025 });
}

function makePerformer() {
  const group = new THREE.Group();
  const red = material('#bd302b');
  const deepRed = material('#7c2028');
  const green = material('#279b50');
  const darkGreen = material('#14573a');
  const ivory = material('#fff0cf', 0.38);
  const gold = material('#e6b83f', 0.3, 0.35);
  const black = material('#171916', 0.35);
  const white = material('#fffdf4', 0.3);

  addMesh(group, new THREE.CylinderGeometry(0.28, 0.57, 0.72, 20, 1), red, [0, -0.24, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.34, 0.52, 0.1, 24), gold, [0, -0.52, 0.015]);
  addMesh(group, new THREE.CylinderGeometry(0.3, 0.46, 0.08, 24), darkGreen, [0, -0.42, 0.02]);
  addMesh(group, new THREE.TorusGeometry(0.35, 0.035, 8, 28), gold, [0, 0.08, 0]);
  addMesh(group, new THREE.SphereGeometry(0.13, 16, 12), green, [0, 0.27, 0]);

  const head = new THREE.Group();
  head.position.set(0, 0.78, 0.02);
  group.add(head);
  addMesh(head, new THREE.SphereGeometry(0.49, 28, 22), ivory, [0, 0, 0], [0.85, 1.08, 0.48]);
  addMesh(head, new THREE.SphereGeometry(0.38, 28, 22), green, [0, -0.015, 0.19], [0.92, 1.02, 0.58]);
  addMesh(head, new THREE.SphereGeometry(0.115, 16, 12), red, [0, -0.29, 0.43], [1, 0.44, 0.35]);
  addMesh(head, new THREE.SphereGeometry(0.045, 12, 8), ivory, [0, -0.33, 0.46], [1, 0.45, 0.3]);

  for (const side of [-1, 1]) {
    addMesh(head, new THREE.SphereGeometry(0.09, 16, 12), ivory, [side * 0.3, -0.02, 0.4], [0.84, 1.15, 0.5]);
    addMesh(head, new THREE.SphereGeometry(0.085, 16, 12), white, [side * 0.145, 0.08, 0.47], [1.05, 0.72, 0.45]);
    addMesh(head, new THREE.SphereGeometry(0.041, 12, 8), black, [side * 0.14, 0.08, 0.51], [0.78, 1, 0.65]);
    addMesh(head, new THREE.SphereGeometry(0.027, 10, 8), white, [side * 0.15, 0.095, 0.533]);
    addMesh(head, new THREE.SphereGeometry(0.045, 12, 8), gold, [side * 0.39, -0.04, 0.21], [0.8, 1.2, 0.8]);
    const brow = addMesh(head, new THREE.TorusGeometry(0.11, 0.018, 6, 16, Math.PI), black, [side * 0.15, 0.2, 0.45], [1, 0.4, 1]);
    brow.rotation.z = side * -0.08;
  }

  addMesh(head, new THREE.SphereGeometry(0.09, 12, 10), red, [0, 0.31, 0.14], [0.48, 0.56, 0.45]);
  addMesh(head, new THREE.SphereGeometry(0.035, 10, 8), gold, [0, 0.34, 0.19]);
  addMesh(head, new THREE.SphereGeometry(0.06, 12, 8), green, [0, -0.105, 0.47], [0.36, 0.75, 0.45]);

  const fanColors = [deepRed, red, ivory, gold, ivory, red, deepRed];
  const panelCount = fanColors.length;
  const fanCenterY = 0.39;
  for (let index = 0; index < panelCount; index += 1) {
    const start = Math.PI * (0.09 + index * 0.82 / panelCount);
    const end = Math.PI * (0.09 + (index + 1) * 0.82 / panelCount);
    const panel = addMesh(head, makeFanPanel(0.39, 0.98, start, end), fanColors[index], [0, fanCenterY, -0.2]);
    panel.rotation.x = -0.04;
  }
  addMesh(head, new THREE.TorusGeometry(0.58, 0.035, 8, 32, Math.PI * 0.82), gold, [0, fanCenterY, -0.1]);
  addMesh(head, new THREE.SphereGeometry(0.095, 16, 12), gold, [0, fanCenterY + 0.58, -0.05], [0.75, 1.15, 0.75]);

  const raisedArm = new THREE.Group();
  raisedArm.position.set(0.28, 0.03, 0.05);
  group.add(raisedArm);
  const arm = addMesh(raisedArm, new THREE.CapsuleGeometry(0.075, 0.32, 4, 8), red, [0.08, 0.16, 0]);
  arm.rotation.z = -0.48;
  addMesh(raisedArm, new THREE.SphereGeometry(0.09, 12, 10), green, [0.18, 0.34, 0.03]);
  addMesh(raisedArm, new THREE.SphereGeometry(0.045, 10, 8), gold, [0.02, -0.02, 0.02]);

  const otherArm = new THREE.Group();
  otherArm.position.set(-0.28, 0.03, 0.05);
  group.add(otherArm);
  const restingArm = addMesh(otherArm, new THREE.CapsuleGeometry(0.07, 0.3, 4, 8), red, [-0.12, -0.1, 0]);
  restingArm.rotation.z = 0.65;
  addMesh(otherArm, new THREE.SphereGeometry(0.08, 12, 10), green, [-0.23, -0.25, 0.03]);

  const costumeDetails = new THREE.Group();
  costumeDetails.position.set(0, -0.24, 0.49);
  group.add(costumeDetails);
  for (let index = 0; index < 7; index += 1) {
    const angle = (index / 7) * Math.PI * 2;
    addMesh(costumeDetails, new THREE.SphereGeometry(0.035, 10, 8), gold, [Math.cos(angle) * 0.38, Math.sin(angle) * 0.12, 0]);
  }

  return { group, head, raisedArm, materials: [red, deepRed, green, darkGreen, ivory, gold, black, white] };
}

export default function KathakaliMiniature() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.7, 1.7, 1.95, -1.95, 0.1, 30);
    camera.position.set(0, 0.12, 7);
    camera.lookAt(0, 0.12, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight('#fff3d7', '#17432e', 2.1));
    const keyLight = new THREE.DirectionalLight('#fff0c4', 3.3);
    keyLight.position.set(-3, 4, 5);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight('#b1d8ff', 1.1);
    fillLight.position.set(3, 1, 2);
    scene.add(fillLight);

    const stage = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 0.18, 48), material('#d3a83d', 0.28, 0.35));
    stage.position.set(0, -1.36, 0);
    stage.castShadow = true;
    stage.receiveShadow = true;
    scene.add(stage);
    const stageTop = new THREE.Mesh(new THREE.CylinderGeometry(1.23, 1.3, 0.08, 48), material('#552d24', 0.68));
    stageTop.position.set(0, -1.23, 0);
    scene.add(stageTop);

    const performer = makePerformer();
    performer.group.position.y = -0.04;
    performer.group.scale.setScalar(0.86);
    scene.add(performer.group);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animationStart = performance.now();
    let frameId;
    const render = () => {
      const time = (performance.now() - animationStart) / 1000;
      if (!reducedMotion) {
        performer.group.position.y = -0.04 + Math.sin(time * 1.25) * 0.035;
        performer.head.rotation.z = Math.sin(time * 0.8) * 0.035;
        performer.raisedArm.rotation.z = Math.sin(time * 1.7) * 0.11;
      }
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(() => {
      renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    });
    resizeObserver.observe(mount);
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(surface => surface.dispose());
        }
      });
      performer.materials.forEach(surface => surface.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <span className="kathakali-stage" aria-hidden="true"><span className="kathakali-canvas" ref={mountRef} /></span>;
}