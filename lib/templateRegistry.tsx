// Template component registry — maps templateId to its React component.
// Add new templates here; consuming code needs no changes.

import type { ComponentType } from "react";
import type { TemplateData } from "@/types";
import TemplateSatu from "@/components/templates/jasa/TemplateSatu";
import TemplateDua from "@/components/templates/jasa/TemplateDua";
import TemplateTiga from "@/components/templates/jasa/TemplateTiga";
import TemplateEmpat from "@/components/templates/jasa/TemplateEmpat";
import TemplatePersonalSatu from "@/components/templates/personal/neo-brutalist";
import TemplatePersonalDua from "@/components/templates/personal/brutalist-bento";
import TemplatePersonalTiga from "@/components/templates/personal/neon-grid";

interface TemplateProps extends Partial<TemplateData> {
    forceMobile?: boolean;
    isEditable?: boolean;
    isEditMode?: boolean;
    onUpdate?: (path: string, value: string) => void;
    onContentUpdate?: (content: Partial<TemplateData>) => void;
    websiteId?: string;
}

type TemplateComponent = ComponentType<TemplateProps>;

const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
    "jasa-001": TemplateSatu,
    "jasa-002": TemplateDua,
    "jasa-003": TemplateTiga,
    "jasa-004": TemplateEmpat,
    "personal-001": TemplatePersonalSatu,
    "personal-002": TemplatePersonalDua,
    "personal-003": TemplatePersonalTiga,
};

// Returns the component for a given templateId, falling back to jasa-001.
export function getTemplateComponent(templateId: string): TemplateComponent {
    return TEMPLATE_COMPONENTS[templateId] ?? TemplateSatu;
}

// Returns the kategori for a given templateId.
export function getTemplateKategori(templateId: string): string {
    const prefix = templateId.split("-")[0];
    return prefix || "jasa";
}

export default TEMPLATE_COMPONENTS;
