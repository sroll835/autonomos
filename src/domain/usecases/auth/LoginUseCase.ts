import { IAuthRepository } from '../../repositories/IAuthRepository';
import { AuthResponse } from '../../entities/User';

/** Caso de uso: iniciar sesión */
export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string): Promise<AuthResponse> {
    if (!email) throw new Error('El correo es requerido');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Correo electrónico inválido');
    if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres');
    return this.authRepo.login(email.toLowerCase().trim(), password);
  }
}
