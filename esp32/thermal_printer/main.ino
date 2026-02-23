#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// ========== PRINTER PINS ==========
#define PRINTER_RX 17
#define PRINTER_TX 16

// ========== WiFi ==========
const char* ssid = "BIGBREW-PRINTER";
const char* password = "printer123";

WebServer server(8080);
HardwareSerial printerSerial(1);

// ========== PRINTER COMMANDS ==========
const byte ESC = 0x1B;
const byte GS = 0x1D;

// ========== FORWARD DECLARATIONS ==========
void handleTest();
void handlePrintOrder();
void handleStatus();

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n\n========== BIGBREW THERMAL PRINTER ==========");
  
  // Initialize printer serial at 9600 baud
  printerSerial.begin(9600, SERIAL_8N1, PRINTER_RX, PRINTER_TX);
  delay(1000);
  
  Serial.println("[SETUP] Printer serial initialized at 9600 baud");
  
  // WiFi setup - Access Point mode
  WiFi.mode(WIFI_AP);
  delay(500);
  WiFi.softAP(ssid, password);
  delay(500);
  
  Serial.println("[SETUP] WiFi AP started");
  Serial.print("[SETUP] IP: ");
  Serial.println(WiFi.softAPIP());
  
  // Web routes
  server.on("/test", HTTP_GET, handleTest);
  server.on("/print-order", HTTP_POST, handlePrintOrder);
  server.on("/status", HTTP_GET, handleStatus);
  
  server.begin();
  Serial.println("[SETUP] Web server started on port 8080");
}

void loop() {
  server.handleClient();
  delay(10);
}

// ========== TEST ENDPOINT ==========
void handleTest() {
  Serial.println("\n[TEST] Test print request");
  
  // Reset printer
  byte reset[] = {ESC, '@'};
  printerSerial.write(reset, 2);
  delay(1000);
  
  // Set density
  byte density[] = {0x12, 0x41, 20};
  printerSerial.write(density, 3);
  delay(200);
  
  // Set heating
  byte heating[] = {0x1B, 0x38, 80, 2};
  printerSerial.write(heating, 4);
  delay(200);
  
  // SEND ENTIRE RECEIPT AS ONE BLOCK - NO DELAYS BETWEEN CHARACTERS
  Serial.println("[TEST] Printing...");
  
  String receipt = "\n";
  receipt += "BIGBREW\n";
  receipt += "Test Receipt\n";
  receipt += "Line 1\n";
  receipt += "Line 2\n";
  receipt += "Line 3\n";
  receipt += "\n";
  
  // Send as RAW BYTES to avoid line-by-line interpretation
  for (int i = 0; i < receipt.length(); i++) {
    printerSerial.write(receipt[i]);
  }
  delay(2000);  // Long wait for entire block to print
  
  // Feed paper
  Serial.println("[TEST] Feeding paper...");
  byte feed[] = {ESC, 'J', 15};
  printerSerial.write(feed, 3);
  delay(1000);
  
  // Cut
  Serial.println("[TEST] Cutting...");
  byte cut[] = {GS, 'V', 66, 0};
  printerSerial.write(cut, 4);
  
  Serial.println("[TEST] Done!");
  server.send(200, "application/json", "{\"success\":true,\"message\":\"Test print sent\"}");
}

// ========== ORDER PRINT ENDPOINT ==========
void handlePrintOrder() {
  Serial.println("\n[ORDER] Request received");
  
  if (!server.hasArg("plain")) {
    server.send(400, "application/json", "{\"error\":\"No data\"}");
    return;
  }
  
  String body = server.arg("plain");
  JsonDocument doc;
  
  if (deserializeJson(doc, body)) {
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }
  
  // Respond immediately
  server.send(200, "application/json", "{\"success\":true,\"message\":\"Printing...\"}");
  delay(100);
  
  // Extract data
  String orderNumber = doc["orderNumber"] | "ORD-000000";
  String customerName = doc["customerName"] | "Customer";
  JsonArray items = doc["items"];
  String totalAmount = doc["totalAmount"] | "0.00";
  
  Serial.print("[ORDER] ");
  Serial.print(orderNumber);
  Serial.print(" | ");
  Serial.print(customerName);
  Serial.print(" | Items: ");
  Serial.println(items.size());
  
  // Reset printer
  byte reset[] = {ESC, '@'};
  printerSerial.write(reset, 2);
  printerSerial.flush();
  delay(1000);
  
  // Set density - MEDIUM
  byte density[] = {0x12, 0x41, 20};
  printerSerial.write(density, 3);
  printerSerial.flush();
  delay(200);
  
  // Set heating
  byte heating[] = {0x1B, 0x38, 80, 2};
  printerSerial.write(heating, 4);
  printerSerial.flush();
  delay(200);
  
  Serial.println("[PRINT] Sending receipt as continuous block...");
  
  // BUILD entire receipt first
  String receipt = "\n\n";
  receipt += "BIGBREW COFFEE\n";
  receipt += "Order Receipt\n";
  receipt += "========================\n";
  receipt += "Order: " + orderNumber + "\n";
  receipt += "Customer: " + customerName + "\n";
  receipt += "========================\n";
  receipt += "Items:\n";
  
  for (size_t i = 0; i < items.size(); i++) {
    JsonObject item = items[i];
    String name = item["name"] | "Item";
    int qty = item["quantity"] | 1;
    receipt += name + " x" + qty + "\n";
  }
  
  receipt += "========================\n";
  receipt += "Total: P" + totalAmount + "\n";
  receipt += "========================\n";
  receipt += "Thank you!\n";
  receipt += "\n\n";
  
  // SEND as raw bytes - no line-by-line!
  for (int i = 0; i < receipt.length(); i++) {
    printerSerial.write(receipt[i]);
  }
  delay(2500);  // Long wait for entire block to print
  
  // Feed paper
  Serial.println("[PRINT] Feeding paper...");
  byte feed[] = {ESC, 'J', 15};
  printerSerial.write(feed, 3);
  printerSerial.flush();
  delay(1500);
  
  // Cut
  Serial.println("[PRINT] Cutting...");
  byte cut[] = {GS, 'V', 66, 0};
  printerSerial.write(cut, 4);
  printerSerial.flush();
  delay(300);
  
  byte cut2[] = {GS, 'V', 65, 0};
  printerSerial.write(cut2, 4);
  printerSerial.flush();
  
  Serial.println("[PRINT] Complete!");
}

// ========== STATUS ENDPOINT ==========
void handleStatus() {
  String json = "{\"status\":\"ready\",\"ip\":\"";
  json += WiFi.softAPIP().toString();
  json += "\"}";
  server.send(200, "application/json", json);
}
