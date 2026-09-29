declare namespace Express {
  interface Request {
    user?: {
      id: string
      name: string
      email: string
      phone: string
    }
  }
}

declare module 'word-extractor' {
  export default class WordExtractor {
    extract(source: Buffer | string): Promise<{ getBody(): string }>
  }
}
