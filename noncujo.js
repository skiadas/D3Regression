var width = 500;
var height = 500;

pointsArray = new PointsArray();
var keyFun = function(d) { return d.key; };
pointsArray.addPoint([0.2,0.8]).addPoint([0.5,0.5]).addPoint([0.4, 0.1]);

var svg = d3.select("svg").attr({ width: width+"px", height: height+"px"});
svg.append("line").classed("regression", true).attr({
    "stroke-width": "2px", stroke: "blue"
});
svg.append("line").classed("residual", true).attr({
    "stroke-width": "1px", stroke: "gray"
});
svg.append("circle").classed("linepoint", true).attr({ r: "2px", fill: "red" });
var pointsTable = d3.select("#points table");
var coordsRow = d3.select("#coords table tr.val");


// Scaling and formatting
var xscale = d3.scale.linear().range([0, width]);  // Linear scale converting [0,1]
var yscale = d3.scale.linear().range([height, 0]);
function invScale(d) { return [xscale.invert(d[0]), yscale.invert(d[1])]; };
var format = d3.format(" 4.3f");  // Use extra space in front of positive values; 3 decimals, min 4 digits

function getIndex(key) { return function(d) { return d.value[key]; }; }
function scaled(scale, fun) { return function(d) { return scale(fun(d)); } }
function id(x) { return x; }
function pixelated(fun) { return function(d) { return fun(d) + "px"; }; }
var xfix = pixelated(scaled(xscale, getIndex(0)));
var yfix = pixelated(scaled(yscale, getIndex(1)));


function repaint() {
    paintPoints();
    paintLine();
    fillPointTable();
    updateCoords();
}

// Places the points
function paintPoints() {
    console.log("Repainting")
    var circles = svg.selectAll("circle.point").data(pointsArray.values, keyFun);
    circles.exit().remove();
    circles.enter()
        .append("circle").attr("r", "5px")
        .classed("point", true)
        .attr("cx", xfix).attr("cy", yfix)
        .on("mouseover", highlightOn)
        .on("mouseout", highlightOff);
}

// Draws the regression line
function paintLine() {
    var stats = pointsArray.stats,
        a = stats.intercept,
        b = stats.slope;
        if (!isNaN(a) && !isNaN(b)) {
            svg.selectAll("line.regression")
                .transition().duration(1500)
                .attr({
                    x1: xscale(0) + "px", y1: yscale(a + b * 0) + "px",
                    x2: xscale(1) + "px", y2: yscale(a + b * 1) + "px",
                });
        } else {
            svg.selectAll("line.regression")
                .attr({ x1: 0, y1: 0, x2: 0, y2: 0 });
        }
}

// Populates the point table
function fillPointTable() {
    var allPoints = pointsTable.selectAll("tr.val").data(pointsArray.values, keyFun);
    allPoints.exit().remove();
    var newPoints = allPoints.enter().append("tr").attr("class", "val");
    newPoints
        .on("mouseover", highlightOn)
        .on("mouseout", highlightOff)
        .selectAll("td").data(function(d) {return d.value; })
        .enter()
        .append("td").html(format);
    newPoints
        .style({ opacity: 0.2, "background-color": "gray" })
        .transition().duration(1500).ease("linear")
        .style({ opacity: 1, "background-color": "white" });
}

// Turns mouse coordinates into scaled coordinates
function getCoords() {
    return invScale(d3.mouse(svg.node()));
}
// Updates the coordinates section based on the current cursor location.
function updateCoords() {
    if (d3.event != null) { // Only do this in reaction to a dom event
        var stats = pointsArray.stats,
            newCoords = getCoords();
        newCoords[2] = stats.intercept + stats.slope * newCoords[0];
        newCoords[3] = newCoords[1] - newCoords[2];
        coordsRow.selectAll("td").data(newCoords).html(format);
        var point = svg.selectAll("circle.linepoint");
        point.attr({ 
            cx: xscale(newCoords[0]),
            cy: yscale(newCoords[stats.length > 1 ? 2 : 1]) // If no predicted line, use mouse point
        });
    }
}

// Is the event triggered by a circle in the graph
function isMouseCircle() {
    var el = d3.event.toElement;
    return el.nodeName === "circle" && el.className.baseVal.match(/\bpoint\b/);
}
// Reacts to a clicked location by adding or removing a point
function locationClicked() {
    if (d3.event.defaultPrevented) return;
    isMouseCircle() ? removePoint() : addPoint();
}
// Adds a point based on the clicked location
function addPoint() {
    pointsArray.addPoint(getCoords());
    repaint();
}
// Removes a clicked point
function removePoint() {
    var circle = d3.select(d3.event.toElement);
    var data = circle.data()[0];
    pointsArray.removePoint(data);
    repaint();
}

function highlightOn(data) {
    pointsTable.selectAll("tr.val")
        .filter(function(d) { return d.key == data.key; })
        .classed("highlight", true);
    svg.selectAll("circle.point")
        .filter(function(d) { return d.key == data.key; })
        .classed("highlight", true);
    var stats = pointsArray.stats,
        a = stats.intercept,
        b = stats.slope,
        x = data.value[0],
        y = data.value[1],
        ypred = a + b * x;
        if (isNaN(ypred)) {
            svg.selectAll("line.residual").attr({
                x1: xscale(x) + "px", y1: 0,
                x2: xscale(x) + "px", y2: 0,
            });
        } else {
            svg.selectAll("line.residual").attr({
                x1: xscale(x) + "px", y1: yscale(y)     + "px",
                x2: xscale(x) + "px", y2: yscale(ypred) + "px",
            });
        }

}
function highlightOff(data) {
    pointsTable.selectAll("tr.val")
        .filter(function(d) { return d.key == data.key; })
        .classed("highlight", false);
    svg.selectAll("circle.point")
        .filter(function(d) { return d.key == data.key; })
        .classed("highlight", false);
    svg.selectAll("line.residual").attr({
        x1: 0, y1: 0,
        x2: 0, y2: 0,
    });

}

svg.on("mousemove", updateCoords);
svg.on("click", locationClicked);
repaint();

