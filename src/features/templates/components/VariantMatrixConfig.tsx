import React from 'react';
import { Plus, Trash2, Layers } from 'lucide-react';
import { VariantDimension } from '../types/template';
import { Button } from '../../../components/ui/Button';

interface VariantMatrixConfigProps {
  variantDimensions: VariantDimension[];
  skuPrefix: string;
  defaultPrice: number;
  onChange: (dimensions: VariantDimension[]) => void;
}

export const VariantMatrixConfig: React.FC<VariantMatrixConfigProps> = ({
  variantDimensions,
  skuPrefix,
  defaultPrice,
  onChange,
}) => {
  const handleAddDimension = () => {
    const defaultName = variantDimensions.length === 0 ? 'Color' : 'Size';
    const newDim: VariantDimension = {
      id: `vdim-${Date.now()}`,
      name: defaultName,
      options: defaultName === 'Color' ? ['Red', 'Blue'] : ['S', 'M', 'L'],
    };
    onChange([...variantDimensions, newDim]);
  };

  const handleRemoveDimension = (index: number) => {
    onChange(variantDimensions.filter((_, i) => i !== index));
  };

  const handleUpdateName = (index: number, name: string) => {
    const updated = [...variantDimensions];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const handleAddOption = (dimIndex: number, optionStr: string) => {
    const trimmed = optionStr.trim();
    if (!trimmed) return;
    const dim = variantDimensions[dimIndex];
    if (dim.options.includes(trimmed)) return;

    const updated = [...variantDimensions];
    updated[dimIndex] = { ...updated[dimIndex], options: [...dim.options, trimmed] };
    onChange(updated);
  };

  const handleRemoveOption = (dimIndex: number, optionIndex: number) => {
    const updated = [...variantDimensions];
    const dim = updated[dimIndex];
    const options = dim.options.filter((_, i) => i !== optionIndex);
    updated[dimIndex] = { ...dim, options };
    onChange(updated);
  };

  const generateCombos = (): Array<Record<string, string>> => {
    if (variantDimensions.length === 0) return [];

    const validDimensions = variantDimensions.filter((d) => d.options.length > 0);
    if (validDimensions.length === 0) return [];

    let result: Array<Record<string, string>> = [{}];

    validDimensions.forEach((dim) => {
      const next: Array<Record<string, string>> = [];
      result.forEach((existing) => {
        dim.options.forEach((opt) => {
          next.push({ ...existing, [dim.name]: opt });
        });
      });
      result = next;
    });

    return result;
  };

  const combos = generateCombos();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#101828]">06. Variant Dimensions &amp; Matrix</h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Configure Color/Size dimensions for automated Cartesian SKU generation.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={handleAddDimension}
        >
          Add Variant Dimension
        </Button>
      </div>

      {variantDimensions.length === 0 ? (
        <div className="p-5 bg-[#F8FAFC] border border-dashed border-[#E4E7EC] rounded-lg text-center">
          <Layers className="w-5 h-5 text-[#667085] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#101828]">No variant dimensions configured</p>
          <p className="text-xs text-[#667085] mt-1">
            Single product template (1 SKU). Add a dimension to generate Color or Size combinations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {variantDimensions.map((dim, idx) => (
            <div
              key={dim.id || idx}
              className="p-4 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <span className="text-xs font-medium text-[#667085] shrink-0">
                    Dimension #{idx + 1}:
                  </span>
                  <input
                    type="text"
                    value={dim.name}
                    onChange={(e) => handleUpdateName(idx, e.target.value)}
                    placeholder="e.g. Color or Size"
                    className="text-xs font-semibold text-[#101828] bg-white border border-[#E4E7EC] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#14B8A6] w-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveDimension(idx)}
                  className="p-1 text-[#667085] hover:text-rose-600 rounded-md cursor-pointer"
                  title="Remove Dimension"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-[#667085] block">
                  {dim.name || 'Dimension'} Options
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {dim.options.map((opt, optIdx) => (
                    <span
                      key={optIdx}
                      className="inline-flex items-center gap-1.5 bg-white border border-[#E4E7EC] rounded-md px-2.5 py-1 text-xs font-medium text-[#101828]"
                    >
                      <span>{opt}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx, optIdx)}
                        className="text-[#667085] hover:text-rose-600 font-semibold cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    placeholder="+ Add option & press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption(idx, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="text-xs bg-white border border-[#E4E7EC] rounded-md px-3 py-1 text-[#101828] focus:outline-none focus:border-[#14B8A6] w-48"
                  />
                </div>
              </div>
            </div>
          ))}

          {combos.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h5 className="font-semibold text-[#101828]">Generated Variant Matrix Preview</h5>
                <span className="font-mono tabular-nums text-[#0F766E] font-medium">
                  {combos.length} SKUs
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto border border-[#E4E7EC] rounded-lg overflow-hidden text-xs bg-white">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F8FAFC] text-[11px] font-semibold text-[#667085] border-b border-[#E4E7EC]">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      {variantDimensions.map((d) => (
                        <th key={d.id} className="py-2 px-3">
                          {d.name}
                        </th>
                      ))}
                      <th className="py-2 px-3">Auto SKU Preview</th>
                      <th className="py-2 px-3 text-right">Base Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {combos.map((combo, cIdx) => {
                      const comboCode = Object.values(combo)
                        .map((v) => String(v).toUpperCase().replace(/[^A-Z0-9]/g, ''))
                        .join('-');
                      const generatedSku = `${skuPrefix || 'SKU'}-${comboCode}-${cIdx + 1}`;

                      return (
                        <tr key={cIdx} className="hover:bg-[#F8FAFC]">
                          <td className="py-2 px-3 font-mono tabular-nums text-[#667085] text-[11px]">
                            {cIdx + 1}
                          </td>
                          {variantDimensions.map((d) => (
                            <td key={d.id} className="py-2 px-3 font-medium text-[#101828]">
                              {combo[d.name] || '-'}
                            </td>
                          ))}
                          <td className="py-2 px-3 font-mono font-semibold text-[#0F766E]">
                            {generatedSku}
                          </td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums font-medium text-[#101828]">
                            ₹{defaultPrice || 499}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
