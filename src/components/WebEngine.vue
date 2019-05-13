
<template>
  <div class="webEngineContainer">
    <canvas ref="canvas3D" />
    <!-- <canvas ref="canvas2D" /> -->
  </div>
</template>

<script>
import * as THREE from 'three';
import NoiseMap from 'noise-map';
import { QuadTree, isoLines } from 'marchingsquares';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MapControls } from 'three/examples/jsm/controls/MapControls';

export default {
  name: 'WebEngine',
  mounted() {
    // this.canvas2D = this.$refs.canvas2D;
    // this.context2D = this.canvas2D.getContext('2d');

    this.canvas3D = this.$refs.canvas3D;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3D });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.generator = new NoiseMap.MapGenerator();
    this.noiseMap = this.generator.createMap(400, 200, {
      type: 'simplex',
      amplitude: 1,
      frequency: 0.5,
      amplitudeCoef: 0.5,
      frequencyCoef: 0.5,
      elevation: 0.5,
      step: false,
      stepValue: 30,
    });

    // this.noiseMap.stepValues(30);

    // draw the heights in B&W
    // this.noiseMap.draw(
    //   this.context2D,
    //   this.canvas2D.width,
    //   this.canvas2D.height,
    //   NoiseMap.STYLE.GRAY,
    // );
    const data = [];

    for (let y = 0; y < this.noiseMap.height; y += 1) {
      const row = [];
      for (let x = 0; x < this.noiseMap.width; x += 1) {
        row.push(this.noiseMap.get(x, y) * 255);
      }
      data.push(row);
    }

    const prepData = new QuadTree(data);
    const contours = isoLines(prepData, [160, 128, 96, 64], {
      // successCallback: () => {},
      // verbose: true,
      // polygons: true,
      // linearRing: true,
      // noQuadTree: false,
      // noFrame: false,
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000,
    );

    contours.forEach((contour, contourNumber) => {
      const r = parseInt(64 - (contourNumber * 8), 10);
      const g = parseInt(128 + (contourNumber * 8), 10);
      const b = parseInt(192 - (contourNumber * 8), 10);
      contour.forEach((path) => {
        const pathShape = new THREE.Shape();

        // this.context2D.save();
        // this.context2D.beginPath();
        // this.context2D.strokeStyle = `rgb(${r},${g},${b})`;
        path.forEach((vertex, index) => {
          pathShape.moveTo(vertex[0], vertex[1]);
          // this.context2D.moveTo(vertex[0], vertex[1]);
          const nextVertex = path[index + 1];
          if (nextVertex) {
            pathShape.lineTo(nextVertex[0], nextVertex[1]);
            // this.context2D.lineTo(nextVertex[0], nextVertex[1]);
          }
        });
        // this.context2D.stroke();
        // this.context2D.restore();

        const depth = 5;
        const geometry = new THREE.ExtrudeGeometry(pathShape, {
          depth,
          bevelEnabled: true,
          bevelSegments: 2,
          bevelSize: 2,
          bevelThickness: 1,
          steps: 2,
        });

        geometry.translate(-200, -100, contourNumber * depth);

        const material = new THREE.MeshPhongMaterial({ color: `rgb(${r},${g},${b})` });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
      });
    });

    this.camera.position.set(0, 0, 200);

    // this.controls = new OrbitControls(this.camera);
    this.controls = new MapControls(this.camera);

    this.scene.add(new THREE.AmbientLight(0x0a0a0a));

    const topLight = new THREE.PointLight(0xffeedd);
    topLight.position.set(0, 100, 20);
    this.scene.add(topLight);

    const bottomLight = new THREE.PointLight(0xff2200);
    bottomLight.position.set(0, -100, 10);
    this.scene.add(bottomLight);

    const animate = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(animate);
    };

    this.controls.update();
    animate();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas {
  height: 100vh;
  width: 100vw;
}
</style>
