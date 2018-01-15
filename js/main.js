var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        white: 0,
        h: 0,
        s: 100,
        b: 100,
        color_layer_opacity: 0,
        color_temperature: 0,
        rgb: { r: 0, g: 0, b: 0 },
        hsl: [0, 0, 0]
    },
    methods: {
        hsv_to_hsl: function (h, s, v) {
            // both hsv and hsl values are in [0, 1]
            var l = (2 - s) * v / 2;

            if (l != 0) {
                if (l == 1) {
                    s = 0
                } else if (l < 0.5) {
                    s = s * v / (l * 2)
                } else {
                    s = s * v / (2 - l * 2)
                }
            }

            return [h, s, l]
        },
        calculateHSL: function (hsv) {
            // determine the lightness in the range [0,100]
            var l = (2 - hsv.s / 100) * hsv.v / 2;

            // store the HSL components
            hsl =
                {
                    'h': hsv.h,
                    's': hsv.s * hsv.v / (l < 50 ? l * 2 : 200 - l * 2),
                    'l': l
                };

            // correct a division-by-zero error
            if (isNaN(hsl.s)) hsl.s = 0;
            return hsl
        }
    },
    watch: {
        color_temperature: function (val, oldVal) {
            console.log('new: %s, old: %s', val, oldVal)
            this.h = val > 50 ? 54 : 205
            this.color_layer_opacity = Math.abs(val - 50) / 50 * 100 * 0.5 // 0.5 为总体透明度系数
            // this.rgb = this.hsv_to_hsl(this.h, this.s, this.b)
            hsl = this.calculateHSL({h:this.h, s:this.s, v:this.b})
            this.hsl = 'hsl(' + hsl.h + ',' + hsl.s  + '%,' + hsl.l + '%)'
        }
    }
})