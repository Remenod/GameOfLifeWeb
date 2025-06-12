export function updateUrlParams() {
    const width = document.getElementById("widthInput").value;
    const height = document.getElementById("heightInput").value;
    const rule = document.getElementById("ruleInput").value;
    const field = document.getElementById("fieldInput").value;

    const params = new URLSearchParams();

    if (width) params.set("w", width);
    if (height) params.set("h", height);
    if (rule) params.set("r", rule);
    if (field) params.set("f", field);

    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
}

export function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const width = params.get("w");
    const height = params.get("h");
    const rule = params.get("r");
    const field = decodeURIComponent(params.get("f") || "");

    if (width) document.getElementById("widthInput").value = width;
    if (height) document.getElementById("heightInput").value = height;
    if (rule) document.getElementById("ruleInput").value = rule;
    if (field) document.getElementById("fieldInput").value = field;
}