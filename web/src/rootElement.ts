export function findRootElement(source: Document): HTMLElement {
  const root = source.getElementById("root");
  if (root === null) {
    throw new Error("Cannot mount the app: no element with id #root was found in the document.");
  }
  return root;
}
