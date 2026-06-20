declare module 'arabic-reshaper' {
  export default class ArabicReshaper {
    constructor(options?: Record<string, unknown>);
    reshape(text: string): string;
  }
}

