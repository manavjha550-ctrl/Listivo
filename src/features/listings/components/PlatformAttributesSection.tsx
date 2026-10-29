import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { TemplateAttribute } from '../../templates/types/template';

interface PlatformAttributesSectionProps {
  attributes: TemplateAttribute[];
  setAttributes: React.Dispatch<React.SetStateAction<TemplateAttribute[]>>;
  marketplace: string;
  category: string;
}

export const PlatformAttributesSection: React.FC<PlatformAttributesSectionProps> = ({
  attributes,
  setAttributes,
  marketplace,
}) => {
  const handleAttributeChange = (id: string, value: any) => {
    setAttributes((prev) => prev.map((attr) => (attr.id === id ? { ...attr, value } : attr)));
  };

  const handleAddAttribute = () => {
    const newAttr: TemplateAttribute = {
      id: `attr-custom-${Date.now()}`,
      key: `custom_attr_${Date.now()}`,
      label: 'Custom Attribute',
      type: 'text',
      value: '',
      isRequired: false,
    };
    setAttributes((prev) => [...prev, newAttr]);
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
  };

  const inputBase =
    'w-full px-3 py-2 text-xs bg-white border border-[#E4E7EC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] text-[#101828]';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC]">
        <div>
          <h4 className="font-semibold text-[#101828] text-sm capitalize">
            {marketplace} Platform Specifications
          </h4>
          <p className="text-xs text-[#667085] mt-0.5">
            Complete required marketplace attributes to improve buyer filter discovery.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddAttribute}
          className="text-xs text-[#0F766E] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Attribute
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attributes.map((attr) => (
          <div
            key={attr.id}
            className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-[#101828] flex items-center gap-1">
                {attr.label}
                {attr.isRequired && <span className="text-rose-600">*</span>}
              </label>
              <button
                type="button"
                onClick={() => handleRemoveAttribute(attr.id)}
                className="text-[#667085] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                aria-label={`Remove ${attr.label}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {attr.type === 'dropdown' && attr.options ? (
              <select
                value={attr.value || ''}
                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                className={`${inputBase} font-medium cursor-pointer`}
              >
                <option value="">Select {attr.label}</option>
                {attr.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : attr.type === 'boolean' ? (
              <select
                value={attr.value ? 'true' : 'false'}
                onChange={(e) => handleAttributeChange(attr.id, e.target.value === 'true')}
                className={`${inputBase} font-medium cursor-pointer`}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : (
              <input
                type="text"
                value={attr.value || ''}
                onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                placeholder={`Enter ${attr.label}...`}
                className={inputBase}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
