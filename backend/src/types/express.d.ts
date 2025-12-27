declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface Request extends IncomingMessage {
    body: unknown;
    query: Record<string, string | string[] | undefined>;
    params: Record<string, string>;
    url: string;
    method: string;
    headers: Record<string, string | string[] | undefined>;
    user?: unknown;
  }

  export interface Response extends ServerResponse {
    status(code: number): Response;
    json(body: unknown): Response;
    send(body?: unknown): Response;
    redirect(url: string): void;
    redirect(status: number, url: string): void;
  }

  export interface NextFunction {
    (err?: unknown): void;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void | Promise<void>;
  }

  export interface Application {
    use(...handlers: RequestHandler[]): Application;
    get(path: string, ...handlers: RequestHandler[]): Application;
    post(path: string, ...handlers: RequestHandler[]): Application;
    put(path: string, ...handlers: RequestHandler[]): Application;
    delete(path: string, ...handlers: RequestHandler[]): Application;
    patch(path: string, ...handlers: RequestHandler[]): Application;
    listen(port: number, callback?: () => void): unknown;
  }

  export default function express(): Application;
}
