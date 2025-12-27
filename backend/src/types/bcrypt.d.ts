declare module 'bcrypt' {
  /**
   * Generate a salt
   * @param rounds - Number of rounds to use (default: 10)
   * @returns Promise resolving to the generated salt
   */
  export function genSalt(rounds?: number): Promise<string>;

  /**
   * Generate a salt synchronously
   * @param rounds - Number of rounds to use (default: 10)
   * @returns The generated salt
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * Hash a string
   * @param data - The data to hash
   * @param saltOrRounds - The salt or number of rounds to use
   * @returns Promise resolving to the hashed string
   */
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;

  /**
   * Hash a string synchronously
   * @param data - The data to hash
   * @param saltOrRounds - The salt or number of rounds to use
   * @returns The hashed string
   */
  export function hashSync(data: string, saltOrRounds: string | number): string;

  /**
   * Compare a string with a hash
   * @param data - The data to compare
   * @param encrypted - The hash to compare against
   * @returns Promise resolving to true if they match, false otherwise
   */
  export function compare(data: string, encrypted: string): Promise<boolean>;

  /**
   * Compare a string with a hash synchronously
   * @param data - The data to compare
   * @param encrypted - The hash to compare against
   * @returns True if they match, false otherwise
   */
  export function compareSync(data: string, encrypted: string): boolean;

  /**
   * Get the number of rounds used to generate a hash
   * @param encrypted - The hash to check
   * @returns The number of rounds
   */
  export function getRounds(encrypted: string): number;
}
