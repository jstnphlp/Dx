export type LiquidGlassProfile = "lens" | "smooth";

export interface LiquidGlassSpecular {
  intensity: number;
  shininess: number;
  lightDir: [number, number, number];
}

export interface LiquidGlassOptions {
  bezelWidth: number;
  depth: number;
  ior: number;
  profile: LiquidGlassProfile;
  blur: number;
  saturation: number;
  tint: string;
  specular: LiquidGlassSpecular;
  scale: number;
}

const defaults: LiquidGlassOptions = {
  bezelWidth: 18,
  depth: 14,
  ior: 1.45,
  profile: "lens",
  blur: 1.4,
  saturation: 1.22,
  tint: "rgba(255,252,249,.24)",
  specular: { intensity: 0.58, shininess: 28, lightDir: [-0.45, -0.72, 0.52] },
  scale: 1,
};

let uid = 0;
let svgRoot: SVGSVGElement | null = null;
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
function norm3(x: number, y: number, z: number): [number, number, number] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}
function ensureSvgRoot() {
  if (svgRoot && document.contains(svgRoot)) return svgRoot;
  const namespace = "http://www.w3.org/2000/svg";
  svgRoot = document.createElementNS(namespace, "svg");
  svgRoot.setAttribute("width", "0");
  svgRoot.setAttribute("height", "0");
  svgRoot.style.cssText =
    "position:fixed;left:-9999px;top:-9999px;pointer-events:none";
  svgRoot.appendChild(document.createElementNS(namespace, "defs"));
  document.body.appendChild(svgRoot);
  return svgRoot;
}
type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: { brands?: Array<{ brand: string }> };
};
export function supportsSvgBackdropFilter() {
  if (
    typeof window === "undefined" ||
    typeof CSS === "undefined" ||
    typeof navigator === "undefined"
  )
    return false;
  const browser = navigator as NavigatorWithUserAgentData;
  const brands = browser.userAgentData?.brands;
  const chromium = brands
    ? brands.some((entry) => /Chromium/i.test(entry.brand))
    : /Chrome|Chromium|Edg\//.test(navigator.userAgent);
  return chromium && CSS.supports("backdrop-filter", "url(#x)");
}
function roundedRectSdf(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const centerX = width * 0.5,
    centerY = height * 0.5,
    boxX = width * 0.5 - radius,
    boxY = height * 0.5 - radius;
  const queryX = Math.abs(x - centerX) - boxX,
    queryY = Math.abs(y - centerY) - boxY;
  const outsideX = Math.max(queryX, 0),
    outsideY = Math.max(queryY, 0);
  return (
    Math.hypot(outsideX, outsideY) +
    Math.min(Math.max(queryX, queryY), 0) -
    radius
  );
}
function rimHeight(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  bezel: number,
  profile: LiquidGlassProfile,
) {
  const inside = -roundedRectSdf(x, y, width, height, radius);
  if (inside <= 0 || inside >= bezel) return 0;
  const amount = inside / bezel;
  if (profile === "smooth") {
    const smooth = amount * amount * (3 - 2 * amount);
    return 1 - smooth;
  }
  const quarter = 1 - amount;
  return Math.sqrt(Math.max(0, 1 - quarter * quarter)) - 1;
}
function refract(
  incoming: [number, number, number],
  normal: [number, number, number],
  eta: number,
): [number, number, number] {
  const dot =
    incoming[0] * normal[0] + incoming[1] * normal[1] + incoming[2] * normal[2];
  const k = 1 - eta * eta * (1 - dot * dot);
  if (k < 0) return [0, 0, -1];
  const factor = eta * dot + Math.sqrt(k);
  return [
    eta * incoming[0] - factor * normal[0],
    eta * incoming[1] - factor * normal[1],
    eta * incoming[2] - factor * normal[2],
  ];
}
interface RasterizedGlass {
  width: number;
  height: number;
  displacement: Uint8ClampedArray;
  highlight: Uint8ClampedArray;
  maxDisplacement: number;
  cssWidth: number;
  cssHeight: number;
}
function rasterize(
  width: number,
  height: number,
  radius: number,
  options: LiquidGlassOptions,
): RasterizedGlass {
  const pixelScale = Math.min(window.devicePixelRatio || 1, 1) * options.scale,
    maxSide = 420;
  const rawWidth = Math.max(4, Math.round(width * pixelScale)),
    rawHeight = Math.max(4, Math.round(height * pixelScale));
  const downscale = Math.min(1, maxSide / Math.max(rawWidth, rawHeight));
  const rasterWidth = Math.max(4, Math.round(rawWidth * downscale)),
    rasterHeight = Math.max(4, Math.round(rawHeight * downscale));
  const scaleX = rasterWidth / width,
    scaleY = rasterHeight / height;
  const displacement = new Uint8ClampedArray(rasterWidth * rasterHeight * 4),
    highlight = new Uint8ClampedArray(rasterWidth * rasterHeight * 4),
    offsets = new Float32Array(rasterWidth * rasterHeight * 2);
  const epsilon = 1 / Math.max(scaleX, scaleY),
    light = norm3(...options.specular.lightDir),
    half = norm3(light[0], light[1], light[2] + 1),
    eta = 1 / options.ior;
  let maxDisplacement = 1;
  for (let pixelY = 0; pixelY < rasterHeight; pixelY += 1)
    for (let pixelX = 0; pixelX < rasterWidth; pixelX += 1) {
      const x = (pixelX + 0.5) / scaleX,
        y = (pixelY + 0.5) / scaleY,
        sdf = roundedRectSdf(x, y, width, height, radius),
        index = pixelY * rasterWidth + pixelX,
        offsetIndex = index * 2;
      if (sdf >= 0) continue;
      const height0 = rimHeight(
        x,
        y,
        width,
        height,
        radius,
        options.bezelWidth,
        options.profile,
      );
      if (height0 === 0) continue;
      const heightX1 = rimHeight(
          x + epsilon,
          y,
          width,
          height,
          radius,
          options.bezelWidth,
          options.profile,
        ),
        heightX0 = rimHeight(
          x - epsilon,
          y,
          width,
          height,
          radius,
          options.bezelWidth,
          options.profile,
        ),
        heightY1 = rimHeight(
          x,
          y + epsilon,
          width,
          height,
          radius,
          options.bezelWidth,
          options.profile,
        ),
        heightY0 = rimHeight(
          x,
          y - epsilon,
          width,
          height,
          radius,
          options.bezelWidth,
          options.profile,
        );
      const gradientX = ((heightX1 - heightX0) / (2 * epsilon)) * 2.35,
        gradientY = ((heightY1 - heightY0) / (2 * epsilon)) * 2.35,
        normal = norm3(-gradientX, -gradientY, 1),
        ray = refract([0, 0, -1], normal, eta),
        rayZ = Math.max(0.12, Math.abs(ray[2])),
        displacementX = (options.depth * ray[0]) / rayZ,
        displacementY = (options.depth * ray[1]) / rayZ;
      offsets[offsetIndex] = displacementX;
      offsets[offsetIndex + 1] = displacementY;
      maxDisplacement = Math.max(
        maxDisplacement,
        Math.abs(displacementX),
        Math.abs(displacementY),
      );
      const normalDotHalf = Math.max(
          0,
          normal[0] * half[0] + normal[1] * half[1] + normal[2] * half[2],
        ),
        specular =
          Math.pow(normalDotHalf, options.specular.shininess) *
          options.specular.intensity,
        edge = clamp(-sdf / options.bezelWidth, 0, 1),
        rim = Math.sin(Math.PI * edge),
        alpha = clamp((specular * 0.85 + rim * 0.16) * 255, 0, 210),
        highlightIndex = index * 4;
      highlight[highlightIndex] = 255;
      highlight[highlightIndex + 1] = 248;
      highlight[highlightIndex + 2] = 240;
      highlight[highlightIndex + 3] = alpha;
    }
  for (let index = 0; index < rasterWidth * rasterHeight; index += 1) {
    const displacementX = offsets[index * 2],
      displacementY = offsets[index * 2 + 1],
      dataIndex = index * 4;
    displacement[dataIndex] = clamp(
      128 + (displacementX / maxDisplacement) * 127,
      0,
      255,
    );
    displacement[dataIndex + 1] = clamp(
      128 + (displacementY / maxDisplacement) * 127,
      0,
      255,
    );
    displacement[dataIndex + 2] = 128;
    displacement[dataIndex + 3] = 255;
  }
  return {
    width: rasterWidth,
    height: rasterHeight,
    displacement,
    highlight,
    maxDisplacement,
    cssWidth: width,
    cssHeight: height,
  };
}
function toDataUrl(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  canvas: HTMLCanvasElement,
) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: false });
  if (!context) return "";
  const imageData = new ImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
