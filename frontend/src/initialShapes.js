// Initial shapes that are created when the app loads
export const createInitialShapes = (app) => {
  app.createShapes([
    {
      id: 'shape:1',
      type: 'geo',
      x: 50,          // ← MOVED LEFT (was 300)
      y: 200,
      props: {
        w: 1000,       // ← MADE REASONABLE SIZE (was 5000!)
        h: 400,       // ← MADE REASONABLE SIZE (was 2000!)
        geo: 'rectangle',
        color: 'black',
        fill: 'solid',
        dash: 'solid',
        size: 'm',
        font: 'sans',
        text: 'Type here...',
        align: 'middle',
        verticalAlign: 'middle',
      },
    },
    {
      id: 'shape:2',
      type: 'text',
      x: 50,          // ← MOVED LEFT TO ALIGN (was 300)
      y: 150,
      props: {
        text: 'Description',
        size: 'm',
        font: 'sans',
        color: 'black',
      },
    },
    {
      id: 'shape:3',
      type: 'geo',
      x: 50,          // ← MOVED LEFT (was 460)
      y: 1700,         // ← MOVED BELOW DESCRIPTION BOX (was 150)
      props: {
        w: 150,       // ← MADE WIDER (was 50)
        h: 50,        // ← MADE TALLER (was 30)
        geo: 'rectangle',
        color: 'blue',
        fill: 'solid',
        dash: 'solid',
        size: 'm',
        font: 'sans',
        text: 'Run All', // ← CHANGED TEXT (was 'Go')
        align: 'middle',
        verticalAlign: 'middle',
      },
    },
  ]);
};