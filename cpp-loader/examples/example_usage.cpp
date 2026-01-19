#include "../include/protection.h"
#include "../include/auth_client.h"
#include <iostream>
#include <thread>
#include <chrono>

int main() {
    std::cout << "=== Loader Starting ===" << std::endl;

    // Step 1: Protection Checks
    std::cout << "[1/7] Running anti-debugging checks..." << std::endl;
    if (LoaderProtection::Protection::IsDebuggerPresent()) {
        std::cerr << "ERROR: Debugger detected!" << std::endl;
        return 1;
    }
    std::cout << "  ✓ No debugger detected" << std::endl;

    std::cout << "[2/7] Running anti-VM checks..." << std::endl;
    if (LoaderProtection::Protection::IsVirtualMachine()) {
        std::cerr << "ERROR: Virtual machine detected!" << std::endl;
        return 1;
    }
    std::cout << "  ✓ Physical hardware detected" << std::endl;

    std::cout << "[3/7] Validating binary integrity..." << std::endl;
    if (!LoaderProtection::Protection::ValidateSelfChecksum()) {
        std::cerr << "ERROR: Binary integrity check failed!" << std::endl;
        return 1;
    }
    std::cout << "  ✓ Binary integrity verified" << std::endl;

    // Step 2: Initialize Auth Client
    std::cout << "[4/7] Initializing authentication client..." << std::endl;
    AuthClient::Client client("https://api.example.com");
    
    if (!client.Initialize()) {
        std::cerr << "ERROR: Failed to initialize client" << std::endl;
        return 1;
    }
    std::cout << "  ✓ Client initialized" << std::endl;

    // Step 3: Login
    std::cout << "[5/7] Logging in..." << std::endl;
    std::string username, password;
    std::cout << "Username: ";
    std::cin >> username;
    std::cout << "Password: ";
    std::cin >> password;

    if (!client.Login(username, password)) {
        std::cerr << "ERROR: Login failed" << std::endl;
        return 1;
    }
    std::cout << "  ✓ Login successful" << std::endl;

    // Step 4: Validate License
    std::cout << "[6/7] Validating license..." << std::endl;
    if (!client.ValidateLicense()) {
        std::cerr << "ERROR: License validation failed" << std::endl;
        return 1;
    }
    
    auto license = client.GetLicenseInfo();
    std::cout << "  ✓ License Type: " << license.type << std::endl;
    std::cout << "  ✓ Expires: " << license.expiresAt << std::endl;

    // Step 5: Main Loop with Heartbeat
    std::cout << "[7/7] Starting main loop..." << std::endl;
    std::cout << "\n=== Loader Active ===" << std::endl;
    
    int heartbeatCount = 0;
    while (true) {
        // Runtime integrity check
        if (!LoaderProtection::Protection::ValidateMemoryIntegrity()) {
            std::cerr << "\nERROR: Memory tampering detected!" << std::endl;
            break;
        }

        // Send heartbeat
        if (!client.Heartbeat()) {
            std::cerr << "\nERROR: Heartbeat failed" << std::endl;
            break;
        }

        heartbeatCount++;
        std::cout << "\\rHeartbeat #" << heartbeatCount << " - Status: OK" << std::flush;

        // Wait 30 seconds
        std::this_thread::sleep_for(std::chrono::seconds(30));
    }

    std::cout << "\n=== Loader Stopped ===" << std::endl;
    return 0;
}
