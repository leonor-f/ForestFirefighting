#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform sampler2D uSampler3;
uniform float uTimeFactor;
uniform int uState; // 0 = normal, 1 = takeoff, 2 = landing
uniform float uBlinkInterval;

varying vec2 vTextureCoord;

void main() {
    vec4 normalTexture = texture2D(uSampler, vTextureCoord);   // helipad.png
    vec4 upTexture = texture2D(uSampler2, vTextureCoord);      // helipadUP.png
    vec4 downTexture = texture2D(uSampler3, vTextureCoord);    // helipadDOWN.png
    
    if (uState == 0) {
        // Normal state - just show normal texture
        gl_FragColor = normalTexture;
    } else {
        // Calculate blink factor using sin wave
        float blinkFactor = sin(uTimeFactor * uBlinkInterval);
        
        if (uState == 1) {
            // Takeoff - alternate between normal and UP
            if (blinkFactor > 0.0) {
                gl_FragColor = upTexture;
            } else {
                gl_FragColor = normalTexture;
            }
        } else if (uState == 2) {
            // Landing - alternate between normal and DOWN
            if (blinkFactor > 0.0) {
                gl_FragColor = downTexture;
            } else {
                gl_FragColor = normalTexture;
            }
        }
    }
}