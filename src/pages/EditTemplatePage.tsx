import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { ListingTemplate } from '../features/templates/types/template';
import { templateService } from '../features/templates/services/templateService';
import { TemplateForm } from '../features/templates/components/TemplateForm';
import { Button } from '../components/ui/Button';

export const EditTemplatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<ListingTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    templateService
      .getTemplateById(id)
      .then((data) => {
        setTemplate(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load template.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <div className="w-7 h-7 border-2 border-[#14B8A6] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-[#667085]">Loading template configuration...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="p-8 bg-white border border-[#E4E7EC] rounded-xl text-center max-w-md mx-auto space-y-4 my-12">
        <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#101828]">Template Not Found</h2>
          <p className="text-xs text-[#667085] mt-1">
            {error || 'The requested template could not be loaded.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/templates')}
        >
          Back to Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <TemplateForm initialTemplate={template} isEditing={true} />
    </div>
  );
};
