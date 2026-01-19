cmake_minimum_required(VERSION 3.15)
project(AuthSystemLoader)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find OpenSSL
find_package(OpenSSL REQUIRED)

# Find CURL
find_package(CURL REQUIRED)

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/include
    ${OPENSSL_INCLUDE_DIR}
    ${CURL_INCLUDE_DIRS}
)

# Source files (when implemented)
set(SOURCES
    src/protection.cpp
    src/auth_client.cpp
    src/crypto.cpp
    src/fingerprint.cpp
)

# Create library
add_library(auth_loader STATIC ${SOURCES})
target_link_libraries(auth_loader
    ${OPENSSL_LIBRARIES}
    ${CURL_LIBRARIES}
)

# Example executable
add_executable(loader_example examples/example_usage.cpp)
target_link_libraries(loader_example auth_loader)

# Install
install(TARGETS auth_loader DESTINATION lib)
install(FILES
    include/protection.h
    include/auth_client.h
    DESTINATION include
)
