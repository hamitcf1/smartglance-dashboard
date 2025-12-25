// Extend window type to include Google Sign-In library
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (container: HTMLElement, options: any) => void;
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

export {};
