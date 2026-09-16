# SHEILA GBA EMU

High-Performance Game Boy Advance Emulator for Android and Web.

## Specifications
- **Application Name**: SHEILA GBA EMU
- **Package**: `com.sheila.gbaemu`
- **Output Artifact**: `SHEILA-GBA-EMU-debug.apk` / `SHEILA-GBA-EMU-release.apk`
- **Minimum SDK**: Android 8.0 (API 26)
- **Target SDK**: Android 14+ (API 34)
- **Native Architecture**: C++20 JNI Core with CMake pipeline
- **Continuous Integration**: Automated GitHub Actions APK build workflow

## Building with Gradle
```bash
./gradlew assembleDebug
```
The APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

## License
BSD-2-Clause & MIT. See LICENSE.
