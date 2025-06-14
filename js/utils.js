export function updateUrlParams() {
    const width = document.getElementById("widthInput").value;
    const height = document.getElementById("heightInput").value;
    const rule = document.getElementById("ruleInput").value;
    const field = document.getElementById("fieldInput").value;

    const params = new URLSearchParams();

    if (width) params.set("w", width);
    if (height) params.set("h", height);
    if (rule) params.set("r", rule.replace("/", "."));
    if (field) params.set("f", field.replace(/\[/g, '-').replace(/\]/g, '_').replace(";", '.'));

    const newUrl = `${location.pathname}?${params.toString()}`;
    history.replaceState(null, "", newUrl);
}

export function loadFromUrlParams() {
    const params = new URLSearchParams(window.location.search);

    const width = params.get("w");
    const height = params.get("h");
    const rule = params.get("r");
    const field = params.get("f");

    if (width) document.getElementById("widthInput").value = width;
    if (height) document.getElementById("heightInput").value = height;
    if (rule) document.getElementById("ruleInput").value = rule.replace(".", ";");
    if (field) document.getElementById("fieldInput").value = field.replace(/-/g, '[').replace(/_/g, "]").replace(".", ";");
}

export function enforceDisabledControls() {
    document.querySelectorAll('.controls.card button, .controls.card input')
        .forEach(el => el.disabled = true);
}

export function showToast(message, duration = 1500) {
    const toast = document.createElement("div");
    toast.className = "toast-message";
    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

export function resetElementValue(elementId, defaultValue = "") {
    const el = document.getElementById(elementId);
    if (el) {
        el.value = defaultValue;

        const event = new Event("input", { bubbles: true });
        el.dispatchEvent(event);
    }

}
