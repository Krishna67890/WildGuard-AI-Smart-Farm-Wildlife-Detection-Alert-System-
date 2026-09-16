/*
 * =====================================================================================
 *  Project: WildGuard AI - Intelligent Wildlife Harm & Intrusion Detection System
 *  Module:  ESP32 Edge Sensing & Acoustic Non-Harm Deterrence Prototype Node
 *  Target:  ESP32-WROOM-32 / ESP32-CAM
 *  Author:  Final-Year Engineering Project Team
 *  Objective: Non-Lethal, Ethical Animal Early Warning & Real-time Telemetry
 * =====================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---------- Network Configuration ----------
const char* WIFI_SSID     = "WILDGUARD_MESH";
const char* WIFI_PASSWORD = "wildguard_secret";

// Central Backend Server Endpoint
const char* BACKEND_HEARTBEAT_URL = "http://192.168.1.100:5000/api/iot/heartbeat";
const char* BACKEND_PIR_URL       = "http://192.168.1.100:5000/api/iot/pir-trigger";

// ---------- GPIO Pin Definitions ----------
#define PIN_PIR_MOTION     13  // HC-SR501 Pyroelectric Sensor Digital Input
#define PIN_BUZZER_PWM     14  // Safe Acoustic Piezoelectric Siren (2400Hz)
#define PIN_LED_STROBE     4   // Solar Strobe Optical Deterrent (MOSFET Gate)
#define PIN_STATUS_HEARTBEAT 2 // Onboard Blue LED (Blink Heartbeat)

// Device Identity
const char* DEVICE_ID = "iot-esp32-1";
const char* FIRMWARE_VERSION = "v2.4.1-WildGuard-PRO";

// Variables
unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 5000;
bool isAlarmActive = false;

// PWM Tone parameters for non-harm 2.4kHz acoustic deterrence
const int PWM_CHANNEL = 0;
const int PWM_RESOLUTION = 8;
const int PWM_FREQUENCY = 2400; // 2.4 kHz (humanely startles wildlife without damaging hearing)

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=======================================================");
  Serial.println("🐾 WildGuard AI - ESP32 Edge Sensor Node Initializing");
  Serial.println("⚡ Ethical Non-Harm Safeguards ACTIVE");
  Serial.println("=======================================================");

  // Pin Modes
  pinMode(PIN_PIR_MOTION, INPUT);
  pinMode(PIN_STATUS_HEARTBEAT, OUTPUT);
  pinMode(PIN_LED_STROBE, OUTPUT);
  digitalWrite(PIN_LED_STROBE, LOW);

  // Setup PWM for Buzzer
  ledcSetup(PWM_CHANNEL, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcAttachPin(PIN_BUZZER_PWM, PWM_CHANNEL);
  ledcWrite(PWM_CHANNEL, 0); // Off initially

  // Connect to Wi-Fi
  connectWiFi();
}

void connectWiFi() {
  Serial.printf("[Wi-Fi] Connecting to %s...", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    digitalWrite(PIN_STATUS_HEARTBEAT, !digitalRead(PIN_STATUS_HEARTBEAT));
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_STATUS_HEARTBEAT, HIGH);
    Serial.println("\n[Wi-Fi] Connected!");
    Serial.printf("[Wi-Fi] Local IP: %s | RSSI: %d dBm\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
  } else {
    Serial.println("\n[Wi-Fi] Connection Timeout. Running in offline autonomous perimeter mode.");
  }
}

void loop() {
  // 1. Monitor PIR Motion Sensor
  bool motionDetected = digitalRead(PIN_PIR_MOTION);
  if (motionDetected) {
    Serial.println("[PIR] Motion detected across perimeter sector!");
    sendPIRTrigger();
    delay(1000); // Debounce
  }

  // 2. Periodic Telemetry Heartbeat
  if (millis() - lastHeartbeatTime > HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatTime = millis();
    sendHeartbeat(motionDetected);
  }

  // 3. Handle Alarm Sounding Modulation if Active
  if (isAlarmActive) {
    // Pulse acoustic deterrent
    ledcWrite(PWM_CHANNEL, 128); // 50% duty cycle
    digitalWrite(PIN_LED_STROBE, HIGH);
    delay(200);
    ledcWrite(PWM_CHANNEL, 0);
    digitalWrite(PIN_LED_STROBE, LOW);
    delay(200);
  }

  delay(50);
}

void sendHeartbeat(bool pirState) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_HEARTBEAT_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["firmwareVersion"] = FIRMWARE_VERSION;
  doc["batteryLevelPercent"] = 94; // Measured via ADC voltage divider in production
  doc["signalDbm"] = WiFi.RSSI();
  doc["pirTriggered"] = pirState;
  doc["buzzerActive"] = isAlarmActive;

  String requestBody;
  serializeJson(doc, requestBody);

  int httpResponseCode = http.POST(requestBody);
  if (httpResponseCode > 0) {
    String response = http.getString();
    // Parse response for any emergency commands
    StaticJsonDocument<256> respDoc;
    DeserializationError error = deserializeJson(respDoc, response);
    if (!error && respDoc.containsKey("device")) {
      isAlarmActive = respDoc["device"]["buzzerActive"] | false;
    }
  } else {
    Serial.printf("[HTTP] Heartbeat POST failed, code: %d\n", httpResponseCode);
  }

  http.end();
}

void sendPIRTrigger() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(BACKEND_PIR_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<128> doc;
  doc["deviceId"] = DEVICE_ID;

  String requestBody;
  serializeJson(doc, requestBody);
  http.POST(requestBody);
  http.end();
}
