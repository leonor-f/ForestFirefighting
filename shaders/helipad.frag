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
    vec4 normalTexture = texture2D(uSampler, vTextureCoord);   // helipad.png (H)
    vec4 upTexture = texture2D(uSampler2, vTextureCoord);      // helipadUP.png
    vec4 downTexture = texture2D(uSampler3, vTextureCoord);    // helipadDOWN.png
    
    if (uState == 0) {
        // Normal state - just show normal texture
        gl_FragColor = normalTexture;
    } else {
        // Calculate smooth transition factor using sin wave
        float blinkFactor = sin(uTimeFactor * uBlinkInterval);
        
        // Convert sin wave (-1 to 1) to mix factor (0 to 1)
        float mixFactor = (blinkFactor + 1.0) * 0.5;
        
        if (uState == 1) {
            // Takeoff - smooth mix between normal (H) and UP textures
            gl_FragColor = mix(normalTexture, upTexture, mixFactor);
        } else if (uState == 2) {
            // Landing - smooth mix between normal (H) and DOWN textures
            gl_FragColor = mix(normalTexture, downTexture, mixFactor);
        }
    }
}