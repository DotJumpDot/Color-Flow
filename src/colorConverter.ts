import tinycolor from "tinycolor2";

export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function convertToRGBA(colorString: string, opacity: number): string | null {
  try {
    const color = new tinycolor(colorString);

    if (!color.isValid()) {
      return null;
    }

    const rgba = color.toRgb();
    const finalOpacity = Math.max(0, Math.min(1, rgba.a * opacity));

    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${finalOpacity})`;
  } catch (error) {
    return null;
  }
}

export function isValidColor(colorString: string): boolean {
  try {
    return new tinycolor(colorString).isValid();
  } catch (error) {
    return false;
  }
}

export function parseColor(colorString: string): RGBAColor | null {
  try {
    const color = new tinycolor(colorString);

    if (!color.isValid()) {
      return null;
    }

    return color.toRgb();
  } catch (error) {
    return null;
  }
}
