// Initial shapes that are created when the app loads
export const createInitialShapes = (app) => {
  app.createShapes([
    {
      id: 'shape:1',
      type: 'geo',
      x: 300,
      y: 200,
      props: {
        w: 5000,
        h: 2000,
        geo: 'rectangle',
        color: 'black',
        fill: 'solid',
        dash: 'draw',
        size: 'm',
        font: 'draw',
        text: 'Type here...',
        align: 'middle',
        verticalAlign: 'middle',
      },
    },
    {
      id: 'shape:2',
      type: 'text',
      x: 300,
      y: 150,
      props: {
        text: 'Description',
        size: 'm',
        font: 'draw',
        color: 'black',
      },
    },
    {
      id: 'shape:3',
      type: 'geo',
      x: 460,
      y: 150,
      props: {
        w: 50,
        h: 30,
        geo: 'rectangle',
        color: 'blue',
        fill: 'solid',
        dash: 'draw',
        size: 'm',
        font: 'draw',
        text: 'Go',
        align: 'middle',
        verticalAlign: 'middle',
      },
    },
  ]);
};
