import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

describe("Component Smoke Tests - UI Primitives", () => {
  it("Button renders", async () => {
    const { Button } = await import("@/components/ui/button");
    const { container } = render(<Button>Test</Button>);
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("Card renders", async () => {
    const { Card, CardHeader, CardTitle, CardContent } = await import("@/components/ui/card");
    const { container } = render(
      <Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Content</CardContent></Card>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("Badge renders", async () => {
    const { Badge } = await import("@/components/ui/badge");
    const { container } = render(<Badge>Test</Badge>);
    expect(container.firstChild).toBeTruthy();
  });

  it("Input renders", async () => {
    const { Input } = await import("@/components/ui/input");
    const { container } = render(<Input placeholder="test" />);
    expect(container.querySelector("input")).toBeTruthy();
  });

  it("Tabs renders", async () => {
    const { Tabs, TabsList, TabsTrigger, TabsContent } = await import("@/components/ui/tabs");
    const { container } = render(
      <Tabs defaultValue="a"><TabsList><TabsTrigger value="a">A</TabsTrigger></TabsList><TabsContent value="a">Content</TabsContent></Tabs>
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("Switch renders", async () => {
    const { Switch } = await import("@/components/ui/switch");
    const { container } = render(<Switch />);
    expect(container.firstChild).toBeTruthy();
  });

  it("Progress renders", async () => {
    const { Progress } = await import("@/components/ui/progress");
    const { container } = render(<Progress value={50} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("Separator renders", async () => {
    const { Separator } = await import("@/components/ui/separator");
    const { container } = render(<Separator />);
    expect(container.firstChild).toBeTruthy();
  });

  it("Avatar renders", async () => {
    const { Avatar, AvatarFallback } = await import("@/components/ui/avatar");
    const { container } = render(<Avatar><AvatarFallback>AB</AvatarFallback></Avatar>);
    expect(container.firstChild).toBeTruthy();
  });

  it("ScrollArea renders", async () => {
    const { ScrollArea } = await import("@/components/ui/scroll-area");
    const { container } = render(<ScrollArea className="h-40"><div>Content</div></ScrollArea>);
    expect(container.firstChild).toBeTruthy();
  });

  it("Accordion renders", async () => {
    const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = await import("@/components/ui/accordion");
    const { container } = render(
      <Accordion type="single" collapsible><AccordionItem value="a"><AccordionTrigger>Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>
    );
    expect(container.firstChild).toBeTruthy();
  });
});
