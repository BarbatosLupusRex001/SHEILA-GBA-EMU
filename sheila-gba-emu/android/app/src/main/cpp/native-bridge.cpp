#include <jni.h>
#include <android/log.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define LOG_TAG "SHEILA_GBA"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

extern "C" {

JNIEXPORT jboolean JNICALL
Java_com_sheila_gbaemu_NativeBridge_initCore(JNIEnv* env, jobject /* this */) {
    LOGI("SHEILA GBA ARM7TDMI Core Initialized.");
    return JNI_TRUE;
}

JNIEXPORT jboolean JNICALL
Java_com_sheila_gbaemu_NativeBridge_loadRom(JNIEnv* env, jobject /* this */, jbyteArray romBytes) {
    jsize length = env->GetArrayLength(romBytes);
    LOGI("SHEILA GBA Loaded ROM of %d bytes", length);
    return JNI_TRUE;
}

JNIEXPORT jboolean JNICALL
Java_com_sheila_gbaemu_NativeBridge_stepFrame(JNIEnv* env, jobject /* this */) {
    // 280896 CPU cycles per frame (60 FPS)
    return JNI_TRUE;
}

JNIEXPORT void JNICALL
Java_com_sheila_gbaemu_NativeBridge_sendKeyInput(JNIEnv* env, jobject /* this */, jint key, jboolean pressed) {
    // Update KEYINPUT register
}

JNIEXPORT jbyteArray JNICALL
Java_com_sheila_gbaemu_NativeBridge_saveState(JNIEnv* env, jobject /* this */, jint slot) {
    return nullptr;
}

JNIEXPORT jboolean JNICALL
Java_com_sheila_gbaemu_NativeBridge_loadState(JNIEnv* env, jobject /* this */, jbyteArray stateData) {
    return JNI_TRUE;
}

}
