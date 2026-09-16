import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incident } from '../types/index';
import { wsClient, fetchApi } from '../services/api';
import { audioSiren } from '../services/audioSiren';

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'CRITICAL' | 'HIGH' | 'INFO' | 'SUCCESS';
  timestamp: string;
}

interface AlertContextType {
  activeAlert: Incident | null;
  setActiveAlert: (inc: Incident | null) => void;
  isSirenActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  acknowledgeIncident: (id: string) => Promise<void>;
  resolveIncident: (id: string, notes?: string) => Promise<void>;
  triggerSimulation: (scenario: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeAlert, setActiveAlert] = useState<Incident | null>(null);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string, type: ToastMessage['type'] = 'INFO') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleMute = () => {
    const muted = audioSiren.toggleMute();
    setIsMuted(muted);
    if (muted) {
      setIsSirenActive(false);
    }
  };

  // Initial fetch for any active critical incident
  useEffect(() => {
    fetchApi<{ success: boolean; data: any }>('/dashboard/summary')
      .then(res => {
        if (res.success && res.data.activeCriticalIncident) {
          setActiveAlert(res.data.activeCriticalIncident);
          if (res.data.activeCriticalIncident.alarmStatus === 'TRIGGERED') {
            setIsSirenActive(true);
            audioSiren.startSiren();
          }
        }
      })
      .catch(err => console.warn('AlertContext initial fetch warning:', err));
  }, []);

  // Listen to real-time WebSocket events
  useEffect(() => {
    const unsubNewInc = wsClient.on('NEW_INCIDENT', (incident: Incident) => {
      if (incident.threatLevel === 'CRITICAL' || incident.threatLevel === 'HIGH') {
        setActiveAlert(incident);
        setIsSirenActive(true);
        audioSiren.startSiren();
        addToast(
          `🚨 ${incident.threatLevel} WILDLIFE ALERT`,
          `${incident.species.toUpperCase()} detected at ${incident.cameraName} (${Math.round(incident.confidence * 100)}% conf).`,
          incident.threatLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
        );
      } else {
        addToast(
          `ℹ️ Wildlife Observation`,
          `${incident.species.toUpperCase()} detected in ${incident.zoneName}. Safe monitoring mode.`,
          'INFO'
        );
      }
    });

    const unsubAck = wsClient.on('INCIDENT_ACKNOWLEDGED', (incident: Incident) => {
      audioSiren.stopSiren();
      setIsSirenActive(false);
      if (activeAlert?.id === incident.id) {
        setActiveAlert(prev => prev ? { ...prev, status: 'ACKNOWLEDGED', alarmStatus: 'MUTED' } : null);
      }
      addToast(
        'Alert Acknowledged',
        `Incident #${incident.id} (${incident.species}) acknowledged by ${incident.acknowledgedBy || 'Farmer'}. Siren silenced.`,
        'SUCCESS'
      );
    });

    const unsubRes = wsClient.on('INCIDENT_RESOLVED', (incident: Incident) => {
      audioSiren.stopSiren();
      setIsSirenActive(false);
      if (activeAlert?.id === incident.id) {
        setActiveAlert(null);
      }
      addToast(
        'Incident Resolved',
        `Incident #${incident.id} marked RESOLVED. All perimeter sectors returned to normal.`,
        'SUCCESS'
      );
    });

    return () => {
      unsubNewInc();
      unsubAck();
      unsubRes();
    };
  }, [activeAlert]);

  const acknowledgeIncident = async (id: string) => {
    try {
      const res = await fetchApi<{ success: boolean; incident: Incident }>(`/incidents/${id}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ user: 'Ramesh Patel (Lead Farmer)' })
      });
      if (res.success) {
        audioSiren.stopSiren();
        setIsSirenActive(false);
        if (activeAlert?.id === id) {
          setActiveAlert({ ...activeAlert, status: 'ACKNOWLEDGED', alarmStatus: 'MUTED' });
        }
      }
    } catch (err) {
      console.error('Failed to acknowledge incident:', err);
    }
  };

  const resolveIncident = async (id: string, notes?: string) => {
    try {
      const res = await fetchApi<{ success: boolean; incident: Incident }>(`/incidents/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ user: 'Prof. S. R. Sharma (Admin)', notes })
      });
      if (res.success) {
        audioSiren.stopSiren();
        setIsSirenActive(false);
        if (activeAlert?.id === id) {
          setActiveAlert(null);
        }
      }
    } catch (err) {
      console.error('Failed to resolve incident:', err);
    }
  };

  const triggerSimulation = async (scenario: string) => {
    try {
      addToast('Simulating Event...', `Executing examiner scenario: ${scenario}`, 'INFO');
      await fetchApi('/simulation/trigger', {
        method: 'POST',
        body: JSON.stringify({ scenario })
      });
    } catch (err) {
      console.error('Simulation trigger failed:', err);
    }
  };

  return (
    <AlertContext.Provider
      value={{
        activeAlert,
        setActiveAlert,
        isSirenActive,
        isMuted,
        toggleMute,
        toasts,
        removeToast,
        acknowledgeIncident,
        resolveIncident,
        triggerSimulation
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlert must be used within AlertProvider');
  return ctx;
};
