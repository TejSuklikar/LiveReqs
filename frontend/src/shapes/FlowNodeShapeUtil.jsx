import {
  BaseBoxShapeUtil,
  HTMLContainer,
  Rectangle2d,
  DefaultColorStyle,
  DefaultFillStyle,
  DefaultDashStyle,
  DefaultSizeStyle,
  DefaultFontStyle,
  T,
  toRichText,
} from '@tldraw/editor';

// Define the shape type name
export const FLOW_NODE_TYPE = 'flowNode';

// Define the props schema
export const flowNodeProps = {
  w: T.number,
  h: T.number,
  richText: T.jsonValue,
  variant: T.literalEnum('rectangle', 'diamond', 'ellipse'),
  color: DefaultColorStyle,
  fill: DefaultFillStyle,
  dash: DefaultDashStyle,
  size: DefaultSizeStyle,
  font: DefaultFontStyle,
};

// Create the shape util class
export class FlowNodeShapeUtil extends BaseBoxShapeUtil {
  // Define the shape type
  static type = FLOW_NODE_TYPE;

  // Define the props
  static props = flowNodeProps;

  // Provide default props
  getDefaultProps() {
    return {
      w: 200,
      h: 100,
      richText: toRichText(''),
      variant: 'rectangle',
      color: 'black',
      fill: 'none',
      dash: 'solid',
      size: 'm',
      font: 'sans',
    };
  }

  // Define the geometry for the shape
  getGeometry(shape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: shape.props.fill !== 'none',
    });
  }

  // Render the shape component
  component(shape) {
    const { w, h, variant, color, fill, dash, size, richText } = shape.props;

    // Get stroke width based on size
    const strokeWidth = size === 's' ? 2 : size === 'm' ? 3 : size === 'l' ? 4 : 5;
    const fillColor = fill === 'solid' ? `var(--color-${color})` : fill === 'semi' ? `var(--color-${color}-semi)` : 'none';
    const strokeColor = `var(--color-${color})`;

    return (
      <HTMLContainer>
        <svg width={w} height={h} style={{ overflow: 'visible' }}>
          {variant === 'rectangle' && (
            <rect
              x={0}
              y={0}
              width={w}
              height={h}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={dash === 'dashed' ? '10,5' : dash === 'dotted' ? '2,2' : 'none'}
            />
          )}

          {variant === 'diamond' && (
            <path
              d={`M ${w/2} 0 L ${w} ${h/2} L ${w/2} ${h} L 0 ${h/2} Z`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={dash === 'dashed' ? '10,5' : dash === 'dotted' ? '2,2' : 'none'}
            />
          )}

          {variant === 'ellipse' && (
            <ellipse
              cx={w/2}
              cy={h/2}
              rx={w/2}
              ry={h/2}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={dash === 'dashed' ? '10,5' : dash === 'dotted' ? '2,2' : 'none'}
            />
          )}

          {/* Text rendering */}
          <foreignObject x={10} y={10} width={w - 20} height={h - 20}>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                fontSize: size === 's' ? '12px' : size === 'm' ? '16px' : '20px',
                color: fill === 'solid' ? 'white' : strokeColor,
                textAlign: 'center',
                wordWrap: 'break-word',
                overflow: 'hidden',
                pointerEvents: 'none',
                fontFamily: 'var(--tl-font-sans)',
              }}
            >
              {richText && typeof richText === 'object' && richText.text ? richText.text : ''}
            </div>
          </foreignObject>
        </svg>
      </HTMLContainer>
    );
  }

  // Render the selection indicator
  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  // Allow editing when double-clicked
  canEdit() {
    return false; // Disable editing for now to simplify
  }

  // Return true to allow binding (arrows)
  canBind() {
    return true;
  }
}
