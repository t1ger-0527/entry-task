import { h } from '../../framework'

export default ({ size, width, height, topOffset, ...props }) => {
  width = width || size
  height = height || size
  return (
    <img
      {...props}
      alt={`icon ${name}`}
      width={width}
      height={height}
      style={{ verticalAlign: topOffset != null ? `${topOffset}px` : 'middle' }}
    />
  )
}
