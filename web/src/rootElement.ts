export function findRootElement(searchedDocument: Document): HTMLElement {
  const rootElement = searchedDocument.getElementById("root");
  if (rootElement === null) {
    throw new Error("Cannot start the app: no element with id #root exists in the document.");
  }
  return rootElement;
}
