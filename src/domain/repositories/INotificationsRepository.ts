/** Contrato del repositorio de notificaciones del usuario */
export interface INotificationsRepository {
  list(): Promise<any>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}
