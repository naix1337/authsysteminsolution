#pragma once
#include <string>
#include <vector>
#include <cstdint>

namespace LoaderProtection {

    class Protection {
    public:
        // Anti-Debugging
        static bool IsDebuggerPresent();
        static bool CheckPEB();
        static bool TimingCheck();
        static bool HardwareBreakpointCheck();

        // Anti-VM / Anti-Sandbox
        static bool IsVirtualMachine();
        static bool IsSandbox();
        static bool CheckCPUID();
        static bool CheckVMRegistry();
        static bool CheckVMProcesses();

        // Integrity Checks
        static bool ValidateMemoryIntegrity();
        static std::string ComputeBinaryHash();
        static bool ValidateSelfChecksum();
        static bool VerifyCodeSections();

        // Obfuscation
        static void RandomizeCodeSections();

    private:
        static std::string ComputeSHA256(const std::vector<uint8_t>& data);
        static bool CompareHashes(const std::string& expected, const std::string& actual);
    };

} // namespace LoaderProtection
