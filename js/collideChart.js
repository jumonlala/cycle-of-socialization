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
    this.links = [];
    this.shapes = [d3.symbolCircle, d3.symbolCross, d3.symbolDiamond, d3.symbolSquare, d3.symbolStar, d3.symbolTriangle, d3.symbolWye];
    this.charges = [100, -150, -100, 70, -80, 40, -50];
    this.loadData();
};

CollideChart.prototype.loadData = function() {
    var vis = this;

    vis.nodes = vis.nodes.filter(d => d.x >= 5 || d.x <= width - 5 || d.y >= 5 || d.y <= height - 5 || Math.abs(d.x - width/2) > 10 || Math.abs(d.y - height/2) > 10);

    vis.links = vis.links.filter(d => d.source.x >= 5 || d.source.x <= width - 5 || d.source.y >= 5 || d.source.y <= height - 5
            || d.target.x >= 5 || d.target.x <= width - 5 || d.target.y >= 5 || d.target.y <= height - 5
            || Math.abs(d.source.x - width/2) > 10 || Math.abs(d.source.y - height/2) > 10 || Math.abs(d.target.x - width/2) > 10 || Math.abs(d.target.y - height/2) > 10);
    
    for (var i = 0; i < tickCount; i++) {
        var rand = Math.random();
        var randIdx = Math.floor(rand * 7);
        vis.nodes.push({
            index: i,
            x: xScale(rand),
            y: yScale(rand),
            radius: Math.random() * 100 + 100,
            vx: (randIdx === 0 || randIdx === 3) ? 0 : Math.random() * 20,  // Circles (0) and Squares (3)
            vy: (randIdx === 0 || randIdx === 3) ? 0 : Math.random() * 20,
            color: colorScale(Math.random()),
            path: d3.symbol().type(vis.shapes[randIdx]).size(800)(),
            charge: vis.charges[randIdx]
        });
    }

    for (var i = 0; i < tickCount/2; i++){
        vis.links.push({
            source: Math.floor(Math.random() * vis.nodes.length),
            target: Math.floor(Math.random() * vis.nodes.length)
        });
    }

    vis.initVis();
};

CollideChart.prototype.initVis = function() {
    var vis = this;

    vis.center = vis.svg.append("circle")
        .attr("class", "center")
        .attr("r", 30)
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "purple")
        .attr("opacity", 1);

    vis.ticked = function() {
        tickCount++;
        vis.svg.selectAll(".node")
            .attr("transform", d => `translate(${d.x}, ${d.y})`);

        if (tickCount % 10 === 0) {
            vis.loadData();
        }        
    };
    
    // Start the simulation
    var simulation = d3.forceSimulation(vis.nodes)
        .force("center", d3.forceCenter(width / 2, height / 2)) // Center force
        .force("charge", d3.forceManyBody().strength(d => d.charge))
        .force("collide", d3.forceCollide().radius(d => d.radius))
        .force("link", d3.forceLink(vis.links).distance(100))
        .alphaTarget(0.3)
        .velocityDecay(0.5)
        .on("tick", vis.ticked);
    
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
        .attr("transform", d => `translate(${d.x}, ${d.y})`); // Initial position

    addedNodes.exit().remove();
};
