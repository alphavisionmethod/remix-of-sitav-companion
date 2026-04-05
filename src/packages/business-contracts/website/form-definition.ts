// SITA OS — Website: Form Definition
export type FormFieldType = "text" | "email" | "phone" | "textarea" | "select" | "radio" | "checkbox" | "date" | "file" | "hidden";
export interface FormDefinition {
  id: string;
  siteId: string;
  name: string;
  fields: Array<{ name: string; label: string; type: FormFieldType; required: boolean; options?: string[]; placeholder?: string; validation?: string }>;
  submitAction: "create-lead" | "send-email" | "webhook" | "create-booking";
  successMessage: string;
  redirectUrl?: string;
  notifyEmails: string[];
  active: boolean;
  createdAt: string;
}
