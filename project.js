/* Case study interactions. The home and project index use ordinary links. */
(() => {
  const dialog = document.querySelector("#lightbox");
  const image = dialog.querySelector("img");
  const state = { scale: 1, x: 0, y: 0, drag: null };
  let trigger;

  function renderImage() {
    image.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px) scale(' + state.scale + ')';
    image.style.cursor = state.scale > 1 ? "grab" : "default";
  }

  function resetImage() {
    Object.assign(state, { scale: 1, x: 0, y: 0, drag: null });
    renderImage();
  }

  function zoom(factor) {
    state.scale = Math.max(1, Math.min(8, state.scale * factor));
    if (state.scale === 1) resetImage();
    else renderImage();
  }

  function openImage(link) {
    trigger = link;
    image.src = link.href;
    image.alt = link.querySelector("img")?.alt || "프로젝트 화면";
    resetImage();
    dialog.showModal();
    document.body.classList.add("image-open");
  }

  function selectPanel(button, attribute, panelSelector, prefix = "") {
    const targetId = prefix + button.dataset[attribute];
    document.querySelectorAll(panelSelector).forEach(panel => {
      panel.hidden = panel.id !== targetId;
    });
    document.querySelectorAll("[data-" + attribute + "]").forEach(control => {
      const selected = control === button;
      control.classList.toggle("active", selected);
      control.setAttribute("aria-pressed", String(selected));
    });
  }

  function selectGallery(button) {
    const gallery = document.getElementById("gallery-" + button.dataset.gallery);
    const index = Number(button.dataset.index);
    gallery.querySelectorAll(".gallery-main a").forEach((link, i) => {
      link.hidden = i !== index;
    });
    gallery.querySelectorAll("[data-gallery]").forEach(control => {
      control.classList.toggle("active", control === button);
      control.setAttribute("aria-pressed", String(control === button));
    });
    gallery.querySelector(".gallery-caption").textContent = button.dataset.caption;
  }

  document.addEventListener("click", event => {
    const control = event.target.closest("a,button");
    if (!control) return;
    if (control.hasAttribute("data-lightbox")) {
      event.preventDefault();
      openImage(control);
    } else if (control.dataset.program) {
      selectPanel(control, "program", ".prog-panel");
    } else if (control.dataset.erd) {
      selectPanel(control, "erd", ".erd-panel", "erd-");
    } else if (control.dataset.gallery) {
      selectGallery(control);
    } else if (control.dataset.zoom) {
      zoom(Number(control.dataset.zoom));
    } else if (control.hasAttribute("data-reset")) {
      resetImage();
    } else if (control.hasAttribute("data-close")) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("image-open");
    resetImage();
    trigger?.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("wheel", event => {
    event.preventDefault();
    zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15);
  }, { passive: false });
  image.addEventListener("dblclick", () => {
    if (state.scale > 1) resetImage();
    else zoom(2.5);
  });
  image.addEventListener("dragstart", event => event.preventDefault());
  image.addEventListener("pointerdown", event => {
    if (state.scale <= 1) return;
    state.drag = { x: event.clientX - state.x, y: event.clientY - state.y };
    image.setPointerCapture(event.pointerId);
  });
  image.addEventListener("pointermove", event => {
    if (!state.drag) return;
    state.x = event.clientX - state.drag.x;
    state.y = event.clientY - state.drag.y;
    renderImage();
  });
  image.addEventListener("pointerup", () => { state.drag = null; });
  image.addEventListener("pointercancel", () => { state.drag = null; });
})();