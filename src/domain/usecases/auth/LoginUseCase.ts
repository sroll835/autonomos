import { IAuthRepository } from '../../repositories/IAuthRepository';
import { AuthResponse } from '../../entities/User';

/** Caso de uso: iniciar sesión */
export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) throw new Error('El correo y la contraseña son requeridos.');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('El formato del correo no es válido.');
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
    return this.authRepo.login(email.toLowerCase().trim(), password);
  }
}
