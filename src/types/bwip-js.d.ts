declare module 'bwip-js' {
  interface BWIPOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    includetext?: boolean;
    textxalign?: string;
    backgroundcolor?: string;
    padding?: number;
  }

  interface BWIPJS {
    toCanvas(canvas: HTMLCanvasElement, options: BWIPOptions): Promise<void>;
  }

  const bwipjs: BWIPJS;
  export default bwipjs;
} 