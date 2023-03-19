export const svg = (
  data: string,
  options?: {
    color?: string;
    size?: number;
    css?: string;
    className?: string;
  }
) => {
  const defaultOptions = {
    color: "000000",
    size: 24,
    css: "",
    className: "",
  };
  Object.assign(defaultOptions, options);
  const { color, size, css, className } = defaultOptions;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.toString()} ${size.toString()}">${svgStyle(
    data,
    { color, className, css }
  )}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.toString()} ${size.toString()}"><style>${css}</style><g color="${color}" class="${className}">${data}</g></svg>`;
};

export const svgStyle = (
  data: string,
  options?: {
    color?: string;
    css?: string;
    className?: string;
  }
) => {
  const defaultOptions = {
    color: "000000",
    css: "",
    className: "",
  };
  Object.assign(defaultOptions, options);
  const { color, css, className } = defaultOptions;
  return `<g color="${color}" class="${className}"><style>${css}</style>${data}</g>`;
};

export const svgImage = (props: {
  data: string;
  width?: string;
  height?: string;
}) => (
  <img
    src={svgData(props.data)}
    width="22"
    height="22"
    style={`width: ${props.width || "1em"}; height: ${
      props.height || props.width || "1em"
    }`}
  />
);

export const svgData = (
  data: string,
  options?: {
    color?: string;
    size?: number;
    css?: string;
    className?: string;
  }
) => {
  return `data:image/svg+xml,${encodeURIComponent(svg(data, options))}`;
};
