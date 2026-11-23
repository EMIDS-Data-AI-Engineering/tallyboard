import { useState } from "react";
import { Button, Card, Grid, Input } from "../components";

const PLACEHOLDER_CARD_TITLES = ["First", "Second", "Third"];

function ButtonShowcase() {
  return (
    <Card title="Buttons">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
      </div>
    </Card>
  );
}

function InputShowcase() {
  const [integer, setInteger] = useState<number | null>(null);
  return (
    <Card title="Input">
      <Input label="Integer (negatives allowed)" onIntegerChange={setInteger} />
      <p className="mt-2 text-text-muted">Parsed: {integer === null ? "none" : integer}</p>
    </Card>
  );
}

function GridShowcase() {
  return (
    <Card title="Grid">
      <Grid columns={3}>
        {PLACEHOLDER_CARD_TITLES.map((title) => (
          <Card key={title} title={title}>
            Content
          </Card>
        ))}
      </Grid>
    </Card>
  );
}

export function Gallery() {
  return (
    <main className="flex min-h-screen flex-col gap-4 bg-surface-muted p-4 md:p-8">
      <h1 className="text-2xl font-bold text-text">Component gallery</h1>
      <ButtonShowcase />
      <InputShowcase />
      <GridShowcase />
    </main>
  );
}
