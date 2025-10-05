declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';

// Optionally allow importing them as strings
declare module '*?url' {
  const src: string;
  export default src;
}
