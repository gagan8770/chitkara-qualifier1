const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

function buildGraph(edges) {
    const graph = {};

    for (const edge of edges) {
        const [parent, child] = edge.split("->");

        if (!graph[parent]) graph[parent] = [];
        graph[parent].push(child);

        if (!graph[child]) graph[child] = [];
    }

    return graph;
}

function buildTree(graph, node) {

    const result = {};

    for (const child of graph[node]) {
        result[child] = buildTree(graph, child);
    }

    return result;
}

function findRoots(edges) {
    const parents = new Set();
    const children = new Set();

    for (const edge of edges) {
        const [p, c] = edge.split("->");

        parents.add(p);
        children.add(c);
    }

    return [...parents].filter(node => !children.has(node));
}
function calculateDepth(tree) {

    const keys = Object.keys(tree);

    if (keys.length === 0) {
        return 0;
    }

    let maxDepth = 0;

    for (const key of keys) {
        maxDepth = Math.max(
            maxDepth,
            calculateDepth(tree[key])
        );
    }

    return maxDepth + 1;
}
app.post("/bfhl", (req, res) => {
      console.log("BODY:", req.body);
    const data = req.body?.data || [];

    const validEdges = [];
    const invalidEntries = [];
    const duplicateEdges = [];

    const seen = new Set();

    for (let item of data) {

        item = item.trim();

        const regex = /^[A-Z]->[A-Z]$/;

        if (!regex.test(item)) {
            invalidEntries.push(item);
            continue;
        }

        const [parent, child] = item.split("->");

        if (parent === child) {
            invalidEntries.push(item);
            continue;
        }

        if (seen.has(item)) {
            if (!duplicateEdges.includes(item)) {
                duplicateEdges.push(item);
            }
            continue;
        }

        seen.add(item);
        validEdges.push(item);
    }

    // NOW validEdges exists here
    const graph = buildGraph(validEdges);
    const roots = findRoots(validEdges);

    const hierarchies = [];

for (const root of roots) {

const treeObj = {
    [root]: buildTree(graph, root)
};

hierarchies.push({
    root,
    tree: treeObj,
    depth: calculateDepth(treeObj)
});
}
    console.log("Graph:", graph);
    console.log("Roots:", roots);
res.json({
    validEdges,
    invalidEntries,
    duplicateEdges,
    hierarchies
});

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});