import React, { useState, useEffect } from 'react';
import { 
  Cpu, Zap, Radio, Bell, Battery, Wifi, CheckCircle2, 
  AlertTriangle, Play, RefreshCw, Code, Layers 
} from 'lucide-react';
import { fetchApi } from '../services/api';
import { IoTDevice } from '../types/index';

export const DeviceManagementPage: React.FC = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'status' | 'firmware' | 'pinout'>('status');

  const fetchDevices = async () => {
    try {
      const res = await fetchApi<{ success: boolean; devices: IoTDevice[] }>('/iot/devices');
      if (res.success && res.devices) {
        setDevices(res.devices);
      }
    } catch (err) {
      console.warn('Failed to load IoT devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerPIR = async (deviceId: string) => {
    await fetchApi('/iot/pir-trigger', {
      method: 'POST',
      body: JSON.stringify({ deviceId })
    });
    fetchDevices();
  };

  const handleToggleBuzzer = async (deviceId: string, activate: boolean) => {
    await fetchApi(activate ? '/iot/trigger-alarm' : '/iot/silence-alarm', {
      method: 'POST',
      body: JSON.stringify({ deviceId })
    });
    fetchDevices();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>ESP32 IoT Edge Nodes & Prototype Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400">
            Hardware-in-the-loop bridge for ESP32 microcontrollers, PIR motion triggers, and acoustic sirens
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'status' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Virtual Hardware Nodes
          </button>
          <button
            onClick={() => setActiveTab('firmware')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'firmware' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            ESP32 Arduino Code
          </button>
          <button
            onClick={() => setActiveTab('pinout')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${activeTab === 'pinout' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Circuit Schematic Pinout
          </button>
        </div>
      </div>

      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {devices.map(dev => (
            <div
              key={dev.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
            >
              {/* Device Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl ${dev.buzzerActive ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{dev.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">IP: {dev.ipAddress} &bull; {dev.firmwareVersion}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  dev.status === 'TRIGGERED'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {dev.status}
                </span>
              </div>

              {/* Hardware Telemetry Indicators */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-center space-x-1 text-slate-400">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px]">Battery</span>
                  </div>
                  <div className="text-sm font-bold text-white">{dev.batteryLevelPercent}%</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-center space-x-1 text-slate-400">
                    <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px]">Wi-Fi RSSI</span>
                  </div>
                  <div className="text-sm font-bold text-white">{dev.signalDbm} dBm</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-center space-x-1 text-slate-400">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px]">Buzzer Pin</span>
                  </div>
                  <div className={`text-sm font-bold ${dev.buzzerActive ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`}>
                    {dev.buzzerActive ? 'HIGH (Active)' : 'LOW (Off)'}
                  </div>
                </div>
              </div>

              {/* Hardware State Indicator Pills */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dev.pirTriggered ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`}></span>
                  <span className="text-slate-300">PIR Motion Status:</span>
                  <strong className={dev.pirTriggered ? 'text-rose-400' : 'text-slate-400'}>
                    {dev.pirTriggered ? 'MOTION DETECTED' : 'QUIET'}
                  </strong>
                </div>

                <span className="text-[11px] text-slate-500 font-mono">
                  Seen: {new Date(dev.lastSeen).toLocaleTimeString()}
                </span>
              </div>

              {/* Examiner Hardware Test Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleTriggerPIR(dev.id)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center justify-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Simulate PIR Trigger</span>
                </button>

                <button
                  onClick={() => handleToggleBuzzer(dev.id, !dev.buzzerActive)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                    dev.buzzerActive
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{dev.buzzerActive ? 'Silence Siren' : 'Trigger Siren Pulse'}</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {activeTab === 'firmware' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Embedded Arduino C++ Firmware (firmware/esp32_wildguard.ino)</span>
            </h3>
            <span className="text-xs text-slate-400">Ready to Flash via Arduino IDE</span>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
{`// =========================================================================
// WildGuard AI - ESP32 Edge Node Firmware (Non-Harm Deterrence Controller)
// Final-Year Engineering Project
// =========================================================================
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "WILDGUARD_WIFI";
const char* password = "wildguard_secret";
const char* serverUrl = "http://192.168.1.100:5000/api/iot/heartbeat";

#define PIN_PIR_SENSOR    13  // Digital Motion Input
#define PIN_BUZZER_ALARM  14  // Safe Acoustic 2400Hz Buzzer Output
#define PIN_LED_STROBE    4   // Optical Strobe Deterrent
#define PIN_STATUS_LED    2   // Heartbeat Blink

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR_SENSOR, INPUT);
  pinMode(PIN_BUZZER_ALARM, OUTPUT);
  pinMode(PIN_LED_STROBE, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\n[WildGuard] ESP32 Connected to Local Mesh.");
}

void loop() {
  bool pirState = digitalRead(PIN_PIR_SENSOR);
  
  // Transmit telemetry to WildGuard Backend Server
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["deviceId"] = "iot-esp32-1";
    doc["pirTriggered"] = pirState;
    doc["batteryLevelPercent"] = 94;
    doc["signalDbm"] = WiFi.RSSI();
    
    String requestBody;
    serializeJson(doc, requestBody);
    int httpResponseCode = http.POST(requestBody);
    http.end();
  }
  
  delay(3000);
}`}
          </pre>
        </div>
      )}

      {activeTab === 'pinout' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>ESP32 Circuit Pinout & Hardware Architecture</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 uppercase text-[10px] block">PIR Motion Sensor</span>
              <p className="text-slate-300 font-mono">GPIO 13 (Digital IN)</p>
              <p className="text-[11px] text-slate-500">HC-SR501 Pyroelectric sensor for initial motion wake-up trigger.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-rose-400 uppercase text-[10px] block">Acoustic Siren / Buzzer</span>
              <p className="text-slate-300 font-mono">GPIO 14 (PWM OUT)</p>
              <p className="text-[11px] text-slate-500">2.4kHz piezoelectric tone generator for humane acoustic deterrence.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 uppercase text-[10px] block">Solar LED Strobe</span>
              <p className="text-slate-300 font-mono">GPIO 4 (MOSFET Gate)</p>
              <p className="text-[11px] text-slate-500">Night optical strobe to startle predators away from perimeter fence.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 uppercase text-[10px] block">ESP32-CAM Serial</span>
              <p className="text-slate-300 font-mono">TX/RX (UART0)</p>
              <p className="text-[11px] text-slate-500">OV2640 camera stream transmitting JPEG optical frames to AI engine.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
