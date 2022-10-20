function breathe() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    const padding = 2;
    const external_padding = 10;
    const yy_r = (Math.min(width, height) - (2 * padding) - external_padding) / 2;
    let movable_id = 0;
    let big = 0.5 * yy_r;
    let small = 0.125 * yy_r;

    let breath_len = 5000
    let box = true;

    d3.select("#nSeconds").on("input", function() {
        breath_len = this.value * 1000;
        d3.select("#sLabel").text(`${this.value} seconds per breath`)
    });

    d3.selectAll('input[name="breathing-pattern"]').on("click", function() {
        console.log(this.value);
        box = this.value == "box";
    }).node().value

    let text = d3.select("#instructions")

    let svg = d3.select("#chart").append("svg")
          .attr("viewBox", `0 0 ${width} ${height}`)
          .classed("svg-content-responsive", true)
        .append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .append("g");

    // fixed enclosure
    svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r",  yy_r + padding)
        .attr("class", "back");

    yang_path = `M 0 ${yy_r} a ${yy_r} ${yy_r} 0 0 1 0 ${-2*yy_r} ` +
                `a ${big} ${big} 0 0 1 0 ${yy_r} ` +
                `a ${big} ${big} 0 0 0 0 ${yy_r} Z`;

    yin_path = `M 0 ${yy_r} a ${yy_r} ${yy_r} 0 0 0 0 ${-2*yy_r} ` +
                `a ${big} ${big} 0 0 1 0 ${yy_r} ` +
                `a ${big} ${big} 0 0 0 0 ${yy_r} Z`;

    const arcData_yang = [
        {
            "movable_id": ++movable_id,
            "path": yang_path,
            "class_name": "yang movable arc"
        }
    ];

    const arcData_yin = [
        {
            "movable_id": ++movable_id,
            "path": yin_path,
            "class_name": "yin movable arc"
        }
    ];

    svg.append("clipPath")
            .attr("id", "yang-rect-clip")
        .append("rect")
            .attr("width", yy_r * 2)
            .attr("y", yy_r) // adjust this
            .attr("x", -yy_r)
            .attr("height", 2 * yy_r);

    svg.append("clipPath")
            .attr("id", "yin-rect-clip")
        .append("rect")
            .attr("width", yy_r * 2)
            .attr("y", -yy_r)
            .attr("x", -yy_r)
            .attr("height", 0); // adjust this

    let yang = svg.selectAll("path.movable")
        .data(arcData_yang, function(d) { return d.movable_id; })
        .enter()
        .append("path")
        .attr("d", function(d)  { return d.path; })
        .attr("class", function(d)  { return d.class_name; })
        .attr("clip-path", "url(#yang-rect-clip)");

    let yin = svg.selectAll("path.movable")
        .data(arcData_yin, function(d) { return d.movable_id; })
        .enter()
        .append("path")
        .attr("d", function(d)  { return d.path; })
        .attr("class", function(d)  { return d.class_name; })
        .attr("clip-path", "url(#yin-rect-clip)");

    svg.append("circle")
        .attr("id", "yin-small")
        .attr("class", "yin")
        .attr("cx", 0)
        .attr("cy", -yy_r / 2)
        .attr("r", 0);

    svg.append("circle")
        .attr("id", "yang-small")
        .attr("class", "yang")
        .attr("cx", 0)
        .attr("cy", yy_r / 2)
        .attr("r", 0);

    let yinSmall = svg.select("#yin-small");
    let yangSmall = svg.select("#yang-small");

    let yangBound = svg.select("#yang-rect-clip").select("rect");
    let yinBound = svg.select("#yin-rect-clip").select("rect");

    function drawYang() {
        yin.transition().duration(breath_len).style("opacity", 0);
        yangSmall.transition().duration(breath_len).style("opacity", 0);
        yang.style("opacity", 1);

        text
            .transition()
                .duration(breath_len)
                .text("Inhale")

        if (box) {
            yinSmall
                .style("opacity", 1)
                .attr("r", 0)
                .transition()
                .ease(d3.easeLinear)
                .delay(breath_len)
                .duration(breath_len)
                .attr("r", small)
                .on('end', drawYin);
            text
                .transition()
                    .delay(breath_len)
                    .duration(breath_len)
                    .text("Hold")
        } else {
            yinSmall
                .attr("r", small)
                .transition()
                .delay(breath_len / 2)
                .duration(breath_len / 2)
                .style("opacity", 1)
                .on('end', drawYin);
        }

        yangBound
            .attr("y", yy_r)
            .transition()
            .ease(d3.easeLinear)
            .duration(breath_len)
            .attr("y", -yy_r);
    };

    function drawYin() {
        yang.transition().duration(breath_len).style("opacity", 0);
        yinSmall.transition().duration(breath_len).style("opacity", 0);
        yin.style("opacity", 1);

        text
            .transition()
                .duration(breath_len)
                .text("Exhale")
            .transition()
                .duration(breath_len)
                .text("Hold")

        if (box) {
            yangSmall
                .style("opacity", 1)
                .attr("r", 0)
                .transition()
                .ease(d3.easeLinear)
                .delay(breath_len)
                .duration(breath_len)
                .attr("r", small)
                .on('end', drawYang);
            text
                .transition()
                    .delay(breath_len)
                    .duration(breath_len)
                    .text("Hold")
        } else {
            yangSmall
                .attr("r", small)
                .transition(breath_len)
                .delay(breath_len / 2)
                .duration(breath_len / 2)
                .style("opacity", 1)
                .on('end', drawYang);
        }

        yinBound
            .attr("height", 0)
            .transition()
            .ease(d3.easeLinear)
            .duration(breath_len)
            .attr("height", 2 * yy_r)
    }

    drawYang();

}
breathe();