declare module "@fancyapps/ui" {
  export const Fancybox: {
    bind: (selector: string, options?: any) => void;
    destroy: () => void;
  };
}