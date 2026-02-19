# ESP32 Thermal Printer Setup Guide

## Hardware Requirements

- ESP32 Development Board (e.g., ESP32 DevKit)
- Thermal Printer (58mm recommended)
- Thermal Paper (58mm x 50mm rolls)
- USB Cable for ESP32 programming
- USB Power Adapter (5V, 2A+)

## Pin Configuration

```
ESP32 Pin -> Thermal Printer Pin
GPIO16 (RX1) -> TX (Printer Data Input)
GPIO17 (TX1) -> RX (Printer Data Output)
GND -> GND
5V -> 5V (via power supply)
```

## Printer Serial Communication

- Baud Rate: 9600
- Data Bits: 8
- Stop Bits: 1
- Parity: None

## Installation Steps

1. **Install Arduino IDE**
   - Download from https://www.arduino.cc/en/software
   - Add ESP32 board support via Board Manager

2. **Install Required Libraries**
   - ArduinoJson (v6.19+)
   - Via Arduino IDE: Sketch → Include Library → Manage Libraries

3. **Configure WiFi**
   - Edit the sketch:
     ```cpp
     const char* ssid = "YOUR_SSID";           // Your WiFi SSID
     const char* password = "YOUR_PASSWORD";   // Your WiFi Password
     ```

4. **Upload Sketch**
   - Connect ESP32 via USB
   - Select Board: "ESP32 Dev Module"
   - Select COM Port
   - Click Upload

5. **Verify Connection**
   - Open Serial Monitor (115200 baud)
   - Look for "IP address: XXX.XXX.XXX.XXX"
   - Note the IP address for backend configuration

## API Endpoints

### Print Receipt
```
POST http://<ESP32_IP>:8080/print
Content-Type: application/json

{
  "text": "Receipt content here..."
}
```

### Check Status
```
GET http://<ESP32_IP>:8080/status
```

Response:
```json
{
  "status": "connected",
  "ip": "192.168.1.100",
  "signal": -45
}
```

### Test Print
```
GET http://<ESP32_IP>:8080/test
```

## Thermal Printer Commands Reference

| Command | Hex Code | Function |
|---------|----------|----------|
| ESC | 0x1B | Escape character |
| GS | 0x1D | Group separator |
| Reset | ESC @ | Initialize printer |
| Print Density | 0x12 0x41 | Set print darkness |
| Line Spacing | ESC 3 | Set line spacing |
| Alignment | ESC a | Set text alignment |
| Text Size | GS ! | Set character size |
| Bold | ESC E | Enable/disable bold |
| Feed Paper | ESC J | Feed paper lines |
| Full Cut | GS V 65 | Cut paper completely |
| Partial Cut | GS V 66 | Cut paper partially |

## Troubleshooting

### Printer Not Printing
- Check serial connection (TX/RX pins)
- Verify baud rate is 9600
- Look at Serial Monitor output
- Test with `/test` endpoint first

### ESP32 Not Connecting to WiFi
- Verify SSID and password are correct
- Check WiFi signal strength
- Restart ESP32
- Check Serial Monitor for error messages

### No Network Connection
- Ping ESP32 IP address
- Check firewall settings
- Verify backend and ESP32 are on same network
- Use Serial Monitor to check WiFi status

### Poor Print Quality
- Adjust print density (increase value for darker)
- Clean printer head
- Check paper quality
- Increase line spacing if needed

## Example Python Test Script

```python
import requests
import json

ESP32_URL = "http://192.168.1.100:8080"

# Test connection
try:
    response = requests.get(f"{ESP32_URL}/status")
    print("Printer Status:", response.json())
except Exception as e:
    print("Connection failed:", e)

# Send print request
receipt = "================================\nMilk Tea Receipt\n================================"
payload = {"text": receipt}

try:
    response = requests.post(
        f"{ESP32_URL}/print",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    print("Print Result:", response.json())
except Exception as e:
    print("Print failed:", e)
```

## Safety Notes

- Do not apply more than 5V to ESP32
- Use proper power supply (2A+ recommended)
- Printer requires separate 5V power supply (2A+)
- Keep thermal paper away from heat
- Ensure proper ventilation around printer

## Next Steps

1. Upload the sketch to ESP32
2. Note the IP address from Serial Monitor
3. Update backend `.env` file with ESP32_IP
4. Run backend server
5. Run frontend
6. Test printing from Order Preparation dashboard
