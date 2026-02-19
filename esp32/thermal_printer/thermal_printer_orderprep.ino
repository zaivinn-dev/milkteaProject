#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// ========== COMMUNICATION MODE SELECTION ==========
// Choose one: TTL (3.3V) or RS232 (±12V with converter)
#define COMM_MODE_TTL      // Use this for direct connection (TTL - 3.3V logic)
// #define COMM_MODE_RS232    // Use this for RS232 (needs MAX3232 or similar converter)

// Thermal Printer pins (adjust based on your setup)
#define PRINTER_RX 16  // RX pin
#define PRINTER_TX 17  // TX pin

// WiFi credentials
const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

WebServer server(8080);
HardwareSerial printerSerial(1);

// Thermal printer commands
const byte ESC = 0x1B;
const byte GS = 0x1D;

// Printer settings
const int PAPER_WIDTH = 32;  // Characters per line for 58mm thermal printer

void setup() {
  Serial.begin(115200);
  
  // Initialize thermal printer serial
  printerSerial.begin(9600, SERIAL_8N1, PRINTER_RX, PRINTER_TX);
  
  #ifdef COMM_MODE_RS232
    Serial.println("\n[MODE] RS232 Mode - Ensure MAX3232 converter is connected");
  #else
    Serial.println("\n[MODE] TTL Mode - Direct 3.3V connection");
  #endif
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
  
  // Setup web server routes
  server.on("/print-receipt", HTTP_POST, handlePrintReceipt);
  server.on("/print-order", HTTP_POST, handlePrintOrder);
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/test", HTTP_GET, handleTest);
  
  server.begin();
  Serial.println("Web server started on port 8080");
  Serial.println("Available endpoints:");
  Serial.println("  POST /print-receipt - Print general receipt with custom text");
  Serial.println("  POST /print-order - Print order preparation receipt");
  Serial.println("  GET /status - Get printer status");
  Serial.println("  GET /test - Print test receipt");
}

void loop() {
  server.handleClient();
  delay(10);
}

// ========== ORDER PREPARATION RECEIPT HANDLER ==========
// Expects JSON with order details from Order Preparation screen
void handlePrintOrder() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    
    // Parse JSON
    DynamicJsonDocument doc(8192);
    DeserializationError error = deserializeJson(doc, body);
    
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      Serial.println("JSON parse error");
      return;
    }
    
    // Extract order data
    String orderNumber = doc["orderNumber"] | "ORD-000000000";
    String customerName = doc["customerName"] | "Walk-in Customer";
    String timestamp = doc["timestamp"] | "";
    JsonArray items = doc["items"];
    String totalAmount = doc["totalAmount"] | "0.00";
    String status = doc["status"] | "PENDING";
    
    // Initialize printer
    initializePrinter();
    
    // Print order receipt
    printOrderReceipt(orderNumber, customerName, timestamp, items, totalAmount, status);
    
    // Feed paper and cut
    feedPaper(5);
    cutPaper();
    
    server.send(200, "application/json", "{\"success\":true,\"message\":\"Order receipt printed\"}");
    Serial.println("Order receipt printed successfully");
  } else {
    server.send(400, "application/json", "{\"error\":\"No data provided\"}");
  }
}

// ========== GENERAL RECEIPT HANDLER ==========
// For custom text receipts
void handlePrintReceipt() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    
    // Parse JSON
    DynamicJsonDocument doc(4096);
    DeserializationError error = deserializeJson(doc, body);
    
    if (error) {
      server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
      return;
    }
    
    String textToPrint = doc["text"];
    
    // Initialize printer
    initializePrinter();
    
    // Print the text
    printText(textToPrint);
    
    // Feed paper and cut
    feedPaper(5);
    cutPaper();
    
    server.send(200, "application/json", "{\"success\":true,\"message\":\"Receipt printed\"}");
    Serial.println("Receipt printed successfully");
  } else {
    server.send(400, "application/json", "{\"error\":\"No data provided\"}");
  }
}

// Handle status request
void handleStatus() {
  #ifdef COMM_MODE_RS232
    String mode = "RS232";
  #else
    String mode = "TTL";
  #endif
  
  String json = "{\"status\":\"connected\",\"mode\":\"";
  json += mode;
  json += "\",\"ip\":\"";
  json += WiFi.localIP().toString();
  json += "\",\"signal\":" + String(WiFi.RSSI()) + "}";
  server.send(200, "application/json", json);
}

// Handle test request
void handleTest() {
  initializePrinter();
  
  // Print test receipt with order format
  printCentered("BIGBREW");
  printCentered("Order Preparation Receipt");
  printDivider();
  
  printText("Order #: ORD-653941119\n");
  printText("Time: 3:37:33 PM\n");
  printText("Status: PENDING\n\n");
  
  printText("Customer: John Doe\n");
  printDivider();
  
  printText("Items:\n");
  printText("Winter Melon x3\n");
  printText("  Large | Sugar: 100%\n");
  printText("Kape Vanilla x2\n");
  printText("  Large | Sugar: 100%\n\n");
  
  printDivider();
  printRightAligned("Total: P195.00\n");
  printDivider();
  
  feedPaper(3);
  cutPaper();
  
  server.send(200, "application/json", "{\"success\":true,\"message\":\"Test print completed\"}");
  Serial.println("Test print completed");
}

