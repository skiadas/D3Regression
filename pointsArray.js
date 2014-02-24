PointsArray = function() {
    function PointsArray() {
        this.values = [];
        // Instance counter that keeps track of points as they are added/removed.
        // Each new point gets a new counter value regardless of how many points there are.
        // Used as a key for the data.
        var gCount = 0;
        this.newCount = function() { gCount++; return gCount; }
        this.updateStats();
        return this;
    }
    PointsArray.prototype = {
        addPoint: function addPoint(coords) {
            this.values.push({ key: this.newCount(), value: coords });
            this.updateStats();
            return this;
        },
        findPoint: function findPoint(coords) {
            var values = this.values,
                i = 0;
            while (i < values.length) {
                if (values[i].value[0] === data[0] && values[i].value[1] === data[1]) {
                    return values[i].key;
                }
                i++;
            }
            return -1;
        },
        findByKey: function findByKey(key) {
            var values = this.values,
                i = 0;
            while (i < values.length) {
                if (values[i].key === key) {
                    return values[i];
                }
                i++;
            }
            return null;
        },
        removePoint: function removePoint(point) {
            var values = this.values,
                i = 0;
            while (i < values.length) {
                if (values[i].key === point.key) {
                    values.splice(i, 1);
                    this.updateStats();
                    break;
                }
                i++;
            }
            return this;
        },
        updateStats: function() {
            var xs = this.values.map(function(d) { return d.value[0]; }),
                ys = this.values.map(function(d) { return d.value[1]; }),
                length = xs.length,
                meanx = xs.reduce(function(acc, x) { return acc+x; }, 0) / length,
                meany = ys.reduce(function(acc, x) { return acc+x; }, 0) / length,
                sumSqx = xs.reduce(function(acc, x) { return acc+x*x; }, 0),
                sumSqy = ys.reduce(function(acc, x) { return acc+x*x; }, 0),
                varx = (sumSqx - length*meanx*meanx)/(length - 1),
                vary = (sumSqy - length*meany*meany)/(length - 1),
                sdx = Math.sqrt(varx),
                sdy = Math.sqrt(vary),
                corrNum = xs.reduce(function(acc, x, i) { return acc+x*ys[i]}, 0) - length * meanx * meany,
                corr = corrNum / ((length-1) * sdx * sdy),
                slope = corr * sdy / sdx;
            this.stats = {
                length: length,
                meanx: meanx, meany: meany,
                varx: varx, vary: vary,
                sdx: sdx, sdy: sdy,
                corr: corr,
                slope: corr * sdy / sdx,
                intercept: meany - slope * meanx
            };
        }
    }
    return PointsArray;
}();  // Immediate invocation.
