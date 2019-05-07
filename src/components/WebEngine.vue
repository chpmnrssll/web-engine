
<template>
  <div class="webEngineContainer">
    <canvas ref="webEngineCanvas" />
  </div>
</template>

<script>
import NoiseMap from 'noise-map';
import { QuadTree, isoLines } from 'marchingsquares';

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
    this.provider.context = this.$refs.webEngineCanvas.getContext('2d');

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
    this.noiseMap.draw(
      this.provider.context,
      this.$refs.webEngineCanvas.width,
      this.$refs.webEngineCanvas.height,
      NoiseMap.STYLE.GRAY,
    );
    const data = [];

    for (let y = 0; y < this.noiseMap.height; y += 1) {
      const row = [];
      for (let x = 0; x < this.noiseMap.width; x += 1) {
        row.push(this.noiseMap.get(x, y) * 255);
      }
      data.push(row);
    }

    const prepData = new QuadTree(data);
    const contours = isoLines(prepData, [64, 96, 128, 160, 192, 240], {
      // successCallback: () => {},
      verbose: true,
      // polygons: true,
      // linearRing: true,
      // noQuadTree: false,
      // noFrame: false,
    });


    contours.forEach((contour, ccount) => {
      contour.forEach((path, pcount) => {
        this.provider.context.beginPath();
        path.forEach((vertex, index) => {
          // this.provider.context.ellipse(vertex[0], vertex[1], 1, 1, Math.PI / 4, 0, 2 * Math.PI);
          const nextVertex = path[index + 1];
          this.provider.context.moveTo(vertex[0], vertex[1]);
          if (nextVertex) {
            this.provider.context.lineTo(nextVertex[0], nextVertex[1]);
          }
        });
        const b = ccount * 16;
        const g = b + ccount * 24;
        const r = g + ccount * 32;
        this.provider.context.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        // this.provider.context.fill();
        this.provider.context.stroke();
      });
    });


    // console.log(contours);

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
