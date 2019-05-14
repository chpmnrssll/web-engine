
<template>
  <div class="webEngineContainer">
    <canvas ref="canvas3D" />
    <canvas
      id="canvas2D"
      ref="canvas2D"
    />
    <section>
      <ul>
        <li>Left click + drag = move</li>
        <li>Right click + drag = rotate</li>
        <li>Scroll = zoom</li>
      </ul>
    </section>
  </div>
</template>

<script>
import * as THREE from 'three';
import NoiseMap from 'noise-map';
import { QuadTree, isoLines } from 'marchingsquares';
import { MapControls } from 'three/examples/jsm/controls/MapControls';

export default {
  name: 'WebEngine',
  mounted() {
    this.canvas2D = this.$refs.canvas2D;
    this.context2D = this.canvas2D.getContext('2d');

    this.canvas3D = this.$refs.canvas3D;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas3D });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000,
    );
    this.camera.position.set(0, 0, 200);
    this.controls = new MapControls(this.camera);

    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0x888888, 0.15));

    const topLight = new THREE.PointLight(0xffeedd, 1, 512, 2);
    topLight.position.set(0, 128, 32);
    this.scene.add(topLight);

    const bottomLight = new THREE.PointLight(0xff2200, 1, 1024, 1);
    bottomLight.position.set(0, -128, 32);
    this.scene.add(bottomLight);

    this.generateMap();

    this.controls.update();
    this.animate();
  },
  methods: {
    generateMap() {
      this.mapGenerator = new NoiseMap.MapGenerator();
      this.noiseMap = this.mapGenerator.createMap(400, 200, {
        type: 'simplex',
        amplitude: 1,
        frequency: 0.5,
        amplitudeCoef: 0.5,
        frequencyCoef: 0.5,
        elevation: 0.5,
        step: false,
        stepValue: 30,
      });

      // this.context2D.filter = 'invert(100%)';
      // draw the heightMap on context2D
      this.noiseMap.draw(
        this.context2D,
        this.canvas2D.width,
        this.canvas2D.height,
        NoiseMap.STYLE.GRAY,
      );
      // this.context2D.filter = 'none';

      const quadTree = this.convertNoiseMapToQuadTree();
      const contours = isoLines(quadTree, [160, 128, 96, 64], {
        // successCallback: () => {},
        // verbose: true,
        // polygons: true,
        // linearRing: true,
        // noQuadTree: false,
        // noFrame: false,
      });

      contours.forEach((contour, contourNumber) => {
        const r = parseInt(64 - (contourNumber * 8), 10);
        const g = parseInt(128 + (contourNumber * 8), 10);
        const b = parseInt(192 - (contourNumber * 8), 10);

        contour.forEach((path) => {
          const pathShape = this.convertPathToShape(path);
          this.drawPathOnContext2D(path, r, g, b);

          const depth = 5;
          const geometry = new THREE.ExtrudeGeometry(pathShape, {
            depth,
            bevelEnabled: true,
            bevelSegments: 2,
            bevelSize: 2,
            bevelThickness: 1,
            steps: 2,
          });

          // center on x & y, z increases with each layer
          geometry.translate(-200, 100, contourNumber * depth);

          const material = new THREE.MeshPhongMaterial({ color: `rgb(${r},${g},${b})` });
          const mesh = new THREE.Mesh(geometry, material);
          this.scene.add(mesh);
        });
      });
    },
    animate() {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(this.animate.bind(this));
    },
    convertNoiseMapToQuadTree() {
      const data = [];
      for (let y = 0; y < this.noiseMap.height; y += 1) {
        const row = [];
        for (let x = 0; x < this.noiseMap.width; x += 1) {
          row.push(this.noiseMap.get(x, y) * 255);
        }
        data.push(row);
      }

      return new QuadTree(data);
    },
    convertPathToShape(path) {
      const pathShape = new THREE.Shape();

      path.forEach((vertex, index) => {
        pathShape.moveTo(vertex[0], -vertex[1]);
        const nextVertex = path[index + 1];
        if (nextVertex) {
          pathShape.lineTo(nextVertex[0], -nextVertex[1]);
        }
      });

      return pathShape;
    },
    drawPathOnContext2D(path, r, g, b) {
      this.context2D.save();
      this.context2D.beginPath();
      this.context2D.strokeStyle = `rgb(${r},${g},${b})`;

      path.forEach((vertex, index) => {
        this.context2D.moveTo(vertex[0], vertex[1]);
        const nextVertex = path[index + 1];
        if (nextVertex) {
          this.context2D.lineTo(nextVertex[0], nextVertex[1]);
        }
      });
      this.context2D.closePath();
      this.context2D.stroke();
      this.context2D.restore();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas {
  height: 100vh;
  width: 100vw;
}
#canvas2D {
  bottom: 1rem;
  height: 33vh;
  opacity: 0.75;
  position: absolute;
  right: 1rem;
  width: 33vw;
}
section {
  bottom: 1rem;
  color: white;
  font-size: 0.5rem;
  left: 1rem;
  list-style-type: none;
  position: absolute;
}
</style>
