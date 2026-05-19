import { ServiceRequest } from '../../domain/entities/Service';

/** Configuración de tipos de servicio para la UI */
export const SERVICE_TYPE_CONFIG: Record<ServiceRequest['serviceType'], {
  label: string;
  icon: string;
  color: string;
  description: string;
}> = {
  MECANICO: {
    label: 'Mecánico',
    icon: 'wrench',
    color: '#2E7DE0',
    description: 'Mecánicos certificados a domicilio',
  },
  GRUA: {
    label: 'Grúa',
    icon: 'truck',
    color: '#E8AA20',
    description: 'Asistencia vial 24/7',
  },
  AMBULANCIA: {
    label: 'Ambulancia',
    icon: 'ambulance',
    color: '#E83A20',
    description: 'Atención de emergencias',
  },
  LOGISTICA: {
    label: 'Logística',
    icon: 'package',
    color: '#1DB87A',
    description: 'Transporte y entregas',
  },
};
