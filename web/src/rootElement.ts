export function findRootElement(document: Document): HTMLElement {
  const rootElement = document.getElementById("root");
  if (rootElement === null) {
    throw new Error("Cannot start the app: no element with id #root found in the document.");
  }
  return rootElement;
}
