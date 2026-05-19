import { z } from 'zod';

/** Schema de validación de login */
export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido').min(1, 'El correo es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

/** Schema de validación de registro */
export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').max(15),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['CONDUCTOR', 'TALLER', 'AUTONOMO', 'EMPRESA']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

/** Schema de OTP */
export const otpSchema = z.object({
  otp: z.string().length(6, 'El código debe tener 6 dígitos').regex(/^\d+$/, 'Solo se permiten números'),
});

/** Schema de recuperación de contraseña */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
