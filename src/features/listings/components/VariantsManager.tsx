import React, { useState } from 'react';
import { Layers, Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { VariantDimension } from '../../templates/types/template';
import { ListingVariant } from '../types/listing';

interface VariantsManagerProps {
  hasVariants: boolean;
  setHasVariants: (val: boolean) => void;
  variantDimensions: VariantDimension[];
  setVariantDimensions: React.Dispatch<React.SetStateAction<VariantDimension[]>>;
  variants: ListingVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ListingVariant[]>>;
  baseSku: string;
  basePrice: number;
}

export const VariantsManager: React.FC<VariantsManagerProps> = ({
  hasVariants,
  setHasVariants,
  variantDimensions,
  setVariantDimensions,
  variants,
  setVariants,
  baseSku,
  basePrice,
}) => {
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  const handleAddOption = (dimId: string) => {
    const val = (newOptionInputs[dimId] || '').trim();
    if (!val) return;

    setVariantDimensions((prev) =>
      prev.map((d) =>
        d.id === dimId ? { ...d, options: [...d.options.filter((o) => o !== val), val] } : d
      )
    );
    setNewOptionInputs((prev) => ({ ...prev, [dimId]: '' }));
  };

  const handleRemoveOption = (dimId: string, optionVal: string) => {
    setVariantDimensions((prev) =>
      prev.map((d) =>
        d.id === dimId ? { ...d, options: d.options.filter((o) => o !== optionVal) } : d
      )
    );
  };

  const handleAddDimension = () => {
    const newId = `vdim-${Date.now()}`;
    setVariantDimensions((prev) => [...prev, { id: newId, name: 'Size', options: [] }]);
  };

  const handleRemoveDimension = (dimId: string) => {
    setVariantDimensions((prev) => prev.filter((d) => d.id !== dimId));
  };

  const generateMatrix = () => {
    const activeDims = variantDimensions.filter((d) => d.options.length > 0);
    if (activeDims.length === 0) return;

    const cartesian = (args: string[][]): string[][] => {
      const r: string[][] = [];
      const max = args.length - 1;
      function helper(arr: string[], i: number) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = arr.slice(0);
          a.push(args[i][j]);
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const optionsArrays = activeDims.map((d) => d.options);
    const combinations = cartesian(optionsArrays);

    const generatedVariants: ListingVariant[] = combinations.map((comboArr, idx) => {
      const attrObj: Record<string, string> = {};
      activeDims.forEach((dim, i) => {
        attrObj[dim.name] = comboArr[i];
      });

      const suffix = comboArr
        .map((c) => c.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, ''))
        .join('-');

      return {
        id: `v-gen-${idx}-${Date.now()}`,
        sku: `${baseSku || 'SKU'}-${suffix}`,
        attributes: attrObj,
        price: basePrice || 499,
        stock: 20,
      };
    });

    setVariants(generatedVariants);
  };

  const handleUpdateVariant = (id: string, field: keyof ListingVariant, value: any) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  return (
    <div className="space-y-6">
      {/* Enable Variants Toggle */}
      <div className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white border border-[#E4E7EC] text-[#14B8A6] rounded-lg flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-[#101828] text-xs">Enable Multi-Variant Listing</h4>
            <p className="text-xs text-[#667085]">
              Generate multiple size or color combinations under a single parent catalog listing.
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={hasVariants}
          onClick={() => setHasVariants(!hasVariants)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
            hasVariants ? 'bg-[#14B8A6]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
              hasVariants ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {hasVariants && (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-[#101828] text-xs">01. Define Variant Dimensions</h4>
              <button
                type="button"
                onClick={handleAddDimension}
                className="text-xs text-[#0F766E] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Dimension
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variantDimensions.map((dim) => (
                <div
                  key={dim.id}
                  className="bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={dim.name}
                      onChange={(e) =>
                        setVariantDimensions((prev) =>
                          prev.map((d) =>
                            d.id === dim.id ? { ...d, name: e.target.value } : d
                          )
                        )
                      }
                      className="font-semibold text-xs text-[#101828] bg-white px-2.5 py-1.5 rounded-md border border-[#E4E7EC] focus:outline-none focus:border-[#14B8A6]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDimension(dim.id)}
                      className="text-[#667085] hover:text-rose-600 p-1 cursor-pointer"
                      aria-label="Remove dimension"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                    {dim.options.map((opt) => (
                      <span
                        key={opt}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white text-[#101828] border border-[#E4E7EC]"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(dim.id, opt)}
                          className="text-[#667085] hover:text-rose-600 ml-0.5 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E4E7EC]">
                    <input
                      type="text"
                      value={newOptionInputs[dim.id] || ''}
                      onChange={(e) =>
                        setNewOptionInputs({ ...newOptionInputs, [dim.id]: e.target.value })
                      }
                      onKeyDown={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), handleAddOption(dim.id))
                      }
                      placeholder={`Add ${dim.name} option...`}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#E4E7EC] rounded-md focus:outline-none focus:border-[#14B8A6] text-[#101828]"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      onClick={() => handleAddOption(dim.id)}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={generateMatrix}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Generate Variant Matrix
              </Button>
            </div>
          </div>

          {variants.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E4E7EC]">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-semibold text-[#101828]">
                  02. Generated Variants ({variants.length} combinations)
                </h4>
                <span className="text-[#667085]">All prices in INR (₹)</span>
              </div>

              <div className="border border-[#E4E7EC] rounded-lg overflow-x-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] border-b border-[#E4E7EC] font-semibold text-[#667085] text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Attributes</th>
                      <th className="py-2.5 px-3">Variant SKU</th>
                      <th className="py-2.5 px-3">Price (₹)</th>
                      <th className="py-2.5 px-3">Stock Units</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {variants.map((v) => (
                      <tr key={v.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1.5 text-xs text-[#101828]">
                            {Object.entries(v.attributes).map(([k, val], idx) => (
                              <span key={k}>
                                {idx > 0 && <span className="text-[#667085] mr-1.5">·</span>}
                                <span className="text-[#667085]">{k}:</span>{' '}
                                <span className="font-medium">{val}</span>
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleUpdateVariant(v.id, 'sku', e.target.value)}
                            className="w-40 px-2.5 py-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-md text-xs font-mono font-semibold text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
                          />
                        </td>

                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) =>
                              handleUpdateVariant(v.id, 'price', Number(e.target.value))
                            }
                            className="w-24 px-2.5 py-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-md text-xs font-mono tabular-nums font-semibold text-[#0F766E] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
                          />
                        </td>

                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) =>
                              handleUpdateVariant(v.id, 'stock', Number(e.target.value))
                            }
                            className="w-20 px-2.5 py-1 bg-[#F8FAFC] border border-[#E4E7EC] rounded-md text-xs font-mono tabular-nums font-semibold text-[#101828] focus:bg-white focus:outline-none focus:border-[#14B8A6]"
                          />
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setVariants((prev) => prev.filter((item) => item.id !== v.id))
                            }
                            className="p-1 text-[#667085] hover:text-rose-600 transition-colors cursor-pointer"
                            aria-label="Remove variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
