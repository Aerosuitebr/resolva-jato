import type { ResumeData } from '@/lib/curriculo/types';
import { getDocumentFontStack } from '@/lib/documents/fonts';
import { AcademicTemplate, ModernTemplate, ProfessionalTemplate } from './resume-templates';

interface ResumePreviewProps {
  data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const fontFamily = getDocumentFontStack('curriculo', data.fontId);
  const content =
    data.templateId === 'modern' ? (
      <ModernTemplate data={data} />
    ) : data.templateId === 'academic' ? (
      <AcademicTemplate data={data} />
    ) : (
      <ProfessionalTemplate data={data} />
    );

  return <div style={{ fontFamily }}>{content}</div>;
}
