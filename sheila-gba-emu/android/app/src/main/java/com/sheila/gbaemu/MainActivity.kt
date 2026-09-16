package com.sheila.gbaemu

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val initialized = NativeBridge.initCore()
        if (initialized) {
            Toast.makeText(this, "SHEILA GBA Hardware Core Ready", Toast.LENGTH_SHORT).show()
        }
    }
}
