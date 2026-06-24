const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const USER_ID = "gaganpahwa_15022004";
const EMAIL_ID = "gagan0247.be23@chitkara.edu.in";
const ROLL_NUMBER = "2310990247";

function calculateDepth(tree) {
const keys = Object.keys(tree);


if (keys.length === 0) return 0;

let maxDepth = 0;

for (const key of keys) {
    maxDepth = Math.max(maxDepth, calculateDepth(tree[key]));
}

return maxDepth + 1;


}

function buildTree(graph, node, visited = new Set()) {
visited.add(node);


const result = {};

for (const child of graph[node] || []) {
    if (!visited.has(child)) {
        result[child] = buildTree(
            graph,
            child,
            new Set(visited)
        );
    }
}

return result;


}

function hasCycle(graph) {
const visited = new Set();
const stack = new Set();


function dfs(node) {
    if (stack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    stack.add(node);

    for (const child of graph[node] || []) {
        if (dfs(child)) return true;
    }

    stack.delete(node);

    return false;
}

for (const node in graph) {
    if (dfs(node)) return true;
}

return false;


}

app.post("/bfhl", (req, res) => {

const data = Array.isArray(req.body?.data)
    ? req.body.data
    : [];

const validEdges = [];
const invalidEntries = [];
const duplicateEdges = [];

const seenEdges = new Set();
const childParentMap = new Map();

for (let item of data) {

    item = String(item).trim();

    if (!/^[A-Z]->[A-Z]$/.test(item)) {
        invalidEntries.push(item);
        continue;
    }

    const [parent, child] = item.split("->");

    if (parent === child) {
        invalidEntries.push(item);
        continue;
    }

    if (seenEdges.has(item)) {

        if (!duplicateEdges.includes(item)) {
            duplicateEdges.push(item);
        }

        continue;
    }

    seenEdges.add(item);

    if (childParentMap.has(child)) {
        continue;
    }

    childParentMap.set(child, parent);

    validEdges.push(item);
}

const graph = {};
const nodes = new Set();
const children = new Set();

for (const edge of validEdges) {

    const [parent, child] = edge.split("->");

    nodes.add(parent);
    nodes.add(child);

    children.add(child);

    if (!graph[parent]) graph[parent] = [];
    if (!graph[child]) graph[child] = [];

    graph[parent].push(child);
}

const roots = [...nodes].filter(
    node => !children.has(node)
);

const cycleDetected = hasCycle(graph);

const hierarchies = [];

if (cycleDetected) {

    const root =
        [...nodes].sort()[0] || "A";

    hierarchies.push({
        root,
        tree: {},
        has_cycle: true
    });

} else {

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
}

let largestTreeRoot = "";

const validTrees = hierarchies.filter(
    h => !h.has_cycle
);

if (validTrees.length > 0) {

    validTrees.sort((a, b) => {

        if (b.depth !== a.depth) {
            return b.depth - a.depth;
        }

        return a.root.localeCompare(b.root);
    });

    largestTreeRoot = validTrees[0].root;
}

res.json({

    user_id: USER_ID,

    email_id: EMAIL_ID,

    college_roll_number: ROLL_NUMBER,

    hierarchies,

    invalid_entries: invalidEntries,

    duplicate_edges: duplicateEdges,

    summary: {

        total_trees:
            hierarchies.filter(
                h => !h.has_cycle
            ).length,

        total_cycles:
            hierarchies.filter(
                h => h.has_cycle
            ).length,

        largest_tree_root:
            largestTreeRoot
    }
});


});

app.get("/", (req, res) => {
res.send("BFHL API Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(
`Server running on port ${PORT}`
);
});
