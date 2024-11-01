var width = window.innerWidth;
var height = window.innerHeight;

var colorScale = d3.scaleOrdinal(d3.schemeTableau10);
var xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
var yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
var tickCount = 0;

CollideChart = function(_parentElement) {
    this.parentElement = _parentElement;
    this.svg = d3.select(this.parentElement).append("svg")
        .attr("width", width)
        .attr("height", height);
    this.nodes = [];
    this.shapes = [d3.symbolCircle, d3.symbolCross, d3.symbolDiamond, d3.symbolSquare, d3.symbolStar, d3.symbolTriangle];
    this.charges = [-500, -150, -100, 150, 200, -80];
    this.centerRadius = 30; // Radius of central gravitational area
    this.gravityRadius = 100; // Radius within which nodes start orbiting
    this.loadData();
};



CollideChart.prototype.loadData = function() {
    var vis = this;

    // Remove nodes too close to center if necessary
    vis.nodes = vis.nodes.filter(d => {
        if (d.charge === -500) return true;
        var dx = d.x - width / 2;
        var dy = d.y - height / 2;
        var distance = Math.sqrt(dx * dx + dy * dy);
        return distance > vis.centerRadius;
    });

    if (vis.nodes.length < 100) {
        for (var i = 0; i < Math.min(3, 100 - vis.nodes.length); i++) {
            var rand = Math.random();
            var randIdx = Math.floor(rand * 6);

            var charge = vis.shapes[randIdx] === d3.symbolCircle ? -500 : vis.charges[randIdx];
            
            // Randomize initial velocities with direction and magnitude
            var angle = Math.random() * 2 * Math.PI;  // Random angle in radians
            var speed = Math.random() * 0.5 + 0.2;    // Random speed, adjust range as needed
            var vx = Math.cos(angle) * speed;
            var vy = Math.sin(angle) * speed;

            vis.nodes.push({
                index: vis.nodes.length,
                x: xScale(rand),
                y: yScale(rand),
                radius: 5 + Math.random() * 10,
                vx: vx,
                vy: vy,
                color: colorScale(randIdx),
                path: d3.symbol().type(vis.shapes[randIdx]).size(800)(),
                charge: charge,
                orbiting: false
            });
        }
    }

    vis.initVis();
};

CollideChart.prototype.ticked = function() {
    var vis = this;
    tickCount++;

    var addedNodes = vis.svg.selectAll(".node")
        .data(vis.nodes, d => d.index);

    addedNodes.enter()
        .append("path")
        .attr("class", "node")
        .attr("d", d => d.path)
        .attr("fill", d => d.color)
        .attr("transform", d => `translate(${width / 2}, ${height / 2})`)
        .transition()
        .duration(500)
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    addedNodes.exit().remove();

    vis.svg.selectAll(".node")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);

    vis.nodes.forEach(d => {
        var dx = d.x - width / 2;
        var dy = d.y - height / 2;
        var distance = Math.sqrt(dx * dx + dy * dy);

        // Apply gravitational attraction toward the center for all nodes
        if (!d.orbiting && distance < vis.gravityRadius) {
            d.orbiting = true; // Mark node as orbiting once it’s within range
        }

        if (d.orbiting) {
            // Calculate tangential velocity for orbit effect
            var angle = Math.atan2(dy, dx);
            var tangentialSpeed = 0.02;
            d.vx = -Math.sin(angle) * tangentialSpeed;
            d.vy = Math.cos(angle) * tangentialSpeed;

            // Small radial pull to keep nodes near the orbit radius
            var radialForce = (vis.gravityRadius - distance) * 0.001;
            d.vx += (dx / distance) * radialForce;
            d.vy += (dy / distance) * radialForce;
        } else {
            // Gravitational pull towards the center before orbiting
            var gravityStrength = 0.02;
            d.vx += (width / 2 - d.x) * gravityStrength;
            d.vy += (height / 2 - d.y) * gravityStrength;
        }
    });

    // Load more nodes over time
    if (tickCount % 1000 === 0) {
        vis.loadData();
    }
};

CollideChart.prototype.initVis = function() {
    var vis = this;

    vis.center = vis.svg.append("circle")
        .attr("class", "center")
        .attr("r", vis.centerRadius)
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "purple")
        .attr("opacity", 1);

    var simulation = d3.forceSimulation(vis.nodes)
        .force("charge", d3.forceManyBody().strength(d => d.charge))
        .force("collide", d3.forceCollide().radius(15))
        .alphaTarget(0.3)
        .velocityDecay(0.5)
        .on("tick", function() {
            tickCount++;
            vis.ticked();
        });
    
    vis.updateVis();
};

CollideChart.prototype.updateVis = function() {
    var vis = this;

    var addedNodes = vis.svg.selectAll(".node")
        .data(vis.nodes);

    addedNodes.enter()
        .append("path")
        .attr("class", "node")
        .attr("d", d => d.path)
        .attr("fill", d => d.color)
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .transition()
        .duration(800);

    addedNodes.exit().remove();
};
