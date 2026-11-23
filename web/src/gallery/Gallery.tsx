import { useState } from "react";
import { Button, Card, Grid, Input } from "../components";

export function Gallery() {
  const [integer, setInteger] = useState<number | null>(null);
  return (
    <main className="flex min-h-screen flex-col gap-6 bg-surface-muted p-4 md:p-8">
      <h1 className="text-2xl font-bold text-text">Component gallery</h1>
      <Card title="Buttons">
        <Grid columns={4}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </Grid>
      </Card>
      <Card title="Integer input">
        <Input label="Quantity" onIntegerChange={setInteger} />
        <p className="mt-2 text-text-muted">Parsed value: {integer === null ? "none" : integer}</p>
      </Card>
      <Card title="Grid">
        <Grid columns={3}>
          <Card>One</Card>
          <Card>Two</Card>
          <Card>Three</Card>
        </Grid>
      </Card>
    </main>
  );
}
