#!/bin/bash
set -e

echo "Creating releases directory..."
mkdir -p releases

echo "Installing target toolchains..."
rustup target add x86_64-unknown-linux-gnu || true
rustup target add x86_64-pc-windows-gnu || true
rustup target add aarch64-linux-android || true
rustup target add x86_64-apple-darwin || true

# Attempt to install mingw-w64 for Windows cross-compilation if running on Linux
if [ "$(uname)" == "Linux" ]; then
    echo "Updating apt and installing mingw-w64..."
    sudo apt-get update -y || true
    sudo apt-get install -y mingw-w64 || true
fi

echo "Building for Linux 64-bit..."
cargo build --release --target x86_64-unknown-linux-gnu --package nox
cp target/x86_64-unknown-linux-gnu/release/nox releases/nox-linux-amd64

echo "Building for Windows 64-bit..."
# This will only succeed if mingw is properly set up
if cargo build --release --target x86_64-pc-windows-gnu --package nox; then
    cp target/x86_64-pc-windows-gnu/release/nox.exe releases/nox-windows-amd64.exe
else
    echo "Failed to build Windows target locally."
fi

echo "Building for Android (Termux) 64-bit..."
# This usually requires the NDK, so it might fail, but we'll attempt it
if cargo build --release --target aarch64-linux-android --package nox; then
    cp target/aarch64-linux-android/release/nox releases/nox-android-arm64
else
    echo "Failed to build Android target locally (NDK likely missing)."
fi

echo "Build process finished. Check the 'releases/' folder."
ls -la releases/
