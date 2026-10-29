import React from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Tag,
} from 'lucide-react';
import { TemplateAttribute, AttributeFieldType } from '../types/template';
import { Button } from '../../../components/ui/Button';

interface AttributeBuilderProps {
  attributes: TemplateAttribute[];
  onChange: (attributes: TemplateAttribute[]) => void;
}

export const AttributeBuilder: React.FC<AttributeBuilderProps> = ({ attributes, onChange }) => {
  const handleAddAttribute = () => {
    const newAttr: TemplateAttribute = {
      id: `attr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      key: `custom_attribute_${attributes.length + 1}`,
      label: `Custom Attribute ${attributes.length + 1}`,
      type: 'text',
      value: '',
      isRequired: false,
      isVariantDefining: false,
    };
    onChange([...attributes, newAttr]);
  };

  const handleUpdateAttribute = (index: number, updates: Partial<TemplateAttribute>) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleRemoveAttribute = (index: number) => {
    const updated = attributes.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === attributes.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...attributes];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated);
  };

  const handleAddOption = (attrIndex: number) => {
    const attr = attributes[attrIndex];
    const options = attr.options || [];
    const newOption = `Option ${options.length + 1}`;
    handleUpdateAttribute(attrIndex, { options: [...options, newOption] });
  };

  const handleUpdateOption = (attrIndex: number, optionIndex: number, val: string) => {
    const attr = attributes[attrIndex];
    const options = [...(attr.options || [])];
    options[optionIndex] = val;
    handleUpdateAttribute(attrIndex, { options });
  };

  const handleRemoveOption = (attrIndex: number, optionIndex: number) => {
    const attr = attributes[attrIndex];
    const options = (attr.options || []).filter((_, i) => i !== optionIndex);
    handleUpdateAttribute(attrIndex, { options });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#101828]">05. Dynamic Category Attributes</h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Define custom product attributes, required flags, and dropdown options.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddAttribute}
        >
          Add Attribute
        </Button>
      </div>

      {attributes.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-[#E4E7EC] rounded-lg bg-[#F8FAFC]">
          <Tag className="w-5 h-5 text-[#667085] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#101828]">No attributes defined yet</p>
          <p className="text-xs text-[#667085] mt-1">
            Click &ldquo;Add Attribute&rdquo; or switch categories to populate marketplace fields.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attr, idx) => (
            <div
              key={attr.id || idx}
              className="p-4 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-[#667085] hover:text-[#101828] disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === attributes.length - 1}
                      className="p-1 text-[#667085] hover:text-[#101828] disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-mono text-[#667085]">#{idx + 1}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(idx)}
                  className="p-1 text-[#667085] hover:text-rose-600 rounded-md cursor-pointer transition-colors"
                  title="Remove Attribute"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#667085] mb-1">
                    Display Label
                  </label>
                  <input
                    type="text"
                    value={attr.label}
                    onChange={(e) =>
                      handleUpdateAttribute(idx, {
                        label: e.target.value,
                        key: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                      })
                    }
                    placeholder="e.g. Sleeve Length"
                    className="w-full text-xs bg-white border border-[#E4E7EC] rounded-lg px-3 py-1.5 text-[#101828] focus:outline-none focus:border-[#14B8A6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#667085] mb-1">
                    Field Key
                  </label>
                  <input
                    type="text"
                    value={attr.key}
                    onChange={(e) => handleUpdateAttribute(idx, { key: e.target.value })}
                    placeholder="e.g. sleeve_length"
                    className="w-full text-xs bg-white border border-[#E4E7EC] rounded-lg px-3 py-1.5 text-[#101828] font-mono focus:outline-none focus:border-[#14B8A6]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#667085] mb-1">
                    Field Type
                  </label>
                  <select
                    value={attr.type}
                    onChange={(e) =>
                      handleUpdateAttribute(idx, {
                        type: e.target.value as AttributeFieldType,
                        options: ['dropdown', 'multiselect'].includes(e.target.value)
                          ? attr.options || ['Option 1', 'Option 2']
                          : undefined,
                      })
                    }
                    className="w-full text-xs bg-white border border-[#E4E7EC] rounded-lg px-3 py-1.5 text-[#101828] focus:outline-none focus:border-[#14B8A6] cursor-pointer"
                  >
                    <option value="text">Text Input</option>
                    <option value="number">Numeric Number</option>
                    <option value="dropdown">Dropdown Select</option>
                    <option value="multiselect">Multi-select Checkboxes</option>
                    <option value="boolean">Boolean Switch (Yes/No)</option>
                    <option value="date">Date Picker</option>
                    <option value="url">URL Link</option>
                  </select>
                </div>
              </div>

              {['dropdown', 'multiselect'].includes(attr.type) && (
                <div className="p-3 bg-white border border-[#E4E7EC] rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#101828]">Allowed Options</span>
                    <button
                      type="button"
                      onClick={() => handleAddOption(idx)}
                      className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(attr.options || []).map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-md px-2 py-1 text-xs"
                      >
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                          className="bg-transparent text-xs text-[#101828] font-medium focus:outline-none w-24"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx, optIdx)}
                          className="text-[#667085] hover:text-rose-600 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#E4E7EC] text-xs">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={attr.isRequired}
                      onChange={(e) =>
                        handleUpdateAttribute(idx, { isRequired: e.target.checked })
                      }
                      className="rounded border-[#E4E7EC] text-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                    <span className="font-medium text-[#101828]">Required</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={attr.isVariantDefining || false}
                      onChange={(e) =>
                        handleUpdateAttribute(idx, { isVariantDefining: e.target.checked })
                      }
                      className="rounded border-[#E4E7EC] text-[#14B8A6] focus:ring-[#14B8A6]"
                    />
                    <span className="font-medium text-[#101828]">Variant Defining</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#667085]">Default:</span>
                  <input
                    type="text"
                    value={attr.value || ''}
                    onChange={(e) => handleUpdateAttribute(idx, { value: e.target.value })}
                    placeholder="Preset value..."
                    className="text-xs bg-white border border-[#E4E7EC] rounded-md px-2.5 py-1 text-[#101828] focus:outline-none focus:border-[#14B8A6] w-36"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
