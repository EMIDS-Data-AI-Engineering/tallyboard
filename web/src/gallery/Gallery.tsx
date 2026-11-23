import { useState } from "react";
import { Button, Card, Grid, Input } from "../components";

const VARIANTS = ["primary", "secondary", "danger"] as const;

export function Gallery() {
  const [integer, setInteger] = useState<number | null>(null);
  return (
    <main className="min-h-screen bg-surface-muted p-4 md:p-8">
      <h1 className="mb-4 text-2xl font-bold text-text">Component gallery</h1>
      <Grid columns={2}>
        <Card title="Buttons">
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>{variant}</Button>
            ))}
            <Button disabled>disabled</Button>
          </div>
        </Card>
        <Card title="Input">
          <Input label="Quantity (integer)" onIntegerChange={setInteger} />
          <p className="mt-2 text-text-muted">Parsed: {integer === null ? "none" : integer}</p>
        </Card>
      </Grid>
    </main>
  );
}
