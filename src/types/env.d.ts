declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare const require: {
  context(
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ): {
    keys(): string[];
    (key: string): unknown;
  };
};
