export interface TemplateDataSlot {
  name: string;
  placeholder?: string;
  types?: string[];
}

export interface TemplateDataProp {
  name: string;
  type: 'string' | 'number' | 'boolean';
  placeholder?: string;
}

export interface TemplateDataAuthor {
  name: string;
  url?: string;
}

export interface TemplateData {
  owner_id: string;

  tag: string;
  cdn?: string;
  author?: TemplateDataAuthor;
  slots?: TemplateDataSlot[];
  props?: TemplateDataProp[];

  created_at?;
  updated_at?;
}

export interface Template {
  id: string;
  data: TemplateData;
}
