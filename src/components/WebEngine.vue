
<template>
  <div class="webEngineContainer">
    <canvas ref="webEngineCanvas" />
  </div>
</template>

<script>
import NoiseMap from 'noise-map';

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
    this.noiseMap.draw(
      this.provider.context,
      this.$refs.webEngineCanvas.width,
      this.$refs.webEngineCanvas.height,
      NoiseMap.STYLE.GRAY,
    );

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
  background-color: #000000;
  height: 512px;
  width: 512px;
}

h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
