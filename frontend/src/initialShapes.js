import { toRichText } from '@tldraw/editor';

// Initial shapes that are created when the app loads
export const createInitialShapes = (app) => {
  app.createShapes([
    {
      id: 'shape:1',
      type: 'flowNode',  // Changed from 'geo' to custom 'flowNode'
      x: 50,
      y: 200,
      props: {
        w: 1000,
        h: 400,
        variant: 'rectangle',
        color: 'black',
        fill: 'solid',
        dash: 'solid',
        size: 'm',
        font: 'sans',
        richText: toRichText('Type here...'),
      },
    },
    {
      id: 'shape:2',
      type: 'text',
      x: 50,
      y: 150,
      props: {
        richText: toRichText('Description'),
        size: 'm',
        font: 'sans',
        color: 'black',
      },
    },
    {
      id: 'shape:3',
      type: 'flowNode',  // Changed from 'geo' to custom 'flowNode'
      x: 50,
      y: 1700,
      props: {
        w: 150,
        h: 50,
        variant: 'rectangle',
        color: 'blue',
        fill: 'solid',
        dash: 'solid',
        size: 'm',
        font: 'sans',
        richText: toRichText('Run All'),
      },
    },
  ]);
};