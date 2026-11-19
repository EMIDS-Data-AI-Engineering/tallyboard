export function findRootElement(document: Document): HTMLElement {
  const root = document.getElementById("root");
  if (root === null) {
    throw new Error("Cannot start the app: no element with id #root exists in the page.");
  }
  return root;
}
