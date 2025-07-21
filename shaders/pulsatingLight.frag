#ifdef GL_ES
precision mediump float;
#endif

uniform float uTimeFactor;
uniform int uState; // 0 = off, 1 = pulsating
uniform vec3 uLightColor;

varying vec3 vNormal;

void main() {
    if (uState == 0) {
        // Light off - dark gray
        gl_FragColor = vec4(0.1, 0.1, 0.1, 1.0);
    } else {
        // Pulsating light
        float pulse = (sin(uTimeFactor * 0.005) + 1.0) * 0.5; // 0 to 1
        float emission = pulse * 3.0;
        
        vec3 color = uLightColor + vec3(emission * 0.8, emission * 0.6, emission * 0.2);
        gl_FragColor = vec4(color, 1.0);
    }
}