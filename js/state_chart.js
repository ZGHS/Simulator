// define a custom ForceDirectedLayout for this sample
function DemoForceDirectedLayout() {
    go.ForceDirectedLayout.call(this);
}

go.Diagram.inherit(DemoForceDirectedLayout, go.ForceDirectedLayout);

// Override the makeNetwork method to also initialize
// ForceDirectedVertex.isFixed from the corresponding Node.isSelected.
DemoForceDirectedLayout.prototype.makeNetwork = function (coll) {
    // call base method for standard behavior
    var net = go.ForceDirectedLayout.prototype.makeNetwork.call(this, coll);
    net.vertexes.each(function (vertex) {
        var node = vertex.node;
        if (node !== null) vertex.isFixed = node.isSelected;
    });
    return net;
};
// end DemoForceDirectedLayout class


// This variation on ForceDirectedLayout does not move any selected Nodes
// but does move all other nodes (vertexes).
function ContinuousForceDirectedLayout() {
    go.ForceDirectedLayout.call(this);
    this._isObserving = false;
}

go.Diagram.inherit(ContinuousForceDirectedLayout, go.ForceDirectedLayout);

ContinuousForceDirectedLayout.prototype.isFixed = function (v) {
    return v.node.isSelected;
};

// optimization: reuse the ForceDirectedNetwork rather than re-create it each time
ContinuousForceDirectedLayout.prototype.doLayout = function (coll) {
    if (!this._isObserving) {
        this._isObserving = true;
        // cacheing the network means we need to recreate it if nodes or links have been added or removed or relinked,
        // so we need to track structural model changes to discard the saved network.
        var lay = this;
        this.diagram.addModelChangedListener(function (e) {
            // modelChanges include a few cases that we don't actually care about, such as
            // "nodeCategory" or "linkToPortId", but we'll go ahead and recreate the network anyway.
            // Also clear the network when replacing the model.
            if (e.modelChange !== "" ||
                (e.change === go.ChangedEvent.Transaction && e.propertyName === "StartingFirstTransaction")) {
                lay.network = null;
            }
        });
    }
    var net = this.network;
    if (net === null) {  // the first time, just create the network as normal
        this.network = net = this.makeNetwork(coll);
    } else {  // but on reuse we need to update the LayoutVertex.bounds for selected nodes
        this.diagram.nodes.each(function (n) {
            var v = net.findVertex(n);
            if (v !== null) v.bounds = n.actualBounds;
        });
    }
    // now perform the normal layout
    go.ForceDirectedLayout.prototype.doLayout.call(this, coll);
    // doLayout normally discards the LayoutNetwork by setting Layout.network to null;
    // here we remember it for next time
    this.network = net;
};

// end ContinuousForceDirectedLayout


