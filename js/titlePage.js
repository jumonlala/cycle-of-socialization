
var width = window.innerWidth;
var height = window.innerHeight;

var title = d3.select("#titlePage").append("svg")
    .attr("width", width)
    .attr("height", height);

var widthScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, width]);

var heightScale = d3.scaleLinear()
    .domain([0,1])
    .range([0, height]);

var radiusScale = d3.scaleLinear()
    .domain([0,1])
    .range([10, 100]);

var colorScale = d3.scaleOrdinal(d3.schemeTableau10);

var simulation;

function initTitle(){
    var nodes = [];

    for (var i = 0; i< 15; i++){
        nodes.push({
            index: i,
            x: widthScale(Math.random()),
            y: heightScale(Math.random()),
            vx: Math.random()*100,
            vy: Math.random()*100,
            radius: radiusScale(Math.random()),
            color: colorScale(i)
        })
    };

    // wait until the nodes are created to create the simulation
    var promise = new Promise(function(resolve, reject) {
        if (nodes.length >=10) {
            resolve();
        };
    });

    promise.then(function() {
        // Code to execute after nodes are filled
        simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width/2, height/2))
        .force("collision", d3.forceCollide().radius((d)=>radiusScale(Math.random())))
        .force("x", d3.forceX().strength(0.05).x(d => d.x))
        .force("y", d3.forceY().strength(0.05).y(d => d.y))
        .alpha(0.1);

        title.selectAll(".node")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", (d)=> d.radius)
            .attr("fill", (d)=> d.color);
        
        simulation.on("tick", function(){
            title.selectAll(".node")
                .attr("cx", (d)=>d.x += d.vx)
                .attr("cy", (d)=>d.y += d.vy);
        });
    });

    setTimeout(function(){
        $('#downArrow').html("&#x2193").fadeIn(800);
    }, 1000);

    var arrowBlink = setInterval(function() {
        $('#downArrow').fadeOut(800).fadeIn(800);
    }, 1000);

    $(window).on("scroll", function() {
        if(window.scrollY > height/2){
            simulation.stop();
            clearInterval(arrowBlink);
        }else{
            simulation.alpha(0.1).restart();
        }
    });
}