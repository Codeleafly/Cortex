# Nox Release Guide (v1.0.1)

## 1. Versioning
Ensure all `Cargo.toml` files are updated to the target version.
```toml
version = "1.0.1"
```

## 2. Linux Release (.deb)
To generate a Debian package:
1. Install `cargo-deb`: `cargo install cargo-deb`
2. Run: `cargo deb -p nox`
3. Artifact will be in `target/debian/nox_1.0.1_amd64.deb`.

## 3. Windows Release (.msi)
To generate a Microsoft Installer:
1. Install `cargo-wix`: `cargo install cargo-wix`
2. Initialize (one-time): `cargo wix init`
3. Run: `cargo wix -p nox`
4. Artifact will be in `target/wix/nox-1.0.1-x86_64.msi`.
*Note: Requires WiX Toolset on the build machine.*

## 4. Android Build
For Android integration:
1. Add target: `rustup target add aarch64-linux-android`
2. Use `cargo-ndk` for building shared libraries:
   `cargo ndk -t aarch64-linux-android build --release`

## 5. Manual Artifacts
Use `CROSS_BUILD.sh` to generate raw binaries for Linux:
```bash
./CROSS_BUILD.sh
```
Binary will be in `releases/v1.0.1/nox-linux-x64`.
