export function findRootElement(document: Document): HTMLElement {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Cannot start the app: no element with id #root exists in the page.");
  }
  return rootElement;
}
