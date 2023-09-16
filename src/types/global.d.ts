declare module 'glslify' {
  export default function glslify(src: TemplateStringsArray): string;
}

interface Document {
  startViewTransition: (cb: () => void) => void;
}
