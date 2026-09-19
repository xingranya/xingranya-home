declare module 'abcjs' {
  export interface AbcVisualOptions {
    responsive?: 'resize' | 'responsive';
    scale?: number;
    staffwidth?: number;
    add_classes?: boolean;
    foregroundColor?: string;
  }

  export function renderAbc(
    target: HTMLElement | string,
    abcString: string,
    options?: AbcVisualOptions
  ): unknown[];
}
