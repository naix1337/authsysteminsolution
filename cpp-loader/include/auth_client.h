#pragma once
#include <string>
#include <map>

namespace AuthClient {

    struct LicenseInfo {
        std::string type;
        std::string expiresAt;
        std::string status;
    };

    struct UserInfo {
        std::string id;
        std::string username;
        std::string email;
    };

    class Client {
    public:
        Client(const std::string& apiUrl);
        ~Client();

        // Main Authentication Flow
        bool Initialize();
        bool Login(const std::string& username, const std::string& password);
        bool Verify();
        bool Heartbeat();

        // License Management
        LicenseInfo GetLicenseInfo() const;
        bool ValidateLicense();

        // Status Checks
        bool IsAuthenticated() const;
        bool IsBanned() const;
        std::string GetBanReason() const;

    private:
        // Internal State
        std::string m_apiUrl;
        std::string m_sessionToken;
        std::string m_aesKey;
        std::string m_deviceFingerprint;
        bool m_authenticated;
        LicenseInfo m_licenseInfo;

        // Crypto
        bool PerformHandshake();
        std::string EncryptPayload(const std::string& data);
        std::string DecryptPayload(const std::string& data);
        std::string SignRequest(const std::string& data);

        // Network
        std::string SendRequest(const std::string& endpoint, const std::string& payload);

        // Fingerprinting
        void GenerateDeviceFingerprint();
    };

} // namespace AuthClient
