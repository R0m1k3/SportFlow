import bcrypt from 'bcryptjs';

/**
 * Hashes a plaintext password using bcrypt.
 * @param password The plaintext password.
 * @returns The hashed password.
 */
export const hashPassword = (password: string): string => {
  // Using sync version for simplicity in this client-side context.
  // 10 rounds is a good balance of security and performance.
  return bcrypt.hashSync(password, 10);
};

/**
 * Compares a plaintext password with a hash.
 * @param password The plaintext password from user input.
 * @param hash The hash stored in the database.
 * @returns True if the password matches the hash, false otherwise.
 */
export const comparePassword = (password: string, hash: string): boolean => {
  try {
    // Safely compare the password and the hash.
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
};