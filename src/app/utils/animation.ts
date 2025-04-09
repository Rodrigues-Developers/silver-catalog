export function handleTranstition(element: HTMLElement) {
  element.style.transition = "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
  // Wait for the transition to end, then remove it
  const onTransitionEnd = () => {
    element.style.transition = "none";
    element.removeEventListener("transitionend", onTransitionEnd);
  };

  element.addEventListener("transitionend", onTransitionEnd);
}
