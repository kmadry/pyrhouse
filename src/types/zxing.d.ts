declare module '@zxing/browser' {
  export class BrowserMultiFormatReader {
    constructor();
    decodeFromConstraints(
      constraints: MediaStreamConstraints,
      videoElement: HTMLVideoElement,
      callback: (result: Result | null, error: Exception | null) => void
    ): Promise<void>;
    reset(): void;
  }

  export interface Result {
    getText(): string;
  }

  export interface Exception {
    message: string;
  }
} 