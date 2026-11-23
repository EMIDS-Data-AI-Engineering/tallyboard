import { Button, Card, Grid, Input } from "../components";

const VARIANTS = ["primary", "secondary", "danger"] as const;

export function Gallery() {
  return (
    <main className="min-h-screen bg-surface-muted p-4 text-text md:p-8">
      <h1 className="mb-4 text-2xl font-bold">Component gallery</h1>
      <Grid columns={2}>
        <Card title="Buttons">
          <div className="flex flex-wrap gap-2">
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
            <Button disabled>disabled</Button>
          </div>
        </Card>
        <Card title="Integer input">
          <Input label="Quantity" onIntegerChange={() => undefined} />
        </Card>
        <Card title="Grid">
          <Grid columns={3}>
            <span>One</span>
            <span>Two</span>
            <span>Three</span>
          </Grid>
        </Card>
      </Grid>
    </main>
  );
}
