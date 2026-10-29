import React from 'react';
import { TemplateForm } from '../features/templates/components/TemplateForm';

export const CreateTemplatePage: React.FC = () => {
  return (
    <div className="animate-fadeIn">
      <TemplateForm isEditing={false} />
    </div>
  );
};
