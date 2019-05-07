import 'pathseg';
import * as Matter from 'matter-js';
// import { SVGPathDataParser } from 'svg-pathdata';
import NoiseMap from 'noise-map';
import { QuadTree, isoLines } from 'marchingsquares';

function coordinateToIndex(x, y, width) {
  return (y * (width << 2)) + (x << 2);
}

export default class RandomLevel {
  constructor(world) {
    const width = 400;
    const height = 200;

    this.world = world;

    this.canvas = document.createElement('canvas');
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.centerX = width / 2;
    this.canvas.centerY = height / 2;
    this.context2D = this.canvas.getContext('2d');
    this.context2D.imageSmoothingEnabled = false;

    // https://github.com/ogus/noise-map
    this.generator = new NoiseMap.MapGenerator();
    this.noiseMap = this.generator.createMap(400, 200, {
      type: 'simplex',
      amplitude: 1,
      frequency: 0.5,
      amplitudeCoef: 0.5,
      frequencyCoef: 0.5,
      elevation: 0.5,
      step: false,
      // stepValue: 30,
    });

    // this.noiseMap.stepValues(30);

    // draw the heights in B&W
    this.noiseMap.draw(
      this.context2D,
      this.canvas.width,
      this.canvas.height,
      NoiseMap.STYLE.GRAY,
    );

    const data = [];
    const heightData = this.context2D.getImageData(0, 0, width, height);

    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(heightData.data[coordinateToIndex(x, y, width)]);
      }
      data.push(row);
    }

    const prepData = new QuadTree(data);

    const contours = isoLines(prepData, [64, 32], {
      // successCallback: () => {},
      verbose: true,
      // polygons: true,
      // linearRing: true,
      // noQuadTree: false,
      // noFrame: false,
    });

    const levelObjs = [];
    contours.map(
      contour => contour.map(
        path => Matter.Vector.create(path[0], path[1]),
      ),
    ).forEach((contour) => {
      const body = Matter.Bodies.fromVertices(0, 0, contour, { isStatic: true });
    });
    Matter.World.add(this.world, levelObjs);
    // console.log(contours);
    // isoLines.forEach((isoLine) => {
    //
    // });

  //   paths.forEach((path) => {
  //     const style = {};
  //     path.getAttribute('style').split(';').forEach((string) => {
  //       const [attr, val] = string.split(':');
  //       style[attr] = val;
  //     });
  //
  //     const vertices = Matter.Svg.pathToVertices(path);
  //
  //     Matter.Vertices.scale(vertices, 12, 12);
  //     const body = Matter.Bodies.fromVertices(
  //       vertices[0].x,
  //       vertices[0].y,
  //       vertices, {
  //         isStatic: true,
  //         render: {
  //           fillStyle: style.fill,
  //           strokeStyle: style.stroke,
  //           lineWidth: parseInt(style['stroke-width'], 10),
  //         },
  //       },
  //       true,
  //     );
  //
  //     const {
  //       min,
  //       max
  //     } = body.bounds;
  //     const centerX = (max.x - min.x) / 2;
  //     const centerY = (max.y - min.y) / 2;
  //
  //     Matter.Body.translate(body, {
  //       x: centerX,
  //       y: centerY
  //     });
  //     Matter.Body.scale(body, 2, 2);
  //
  //     levelObjs.push(body);
  //   });
  //
  //   Matter.World.add(this.world, levelObjs);
  }
}
