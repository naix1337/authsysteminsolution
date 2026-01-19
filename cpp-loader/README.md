# C++ Loader Client

Windows-native authentication client for the Auth System.

## Features

- **Anti-Debugging**: IsDebuggerPresent, PEB checks, timing attacks
- **Anti-VM**: CPUID checks, registry detection, process scanning
- **Memory Integrity**: CRC32 checksums, code section validation
- **Binary Integrity**: SHA-256 hashing, signature validation
- **Secure Communication**: RSA-4096, AES-256-GCM, HMAC-SHA256
- **Device Fingerprinting**: HWID, CPU ID, Disk Serial, MAC, BIOS

## Prerequisites

- CMake 3.15+
- Visual Studio 2019+ or GCC 9+
- OpenSSL (libssl, libcrypto)
- libcurl

## Building

```bash
mkdir build
cd build
cmake ..
cmake --build . --config Release
```

## Usage

```cpp
#include "protection.h"
#include "auth_client.h"

int main() {
    // 1. Run protection checks
    if (LoaderProtection::Protection::IsDebuggerPresent()) {
        return 1; // Exit if debugger detected
    }
    
    // 2. Initialize client
    AuthClient::Client client("https://api.yourserver.com");
    client.Initialize();
    
    // 3. Login
    client.Login("username", "password");
    
    // 4. Main loop with heartbeat
    while (true) {
        client.Heartbeat();
        Sleep(30000); // 30 seconds
    }
    
    return 0;
}
```

## Architecture

The loader implements a secure communication protocol:

1. **Handshake**: Exchange RSA public keys, receive challenge
2. **Login**: Send encrypted credentials + signed challenge
3. **Session**: Receive AES session key for encrypted payloads
4. **Heartbeat**: Send periodic heartbeats with nonce + signature

All communication is:
- Encrypted with AES-256-GCM (on top of HTTPS)
- Signed with HMAC-SHA256
- Protected against replay attacks (nonce system)
- Bound to device fingerprint

## Security Notes

- Run with administrator privileges for full hardware fingerprinting
- The binary should be code-signed in production
- Consider additional obfuscation (VMProtect, Themida, etc.)
- Store keys securely (Windows DPAPI recommended)

## Implementation Status

⚠️ **Note**: Full implementation requires:
- `src/protection.cpp` - Anti-debugging/VM detection
- `src/auth_client.cpp` - Authentication flow
- `src/crypto.cpp` - Cryptographic operations
- `src/fingerprint.cpp` - Hardware fingerprinting

See `examples/example_usage.cpp` for integration example.
