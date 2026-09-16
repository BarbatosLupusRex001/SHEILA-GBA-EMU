package com.sheila.gbaemu

object NativeBridge {
    init {
        System.loadLibrary("sheila-gba-native")
    }

    external fun initCore(): Boolean
    external fun loadRom(romBytes: ByteArray): Boolean
    external fun stepFrame(): Boolean
    external fun sendKeyInput(key: Int, pressed: Boolean)
    external fun saveState(slot: Int): ByteArray?
    external fun loadState(stateData: ByteArray): Boolean
}
