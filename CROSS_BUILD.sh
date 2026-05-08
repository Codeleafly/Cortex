#!/bin/bash
set -e

VERSION="1.0.1"
OUTPUT_DIR="releases/v$VERSION"
mkdir -p "$OUTPUT_DIR"

echo "Building for Linux (x86_64)..."
cargo build --release
cp target/release/nox "$OUTPUT_DIR/nox-linux-x64"

echo "Attempting cross-compilation for Windows (x86_64)..."
if command -v x86_64-w64-mingw32-gcc >/dev/null; then
    cargo build --release --target x86_64-pc-windows-gnu
    cp target/x86_64-pc-windows-gnu/release/nox.exe "$OUTPUT_DIR/nox-windows-x64.exe"
else
    echo "Skipping Windows build: x86_64-w64-mingw32-gcc not found."
fi

echo "Attempting cross-compilation for Android (aarch64)..."
if command -v cargo-ndk >/dev/null; then
    cargo ndk -t aarch64-linux-android build --release
    cp target/aarch64-linux-android/release/nox "$OUTPUT_DIR/nox-android-aarch64"
else
    echo "Skipping Android build: cargo-ndk not found."
fi

echo "Builds complete in $OUTPUT_DIR"
