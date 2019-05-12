
<template>
  <div class="webEngineContainer">
    <canvas ref="webEngineCanvas" />
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
  props: {
    img: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      // By creating the provider in the data property, it becomes reactive,
      // so child components will update when `context` changes.
      provider: {
        // This is the CanvasRenderingContext that children will draw to.
        context: null,
      },
    };
  },
  provide() {
    // Allows any child component to `inject: ['provider']` and have access to it.
    return {
      provider: this.provider,
    };
  },
  mounted() {
    // const webEngineCanvas = this.$refs.webEngineCanvas;
    // const [webEngineCanvas] = this.$refs;
    // We can't access the rendering context until the canvas is mounted to the
    // DOM. Once we have it, provide it to all child components.
    // this.provider.context = this.$refs.webEngineCanvas.getContext('2d');

    this.generator = new NoiseMap.MapGenerator(1);
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
    //   this.provider.context,
    //   this.$refs.webEngineCanvas.width,
    //   this.$refs.webEngineCanvas.height,
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
    const contours = isoLines(prepData, [64, 128, 192], {
      // successCallback: () => {},
      verbose: true,
      // polygons: true,
      // linearRing: true,
      // noQuadTree: false,
      // noFrame: false,
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000,
    );

    this.renderer = new THREE.WebGLRenderer({ canvas: this.$refs.webEngineCanvas });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    contours.forEach((contour) => {
      contour.forEach((path, pI) => {
        const path3D = new THREE.Shape();
        path.forEach((vertex, index) => {
          const nextVertex = path[index + 1];
          path3D.moveTo(vertex[0], vertex[1]);
          if (nextVertex) {
            path3D.lineTo(nextVertex[0], nextVertex[1]);
          }
        });

        const extrudeSettings = {
          amount: 8,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 2,
          bevelSize: 2,
          bevelThickness: 2,
        };
        const geometry = new THREE.ExtrudeGeometry(path3D, extrudeSettings);
        geometry.translate(0, 0, pI * 4);

        const r = pI * 4;
        const g = pI * 8;
        const b = pI * 16;
        const material = new THREE.MeshPhongMaterial({ color: `rgb(${r},${g},${b})` });

        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
      });
    });

    this.camera.position.set(200, 100, 400);

    // this.controls = new OrbitControls(this.camera);
    this.controls = new MapControls(this.camera);

    this.scene.add(new THREE.AmbientLight(0x444444));
    this.light = new THREE.PointLight(0xffffff);
    this.light.position.copy(this.camera.position);
    this.scene.add(this.light);

    const animate = () => {
      this.controls.update();
      this.light.position.copy(this.camera.position);
      this.renderer.render(this.scene, this.camera);
      window.requestAnimationFrame(animate);
    };

    this.controls.update();
    animate();

    // Resize the canvas to fit its parent's width.
    // Normally you'd use a more flexible resize system.
    // this.$refs.webEngineCanvas.width = this.$refs.webEngineCanvas.parentElement.clientWidth;
    // this.$refs.webEngineCanvas.height = this.$refs.webEngineCanvas.parentElement.clientHeight;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas {
  height: 100%;
  width: 100%;
}
</style>
