import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

/** Hook para detectar conectividad y mostrar banner cuando se pierde internet */
export const useOfflineDetect = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!state.isConnected;
      if (!connected && isConnected) {
        Toast.show({ type: 'error', text1: 'Sin conexión', text2: 'Algunas funciones pueden no estar disponibles', visibilityTime: 0 });
      } else if (connected && !isConnected) {
        Toast.hide();
        Toast.show({ type: 'success', text1: 'Conexión restaurada', visibilityTime: 2000 });
      }
      setIsConnected(connected);
    });
    return () => unsubscribe();
  }, [isConnected]);

  return { isConnected };
};
