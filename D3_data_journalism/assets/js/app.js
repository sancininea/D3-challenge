// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Selección inicial
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Cambia la escala del eje x cuando cambias de selección
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
            d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    return xLinearScale;
}

// Cambia la escala del eje y cuando cambias de selección
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
            d3.max(data, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);
    return yLinearScale;
}

// Cambia el eje x cuando seleccionas una opción nueva
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Cambia el eje y cuando seleccionas una opción nueva
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}


// Actualiza bolitas con movimiento
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// Actualiza etiquetas de las bolitas con movimiento
function renderCirclesLabels(circleLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circleLabels.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]) + 5);
    return circleLabels;
}

// Actualiza tooltips de las bolitas
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    if (chosenXAxis === "poverty") {
        var label = "Poverty:";
    } else if (chosenXAxis === "age") {
        var label = "Age:";
    } else {
        var label = "Household income:";
    }

    if (chosenYAxis === "healthcare") {
        var label2 = "Lack of Healthcare:";
    } else if (chosenYAxis === "smokes") {
        var label2 = "Smoke:";
    } else {
        var label2 = "Obesity:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${label2} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(data) {

    // Convertir en númericos los datos que usaremos
    data.forEach(d => {
        d.poverty = +d.poverty;
        d.healthcare = +d.healthcare;
        d.age = +d.age;
        d.income = +d.income;
        d.smokes = +d.smokes;
        d.obesity = +d.obesity;
    });

    // Funciones escalares (En lugar de asignar normal, usar función nueva)
    var xLinearScale = xScale(data, chosenXAxis);
    var yLinearScale = yScale(data, chosenYAxis);;

    // Funciones de ejes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Poner eje x a la gráfica (Ahora con variable para poder modificarla después)
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Poner eje y fijo
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Crear bolitas
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("fill", "rgb(138, 188, 213)")
        .attr("opacity", "0.8");

    // Crear etiquetas
    var circleLabels = chartGroup.selectAll(null)
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]) + 5)
        .text(d => d.abbr)
        .attr("fill", "white")
        .attr("text-anchor", "middle");

    // Crear grupo para los ejes x
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    // Etiquetas eje x
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 5)
        .attr("value", "poverty")
        .classed("active", true)
        .style("font-size", "12px")
        .text("In Poverty %");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age")
        .classed("inactive", true)
        .style("font-size", "12px")
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("value", "income")
        .classed("inactive", true)
        .style("font-size", "12px")
        .text("Household Income");

    // Crear grupo para los ejes y
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    // Etiquetas eje Y
    var healthLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .classed("active", true)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .text("Lacks healthcare %");

    var smokesLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 25)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .classed("inactive", true)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .text("Smokes %");

    var obeseLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .classed("inactive", true)
        .attr("dy", "1em")
        .style("font-size", "12px")
        .text("Obese %");

    // Poner tooltips
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Event listener para eje X
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                chosenXAxis = value;
                xLinearScale = xScale(data, chosenXAxis);
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circleLabels = renderCirclesLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });


    // Event listener para eje Y
    labelsGroupY.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                chosenYAxis = value;
                yLinearScale = yScale(data, chosenYAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circleLabels = renderCirclesLabels(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                if (chosenYAxis === "healthcare") {
                    healthLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

}).catch(function(error) {
    console.log(error);
});