import { useState } from "react";
import { Button, Card, Grid, Input, type ButtonVariant } from "../components";

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "danger"];
const GRID_CELLS = ["One", "Two", "Three", "Four"];

function ButtonsCard() {
  return (
    <Card title="Buttons">
      <div className="flex flex-wrap gap-2">
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>{variant}</Button>
        ))}
        <Button disabled>disabled</Button>
      </div>
    </Card>
  );
}

function InputCard() {
  const [integer, setInteger] = useState<number | null>(null);
  return (
    <Card title="Integer input">
      <Input label="Quantity" onIntegerChange={setInteger} />
      <p className="mt-2 text-text-muted">Parsed: {integer === null ? "none" : integer}</p>
    </Card>
  );
}

function GridCard() {
  return (
    <Card title="Grid">
      <Grid columns={4}>
        {GRID_CELLS.map((cell) => (
          <div key={cell} className="rounded-md bg-surface-muted p-4 text-text">{cell}</div>
        ))}
      </Grid>
    </Card>
  );
}

export function Gallery() {
  return (
    <main className="flex min-h-screen flex-col gap-4 bg-surface-muted p-4 md:p-8">
      <h1 className="text-2xl font-bold text-text">Component gallery</h1>
      <ButtonsCard />
      <InputCard />
      <GridCard />
    </main>
  );
}