// ========== RECEIPT FORMATTING FUNCTIONS ==========

// Print formatted order receipt
void printOrderReceipt(String orderNumber, String customerName, String timestamp, JsonArray items, String totalAmount, String status) {
  // Store current settings
  byte currentAlign = 1; // 1 = center
  
  // Header
  setAlignment(1); // Center
  setBold(true);
  printText("BIGBREW\n");
  printText("Order Preparation\n");
  setBold(false);
  
  printDivider();
  
  setAlignment(0); // Left
  
  // Order info
  printText("Order #: ");
  printText(orderNumber);
  printText("\n");
  
  if (timestamp.length() > 0) {
    printText("Time: ");
    printText(timestamp);
    printText("\n");
  }
  
  // Status badge
  printText("Status: ");
  setBold(true);
  printText(status);
  setBold(false);
  printText("\n\n");
  
  // Customer
  printText("Customer: ");
  printText(customerName);
  printText("\n");
  
  printDivider();
  
  // Items header
  printText("Items:\n");
  
  // Print each item
  for (size_t i = 0; i < items.size(); i++) {
    JsonObject item = items[i];
    String itemName = item["name"] | "Unknown Item";
    int quantity = item["quantity"] | 1;
    String size = item["size"] | "Regular";
    String sugar = item["sugar"] | "100%";
    String price = item["price"] | "0.00";
    
    // Item name and quantity
    printText(itemName);
    printText(" x");
    printText(String(quantity));
    
    // If price available, show on same line (right aligned)
    if (price != "0.00") {
      int nameLen = itemName.length() + 3; // name + " x" + qty digit
      int spaces = PAPER_WIDTH - nameLen - price.length() - 1;
      for (int s = 0; s < spaces; s++) printText(" ");
      printText("P");
      printText(price);
    }
    printText("\n");
    
    // Item details (indented)
    if (size.length() > 0) {
      printText("  ");
      printText(size);
      printText(" | Sugar: ");
      printText(sugar);
      printText("\n");
    }
  }
  
  printText("\n");
  printDivider();
  
  // Total
  setAlignment(2); // Right align
  printText("Total: P");
  printText(totalAmount);
  printText("\n");
  setAlignment(0); // Back to left
  
  printDivider();
}

// Print centered text
void printCentered(String text) {
  setAlignment(1); // Center alignment
  printText(text);
  printText("\n");
  setAlignment(0); // Back to left
}

// Print right aligned text
void printRightAligned(String text) {
  setAlignment(2); // Right alignment
  printText(text);
  setAlignment(0); // Back to left
}

// Print divider line
void printDivider() {
  for (int i = 0; i < PAPER_WIDTH; i++) {
    printText("=");
  }
  printText("\n");
}

// ========== PRINTER CONTROL FUNCTIONS ==========

// Initialize thermal printer
void initializePrinter() {
  delay(500);
  
  // Reset printer
  byte reset[] = {ESC, '@'};
  printerSerial.write(reset, 2);
  delay(50);
  
  // Set print density (0-30, 15 is default)
  byte density[] = {0x12, 0x41, 15};
  printerSerial.write(density, 3);
  delay(50);
  
  // Set line spacing to 30 dots
  byte lineSpace[] = {0x1B, 0x33, 30};
  printerSerial.write(lineSpace, 3);
  delay(50);
  
  // Set default alignment to left
  setAlignment(0);
}

// Print text
void printText(String text) {
  printerSerial.print(text);
  delay(50);
  
  // Log to serial for debugging
  Serial.print(text);
}

// Feed paper
void feedPaper(int lines) {
  byte feed[] = {ESC, 'J', (byte)lines};
  printerSerial.write(feed, 3);
  delay(100);
}

// Cut paper (full cut)
void cutPaper() {
  byte cut1[] = {GS, 'V', 65, 0};
  printerSerial.write(cut1, 4);
  delay(100);
}

// Partial cut
void partialCut() {
  byte cut2[] = {GS, 'V', 66, 0};
  printerSerial.write(cut2, 4);
  delay(100);
}

// Set text alignment (0=left, 1=center, 2=right)
void setAlignment(byte align) {
  byte alignment[] = {ESC, 'a', align};
  printerSerial.write(alignment, 3);
}

// Set character size (0-3)
void setTextSize(byte size) {
  byte textSize[] = {GS, '!', size};
  printerSerial.write(textSize, 3);
}

// Bold text
void setBold(bool bold) {
  byte boldCmd[] = {ESC, 'E', (byte)(bold ? 1 : 0)};
  printerSerial.write(boldCmd, 3);
  delay(50);
}

// Underline text
void setUnderline(bool underline) {
  byte underlineCmd[] = {ESC, '-', (byte)(underline ? 1 : 0)};
  printerSerial.write(underlineCmd, 3);
}

// Inverse text (white on black)
void setInverse(bool inverse) {
  byte inverseCmd[] = {GS, 'B', (byte)(inverse ? 1 : 0)};
  printerSerial.write(inverseCmd, 3);
}