export class LiquidGlassEngine {
  private readonly optics: HTMLElement;
  private readonly id: string;
  private options: LiquidGlassOptions;
  private readonly displacementCanvas: HTMLCanvasElement;
  private readonly highlightCanvas: HTMLCanvasElement;
  private readonly highlight: HTMLDivElement;
  private readonly resizeObserver: ResizeObserver;
  private filterElement: SVGFilterElement | null = null;
  private frame = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  constructor(
    optics: HTMLElement,
    options: Partial<LiquidGlassOptions> & {
      specular?: Partial<LiquidGlassSpecular>;
    } = {},
  ) {
    this.optics = optics;
    this.id = `liquid-glass-${++uid}`;
    this.options = {
      ...defaults,
      ...options,
      specular: { ...defaults.specular, ...options.specular },
    };
    this.displacementCanvas = document.createElement("canvas");
    this.highlightCanvas = document.createElement("canvas");
    this.highlight = document.createElement("div");
    this.highlight.dataset.lgHighlight = "";
    Object.assign(this.highlight.style, {
      position: "absolute",
      inset: "0",
      borderRadius: "inherit",
      pointerEvents: "none",
      backgroundSize: "100% 100%",
      mixBlendMode: "screen",
      zIndex: "1",
    });
    this.optics.append(this.highlight);
    this.resizeObserver = new ResizeObserver(() => this.scheduleResize());
    this.resizeObserver.observe(this.optics);
    this.schedule();
  }
  setOptions(
    next: Partial<LiquidGlassOptions> & {
      specular?: Partial<LiquidGlassSpecular>;
    },
  ) {
    this.options = {
      ...this.options,
      ...next,
      specular: { ...this.options.specular, ...next.specular },
    };
    this.schedule();
  }
  private scheduleResize() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.resizeTimer = null;
      this.schedule();
    }, 60);
  }
  private schedule() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.render());
  }
  private render() {
    const rectangle = this.optics.getBoundingClientRect();
    if (rectangle.width < 4 || rectangle.height < 4) return;
    const radius = parseFloat(getComputedStyle(this.optics).borderRadius) || 0;
    const maps = rasterize(
      rectangle.width,
      rectangle.height,
      radius,
      this.options,
    );
    this.optics.style.backgroundColor = this.options.tint;
    this.highlight.style.backgroundImage = `url(${toDataUrl(maps.highlight, maps.width, maps.height, this.highlightCanvas)})`;
    const fallback = `blur(${Math.max(this.options.blur, 6)}px) saturate(${this.options.saturation})`;
    if (supportsSvgBackdropFilter()) {
      this.buildFilter(maps);
      this.optics.style.backdropFilter = `url(#${this.id})`;
      this.optics.dataset.refracting = "true";
    } else {
      this.optics.style.backdropFilter = fallback;
      this.optics.dataset.refracting = "false";
    }
    this.optics.style.setProperty("-webkit-backdrop-filter", fallback);
  }
  private buildFilter(maps: RasterizedGlass) {
    const namespace = "http://www.w3.org/2000/svg",
      definitions = ensureSvgRoot().querySelector("defs");
    if (!definitions) return;
    if (!this.filterElement) {
      this.filterElement = document.createElementNS(namespace, "filter");
      this.filterElement.id = this.id;
      this.filterElement.setAttribute("color-interpolation-filters", "sRGB");
      this.filterElement.setAttribute("x", "0");
      this.filterElement.setAttribute("y", "0");
      this.filterElement.setAttribute("width", "100%");
      this.filterElement.setAttribute("height", "100%");
      definitions.appendChild(this.filterElement);
    }
    this.filterElement.replaceChildren();
    const image = document.createElementNS(namespace, "feImage");
    image.setAttribute(
      "href",
      toDataUrl(
        maps.displacement,
        maps.width,
        maps.height,
        this.displacementCanvas,
      ),
    );
    image.setAttribute("x", "0");
    image.setAttribute("y", "0");
    image.setAttribute("width", String(maps.cssWidth));
    image.setAttribute("height", String(maps.cssHeight));
    image.setAttribute("preserveAspectRatio", "none");
    image.setAttribute("result", "map");
    const blur = document.createElementNS(namespace, "feGaussianBlur");
    blur.setAttribute("in", "SourceGraphic");
    blur.setAttribute("stdDeviation", String(this.options.blur));
    blur.setAttribute("result", "soft");
    const displacement = document.createElementNS(
      namespace,
      "feDisplacementMap",
    );
    displacement.setAttribute("in", "soft");
    displacement.setAttribute("in2", "map");
    displacement.setAttribute("scale", String(maps.maxDisplacement * 2));
    displacement.setAttribute("xChannelSelector", "R");
    displacement.setAttribute("yChannelSelector", "G");
    displacement.setAttribute("result", "bent");
    const saturation = document.createElementNS(namespace, "feColorMatrix");
    saturation.setAttribute("in", "bent");
    saturation.setAttribute("type", "saturate");
    saturation.setAttribute("values", String(this.options.saturation));
    this.filterElement.append(image, blur, displacement, saturation);
  }
  destroy() {
    this.resizeObserver.disconnect();
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    cancelAnimationFrame(this.frame);
    this.filterElement?.remove();
    this.highlight.remove();
    this.optics.style.removeProperty("background-color");
    this.optics.style.removeProperty("backdrop-filter");
    this.optics.style.removeProperty("-webkit-backdrop-filter");
    delete this.optics.dataset.refracting;
  }
}
