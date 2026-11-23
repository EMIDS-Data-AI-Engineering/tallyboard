import { useState } from "react";
import { Button, Card, Grid, Input } from "../components";

export function Gallery() {
  const [integer, setInteger] = useState<number | null>(null);

  return (
    <main className="flex flex-col gap-6 bg-surface p-4 text-text md:p-8">
      <h1 className="text-2xl font-bold">Component gallery</h1>
      <Card title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>
      <Card title="Integer input">
        <Input label="Quantity" onIntegerChange={setInteger} />
        <p className="mt-2 text-text-muted">Parsed value: {integer === null ? "none" : integer}</p>
      </Card>
      <Grid columns={3}>
        <Card title="First">One column on mobile</Card>
        <Card title="Second">Three columns at md and up</Card>
        <Card title="Third">Resize to check</Card>
      </Grid>
    </main>
  );
}
