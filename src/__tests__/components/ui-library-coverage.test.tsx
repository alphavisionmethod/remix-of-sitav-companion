import { describe, it, expect, vi } from "vitest";
import { render } from "@/test/test-utils";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn(), useParams: () => ({}), useSearchParams: () => [new URLSearchParams(), vi.fn()] };
});

const UI_COMPONENTS = [
  { name: "Accordion", path: "@/components/ui/accordion", render: async () => {
    const { Accordion, AccordionItem, AccordionTrigger, AccordionContent } = await import("@/components/ui/accordion");
    return <Accordion type="single" collapsible><AccordionItem value="a"><AccordionTrigger>Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>;
  }},
  { name: "Alert", path: "@/components/ui/alert", render: async () => {
    const { Alert, AlertTitle, AlertDescription } = await import("@/components/ui/alert");
    return <Alert><AlertTitle>Title</AlertTitle><AlertDescription>Desc</AlertDescription></Alert>;
  }},
  { name: "AspectRatio", path: "@/components/ui/aspect-ratio", render: async () => {
    const { AspectRatio } = await import("@/components/ui/aspect-ratio");
    return <AspectRatio ratio={16/9}><div>Content</div></AspectRatio>;
  }},
  { name: "Avatar", path: "@/components/ui/avatar", render: async () => {
    const { Avatar, AvatarFallback } = await import("@/components/ui/avatar");
    return <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>;
  }},
  { name: "Badge", path: "@/components/ui/badge", render: async () => {
    const { Badge } = await import("@/components/ui/badge");
    return <Badge>Test</Badge>;
  }},
  { name: "Breadcrumb", path: "@/components/ui/breadcrumb", render: async () => {
    const { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } = await import("@/components/ui/breadcrumb");
    return <Breadcrumb><BreadcrumbList><BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem></BreadcrumbList></Breadcrumb>;
  }},
  { name: "Button", path: "@/components/ui/button", render: async () => {
    const { Button } = await import("@/components/ui/button");
    return <Button>Click</Button>;
  }},
  { name: "Card", path: "@/components/ui/card", render: async () => {
    const { Card, CardHeader, CardTitle, CardContent } = await import("@/components/ui/card");
    return <Card><CardHeader><CardTitle>T</CardTitle></CardHeader><CardContent>C</CardContent></Card>;
  }},
  { name: "Checkbox", path: "@/components/ui/checkbox", render: async () => {
    const { Checkbox } = await import("@/components/ui/checkbox");
    return <Checkbox />;
  }},
  { name: "Input", path: "@/components/ui/input", render: async () => {
    const { Input } = await import("@/components/ui/input");
    return <Input placeholder="test" />;
  }},
  { name: "Label", path: "@/components/ui/label", render: async () => {
    const { Label } = await import("@/components/ui/label");
    return <Label>Label</Label>;
  }},
  { name: "Pagination", path: "@/components/ui/pagination", render: async () => {
    const { Pagination, PaginationContent, PaginationItem, PaginationLink } = await import("@/components/ui/pagination");
    return <Pagination><PaginationContent><PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem></PaginationContent></Pagination>;
  }},
  { name: "Progress", path: "@/components/ui/progress", render: async () => {
    const { Progress } = await import("@/components/ui/progress");
    return <Progress value={50} />;
  }},
  { name: "RadioGroup", path: "@/components/ui/radio-group", render: async () => {
    const { RadioGroup, RadioGroupItem } = await import("@/components/ui/radio-group");
    return <RadioGroup defaultValue="a"><RadioGroupItem value="a" /></RadioGroup>;
  }},
  { name: "ScrollArea", path: "@/components/ui/scroll-area", render: async () => {
    const { ScrollArea } = await import("@/components/ui/scroll-area");
    return <ScrollArea className="h-40"><div>Content</div></ScrollArea>;
  }},
  { name: "Separator", path: "@/components/ui/separator", render: async () => {
    const { Separator } = await import("@/components/ui/separator");
    return <Separator />;
  }},
  { name: "Skeleton", path: "@/components/ui/skeleton", render: async () => {
    const { Skeleton } = await import("@/components/ui/skeleton");
    return <Skeleton className="h-4 w-20" />;
  }},
  { name: "Slider", path: "@/components/ui/slider", render: async () => {
    const { Slider } = await import("@/components/ui/slider");
    return <Slider defaultValue={[50]} max={100} />;
  }},
  { name: "Switch", path: "@/components/ui/switch", render: async () => {
    const { Switch } = await import("@/components/ui/switch");
    return <Switch />;
  }},
  { name: "Table", path: "@/components/ui/table", render: async () => {
    const { Table, TableBody, TableRow, TableCell } = await import("@/components/ui/table");
    return <Table><TableBody><TableRow><TableCell>Data</TableCell></TableRow></TableBody></Table>;
  }},
  { name: "Tabs", path: "@/components/ui/tabs", render: async () => {
    const { Tabs, TabsList, TabsTrigger, TabsContent } = await import("@/components/ui/tabs");
    return <Tabs defaultValue="a"><TabsList><TabsTrigger value="a">A</TabsTrigger></TabsList><TabsContent value="a">Content</TabsContent></Tabs>;
  }},
  { name: "Textarea", path: "@/components/ui/textarea", render: async () => {
    const { Textarea } = await import("@/components/ui/textarea");
    return <Textarea placeholder="test" />;
  }},
  { name: "Toggle", path: "@/components/ui/toggle", render: async () => {
    const { Toggle } = await import("@/components/ui/toggle");
    return <Toggle>T</Toggle>;
  }},
  { name: "Tooltip", path: "@/components/ui/tooltip", render: async () => {
    const { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } = await import("@/components/ui/tooltip");
    return <TooltipProvider><Tooltip><TooltipTrigger>Hover</TooltipTrigger><TooltipContent>Tip</TooltipContent></Tooltip></TooltipProvider>;
  }},
];

describe("UI Library Full Coverage", () => {
  for (const comp of UI_COMPONENTS) {
    it(`${comp.name} renders without crash`, async () => {
      const element = await comp.render();
      const { container } = render(element);
      expect(container.firstChild).not.toBeNull();
    });
  }
});