function chart_init() {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    // some constants that will be reused within templates
    var roundedRectangleParams = {
        parameter1: 2,  // set the rounded corner
        spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight  // make content go all the way to inside edges of rounded corners
    };

    myDiagram =
        $(go.Diagram, "myDiagramDiv",  // must name or refer to the DIV HTML element
            {
                "animationManager.initialAnimationStyle": go.AnimationManager.None,
                "InitialAnimationStarting": function (e) {
                    var animation = e.subject.defaultAnimation;
                    animation.easing = go.Animation.EaseOutExpo;
                    animation.duration = 900;
                    animation.add(e.diagram, 'scale', 0.1, 1);
                    animation.add(e.diagram, 'opacity', 0, 1);
                },

                // have mouse wheel events zoom in and out instead of scroll up and down
                "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                // support double-click in background creating a new node
                // "clickCreatingTool.archetypeNodeData": {text: "新状态"},
                // enable undo & redo
                "undoManager.isEnabled": true,


                // layout: new DemoForceDirectedLayout(), // use custom layout
                // other Layout properties are set by the layout function, defined below


                layout:
                    $(ContinuousForceDirectedLayout,  // automatically spread nodes apart while dragging
                        {defaultSpringLength: 60, defaultElectricalCharge: 120}),
                // do an extra layout at the end of a move


                // layout: $(go.LayeredDigraphLayout),
                // other Layout properties are set by the layout function, defined below
                positionComputation: function (diagram, pt) {
                    return new go.Point(Math.floor(pt.x), Math.floor(pt.y));
                }
            });

    myDiagram.addDiagramListener("ObjectSingleClicked", function (e) {
        var part = e.subject.part;
        if (!(part instanceof go.Link)) {
            if (part.data.m_type === 'object') {
                findTarget(part.data.id);
            }
            if (part.data.m_type === 'state') {
                console.log("重新加载状态"+part.data.id);
                reloadScene(part.data.id);
            }
        }
    });


    // define the Node template
    myDiagram.nodeTemplate =
        $(go.Node, "Auto",
            {
                locationSpot: go.Spot.TopCenter,
                isShadowed: true, shadowBlur: 1,
                shadowOffset: new go.Point(0, 1),
                shadowColor: "rgba(0, 0, 0, .14)"
            },
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            // define the node's outer shape, which will surround the TextBlock
            $(go.Shape, "RoundedRectangle", roundedRectangleParams,
                {
                    name: "SHAPE", fill: "#ffffff", strokeWidth: 0,
                    stroke: null,
                    portId: "",  // this Shape is the Node's port, not the whole Node
                    fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                    toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true,
                    cursor: "pointer"
                }),
            $(go.TextBlock,
                {
                    font: "bold small-caps 11pt helvetica, bold arial, sans-serif",
                    margin: 7,
                    stroke: "rgba(0, 0, 0, .87)",
                    // editable: true  // editing the text automatically updates the model data
                },
                new go.Binding("text").makeTwoWay())
        );


    // unlike the normal selection Adornment, this one includes a Button
    myDiagram.nodeTemplate.selectionAdornmentTemplate =
        $(go.Adornment, "Spot",
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", roundedRectangleParams,
                    {fill: null, stroke: "#7986cb", strokeWidth: 3}),
                $(go.Placeholder)  // a Placeholder sizes itself to the selected Node
            ),
            // the button to create a "next" node, at the top-right corner
            // $("Button",
            //     {
            //         alignment: go.Spot.TopRight,
            //         click: addNodeAndLink  // this function is defined below
            //     },
            //     $(go.Shape, "PlusLine", {width: 6, height: 6})
            // ), // end button
            // the button to create a "next" node, at the top-right corner
            // $("Button",
            //     {
            //         alignment: go.Spot.BottomRight,
            //         click: addPeropertyNode  // this function is defined below
            //     },
            //     $(go.Shape, "PlusLine", {width: 6, height: 6})
            // ) // end button
        ); // end Adornment

    myDiagram.nodeTemplateMap.add("Start",
        $(go.Node, "Spot", {desiredSize: new go.Size(75, 75)},
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "Circle",
                {
                    fill: "#52ce60", /* green */
                    stroke: null,
                    portId: "",
                    fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                    toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true,
                    cursor: "pointer"
                }),
            $(go.TextBlock, "Start",
                {
                    font: "bold 16pt helvetica, bold arial, sans-serif",
                    stroke: "whitesmoke"
                })
        )
    );

    myDiagram.nodeTemplateMap.add("End",
        $(go.Node, "Spot", {desiredSize: new go.Size(75, 75)},
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Shape, "Circle",
                {
                    fill: "maroon",
                    stroke: null,
                    portId: "",
                    fromLinkable: true, fromLinkableSelfNode: true, fromLinkableDuplicates: true,
                    toLinkable: true, toLinkableSelfNode: true, toLinkableDuplicates: true,
                    cursor: "pointer"
                }),
            $(go.Shape, "Circle", {
                fill: null,
                desiredSize: new go.Size(65, 65),
                strokeWidth: 2,
                stroke: "whitesmoke"
            }),
            $(go.TextBlock, "End",
                {
                    font: "bold 16pt helvetica, bold arial, sans-serif",
                    stroke: "whitesmoke"
                })
        )
    );

    // clicking the button inserts a new node to the right of the selected node,
    // and adds a link to that new node
    function addNodeAndLink(e, obj) {
        var adornment = obj.part;
        var diagram = e.diagram;
        diagram.startTransaction("Add State");

        // get the node data for which the user clicked the button
        var fromNode = adornment.adornedPart;
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the adorned Node
        var toData = {text: "新状态"};
        var p = fromNode.location.copy();
        p.x += 200;
        toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(toData);

        // create a link data from the old node data to the new node data
        var linkdata = {
            from: model.getKeyForNodeData(fromData),  // or just: fromData.id
            to: model.getKeyForNodeData(toData),
            text: "动作"
        };
        // and add the link data to the model
        model.addLinkData(linkdata);

        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);

        diagram.commitTransaction("Add State");

        // if the new node is off-screen, scroll the diagram to show the new node
        diagram.scrollToRect(newnode.actualBounds);
    }


    // 单击创建状态所涉及到的物体
    function addPeropertyNode(e, obj) {
        var adornment = obj.part;
        var diagram = e.diagram;
        diagram.startTransaction("Add State");

        // get the node data for which the user clicked the button
        var fromNode = adornment.adornedPart;
        var fromData = fromNode.data;
        // create a new "State" data object, positioned off to the right of the adorned Node
        var toData = {text: "物体"};
        var p = fromNode.location.copy();
        p.x += 200;
        toData.loc = go.Point.stringify(p);  // the "loc" property is a string, not a Point object
        // add the new node data to the model
        var model = diagram.model;
        model.addNodeData(toData);

        // create a link data from the old node data to the new node data
        var linkdata = {
            from: model.getKeyForNodeData(fromData),  // or just: fromData.id
            to: model.getKeyForNodeData(toData),
            text: "涉及"
        };
        // and add the link data to the model
        model.addLinkData(linkdata);

        // select the new Node
        var newnode = diagram.findNodeForData(toData);
        diagram.select(newnode);

        diagram.commitTransaction("Add State");

        // if the new node is off-screen, scroll the diagram to show the new node
        diagram.scrollToRect(newnode.actualBounds);
    }

    // replace the default Link template in the linkTemplateMap
    myDiagram.linkTemplate =
        $(go.Link,  // the whole link panel
            {
                curve: go.Link.Bezier,
                adjusting: go.Link.Stretch,
                reshapable: true, relinkableFrom: true, relinkableTo: true,
                toShortLength: 3
            },
            new go.Binding("points").makeTwoWay(),
            new go.Binding("curviness"),
            $(go.Shape,  // the link shape
                {strokeWidth: 1.5},
                new go.Binding('stroke', 'progress', function (progress) {
                    return progress ? "#52ce60" /* green */ : 'black';
                }),
                new go.Binding('strokeWidth', 'progress', function (progress) {
                    return progress ? 2.5 : 1.5;
                })
            ),
            $(go.Shape,  // the arrowhead
                {toArrow: "standard", stroke: null},
                new go.Binding('fill', 'progress', function (progress) {
                    return progress ? "#52ce60" /* green */ : 'black';
                }),
            ),
            $(go.Panel, "Auto",
                $(go.Shape,  // the label background, which becomes transparent around the edges
                    {
                        fill: $(go.Brush, "Radial",
                            {0: "rgb(245, 245, 245)", 0.7: "rgb(245, 245, 245)", 1: "rgba(245, 245, 245, 0)"}),
                        stroke: null
                    }),
                $(go.TextBlock, "动作",  // the label text
                    {
                        textAlign: "center",
                        font: "9pt helvetica, arial, sans-serif",
                        margin: 4,
                        // editable: true  // enable in-place editing
                    },
                    // editing the text automatically updates the model data
                    new go.Binding("text").makeTwoWay())
            )
        );

    // read in the JSON data from the "mySavedModel" element
    // load();
}

// Show the diagram's model in JSON format
// function save() {
//     document.getElementById("mySavedModel").value = myDiagram.model.toJson();
// }

function load(val) {
    myDiagram.model = go.Model.fromJson(val);
}

// function load() {
//     myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
// }