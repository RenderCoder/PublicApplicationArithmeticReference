function zfill(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex.toUpperCase()
}

function weekToNumber(weekset) {
    console.log('weekset', weekset)
    return parseInt(weekset, 2)
}

var generate = {
    timingModel: function() {
        return {
            enable: true,
            week: '0000101',
            repeat: true,
            item: [
                {
                    enable: true,
                    switch: true,
                    hour: '08',
                    minute: '00'
                },
                {
                    enable: false,
                    switch: false,
                    hour: '23',
                    minute: '59'
                }
            ]
        }
    },
    singleTimingData: function(model) {
        var resultArray = []

        var enable = model.enable
        enable = enable ? '1' : '0'

        var week = model.week
        var repeat = model.repeat
        var weekSet = weekToNumber((repeat ? '1' : '0') + week)

        var itemSettings = []
        for (var i=0,len=model.item.length; i<len; i++) {
            var item = model.item[i]
            var r = [
                item.enable?'1':'0', 
                item.switch?'1':'0', 
                item.hour, 
                item.minute
            ]
            // itemSettings.push(r)
            itemSettings = itemSettings.concat(r)
        }
        // console.log('itemSettings', itemSettings)

        resultArray = resultArray.concat([enable], [weekSet], itemSettings)
        var result = resultArray.map(function(item, index) {
            item = item.toString()
            return decimalToHex(item)
        })
        .join(' ')
        return result

    },
    fullTimingData: function() {
        var timingCount = 10
        var timingArray = []
        var result = [decimalToHex(timingCount)]
        for (var i=0; i<timingCount; i++) {
            var model = this.timingModel()
            timingArray.push(model)
            var id = decimalToHex(i)
            result = result.concat(id, this.singleTimingData(model))
        }
        return result.join(' ')
    }
}

var parse = {
    fromTimingDataString: function(timingDataString) {
        timingDataString = timingDataString.replace(/^\s+|\s+$/ig, '')

        // 自动添加空格
        if (/^\w+$/.test(timingDataString)) {
            var timingDataStringCache = '';
            for (var i=0,len=timingDataString.length; i<len; i++) {
                var item = timingDataString[i];
                if (i>0 && i%2==0) {
                    timingDataStringCache += ' ';
                }
                timingDataStringCache += item;
                // console.log(item);
            }
            timingDataString = timingDataStringCache;
        }

        var originalSplitArray = timingDataString.split(/\s+/ig)
        console.log('originalSplitArray', originalSplitArray)

        var timingCount = originalSplitArray[0]
        timingCount = parseInt(timingCount, 16)
        console.log('timingCount', timingCount)

        var timingDataArray = originalSplitArray.slice(1)
        console.log('timingDataArray', timingDataArray)

        var lengthForPerItem = timingDataArray.length / timingCount
        var itemArray = []
        var itemCache = []
        for(var i=0,len=timingDataArray.length; i<len; i++) {
            if (i % lengthForPerItem === 0 && i !== 0) {
                itemArray.push(itemCache)
                itemCache = []
            }
            var item = parseInt(timingDataArray[i], 16)
            // parse week repeat
            if ( itemCache.length === 2 ) {
                item = zfill(item.toString(2), 8)
            }
            itemCache.push(item)

            if (i+1 === len) {
                itemArray.push(itemCache)
                itemCache = []
            }
        }
        console.log('itemArray', itemArray)

        return itemArray
    },
    item: function(item) {
        var model = generate.timingModel()
        mode.id = item[0]
        model.enable = item[1] == '01'
        model.week = parseInt(item[2], 16).toString(2)
        mode.repeat = model.week[0] == '1'
    }
}


// console.log(generate.singleTimingData(generate.timingModel()))
var timingDataString = generate.fullTimingData()
console.log('timingDataString', timingDataString)

// parse
var itemArray = parse.fromTimingDataString(timingDataString)

// render logic
var app = new Vue({
    el: '#app',
    data: {
        itemArray: itemArray || [],
        hexCommand: '',
        updateHexCommandCache: '',
        xx: ''
    },
    computed: {
        updateHexCommand: {
            get: function() {
                /*
                var timingCount = this.itemArray.length
                var timingArray = []
                var result = [decimalToHex(timingCount)]
                for (var i=0; i<timingCount; i++) {
                    var item = this.itemArray[i]
    
                    var model = generate.timingModel()
                    model.id = item[0]
                    model.enable = item[1] == '01'
                    model.week = parseInt(item[2], 16).toString(2).slice(1)
                    model.repeat = model.week[0] == '1'
                    
                    model.item[0].enable = item[3]
                    model.item[0].switch = item[4]
                    model.item[0].hour = item[5]
                    model.item[0].minute = item[6]
    
                    model.item[1].enable = item[7]
                    model.item[1].switch = item[8]
                    model.item[1].hour = item[9]
                    model.item[1].minute = item[10]
                    
                    timingArray.push(model)
                    var id = decimalToHex(i)
                    result = result.concat(id, generate.singleTimingData(model))
                }
    
                console.log(result)
                this.updateHexCommandCache = result.join(' ')
                */
                return this.updateHexCommandCache
            },
            set: function(val) {
                // console.log(val)
                this.updateHexCommandCache = val
            }
        },
        generateHexCommand: function() {
            var timingCount = this.itemArray.length
            var timingArray = []
            var result = [decimalToHex(timingCount)]
            for (var i=0; i<timingCount; i++) {
                var item = this.itemArray[i]

                var model = generate.timingModel()
                model.id = item[0]
                model.enable = item[1] == '01'
                model.week = item[2].slice(1)
                model.repeat = item[2][0] == '1'
                
                model.item[0].enable = item[3]
                model.item[0].switch = item[4]
                model.item[0].hour = item[5]
                model.item[0].minute = item[6]

                model.item[1].enable = item[7]
                model.item[1].switch = item[8]
                model.item[1].hour = item[9]
                model.item[1].minute = item[10]
                // console.log(model)

                timingArray.push(model)
                var id = decimalToHex(i)
                result = result.concat(id, generate.singleTimingData(model))
            }

            return result.join(' ')
        }
    },
    methods: {
        addItem: function() {
            var item = this.itemArray.length > 0 ? this.itemArray[this.itemArray.length-1] : [
                9,
                1,
                "10000101",
                1,
                1,
                8,
                0,
                0,
                0,
                23,
                59
              ]
            this.itemArray.push(item)
        },
        removeItem: function(index) {
            console.log('remove item at index: ' + index)
            this.itemArray.splice(index, 1)
        },
        parseCommand: function() {
            this.itemArray = parse.fromTimingDataString(this.updateHexCommand)
        }
    },
    watch: {
    }
})