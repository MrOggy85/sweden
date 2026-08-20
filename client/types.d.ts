declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}

declare const BUILD_HASH: string;
