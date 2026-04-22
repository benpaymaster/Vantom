import time
import os

def get_battery_stats():
    # Targets the Android/Linux power supply interface
    path = "/sys/class/power_supply/battery/"
    try:
        with open(os.path.join(path, "current_now"), "r") as f:
            current = int(f.read().strip()) / 1000  # Convert to mA
        with open(os.path.join(path, "voltage_now"), "r") as f:
            voltage = int(f.read().strip()) / 1000000  # Convert to V
        return current, voltage
    except FileNotFoundError:
        return None, None

def run_test(label, duration=60):
    print(f"--- Starting Audit: {label} ({duration}s) ---")
    data_points = []
    for _ in range(duration):
        curr, volt = get_battery_stats()
        if curr:
            power = abs(curr * volt) # Power in mW
            data_points.append(power)
        time.sleep(1)
    
    avg_power = sum(data_points) / len(data_points) if data_points else 0
    print(f"Results for {label}: Avg Power Draw = {avg_power:.2f} mW")
    return avg_power

if __name__ == "__main__":
    # Test 1: The "Amazon Stack" (Simulated by high GPS/CPU usage)
    # Test 2: VANTOM (Optimized Pulse)
    print("VANTOM BATTERY AUDIT v1.0")
    run_test("LEGACY_STACK")