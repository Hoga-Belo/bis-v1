declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface StrategyOptions {
    jwtFromRequest: JwtFromRequestFunction;
    secretOrKey?: string;
    secretOrKeyProvider?: SecretOrKeyProvider;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
    jsonWebTokenOptions?: Record<string, unknown>;
  }

  export interface VerifiedCallback {
    (error: Error | null, user?: unknown, info?: unknown): void;
  }

  export interface VerifyCallback {
    (payload: unknown, done: VerifiedCallback): void;
  }

  export interface VerifyCallbackWithRequest {
    (req: unknown, payload: unknown, done: VerifiedCallback): void;
  }

  export type JwtFromRequestFunction = (req: unknown) => string | null;

  export type SecretOrKeyProvider = (
    req: unknown,
    rawJwtToken: string,
    done: (err: Error | null, secretOrKey?: string) => void,
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback | VerifyCallbackWithRequest);
    name: string;
  }

  export namespace ExtractJwt {
    function fromHeader(header_name: string): JwtFromRequestFunction;
    function fromBodyField(field_name: string): JwtFromRequestFunction;
    function fromUrlQueryParameter(param_name: string): JwtFromRequestFunction;
    function fromAuthHeaderWithScheme(auth_scheme: string): JwtFromRequestFunction;
    function fromAuthHeaderAsBearerToken(): JwtFromRequestFunction;
    function fromExtractors(extractors: JwtFromRequestFunction[]): JwtFromRequestFunction;
  }
}
