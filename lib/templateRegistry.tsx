// Template component registry — maps templateId to its React component.
// Add new templates here; consuming code needs no changes.

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { TemplateData } from "@/types";

// Lazy-load tiap template lewat next/dynamic supaya halaman (/buat, /preview, /s, dst)
// HANYA memuat chunk template yang benar-benar dirender — bukan semua template sekaligus.
// ssr: true → /s/[subdomain] tetap di-render server (SEO/LCP tak terpengaruh).
const TemplateSatu = dynamic(() => import("@/components/templates/jasa/TemplateSatu"));
const TemplateDua = dynamic(() => import("@/components/templates/jasa/TemplateDua"));
const TemplateTiga = dynamic(() => import("@/components/templates/jasa/TemplateTiga"));
const TemplateEmpat = dynamic(() => import("@/components/templates/jasa/TemplateEmpat"));
const TemplatePersonalSatu = dynamic(() => import("@/components/templates/personal/neo-brutalist"));
const TemplatePersonalDua = dynamic(() => import("@/components/templates/personal/brutalist-bento"));
const TemplatePersonalTiga = dynamic(() => import("@/components/templates/personal/neon-grid"));

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
