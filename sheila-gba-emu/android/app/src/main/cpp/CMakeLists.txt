cmake_minimum_required(VERSION 3.22.1)

project("sheila-gba-native")

add_library(sheila-gba-native SHARED
    native-bridge.cpp
)

find_library(log-lib log)
find_library(jnigraphics-lib jnigraphics)

target_link_libraries(sheila-gba-native
    ${log-lib}
    ${jnigraphics-lib}
)
