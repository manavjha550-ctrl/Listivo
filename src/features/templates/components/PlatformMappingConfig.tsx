import React from 'react';
import { PlatformMapping, TemplateAttribute } from '../types/template';

interface PlatformMappingConfigProps {
  attributes: TemplateAttribute[];
  platformMappings: PlatformMapping;
  onChange: (mappings: PlatformMapping) => void;
}

export const PlatformMappingConfig: React.FC<PlatformMappingConfigProps> = ({
  attributes,
  platformMappings,
  onChange,
}) => {
  const platforms = [
    { key: 'meesho', name: 'Meesho', status: 'Autofill + CSV' },
    { key: 'flipkart', name: 'Flipkart', status: 'CSV Export' },
    { key: 'amazon', name: 'Amazon India', status: 'Flat-File' },
    { key: 'myntra', name: 'Myntra', status: 'Catalog Sheet' },
  ];

  const handleUpdateMapping = (
    platform: 'meesho' | 'flipkart' | 'amazon' | 'myntra',
    genericKey: string,
    mappedValue: string
  ) => {
    const updated = {
      ...platformMappings,
      [platform]: {
        ...(platformMappings[platform] || {}),
        [genericKey]: mappedValue,
      },
    };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#101828]">
          07. Marketplace Field Mapping Layer
        </h2>
        <p className="text-xs text-[#667085] mt-0.5">
          Map internal attribute keys to marketplace-specific column headers.
        </p>
      </div>

      {attributes.length === 0 ? (
        <div className="p-4 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg text-xs text-[#667085]">
          Add dynamic category attributes above to configure platform header mappings.
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attr) => (
            <div
              key={attr.id || attr.key}
              className="p-4 bg-[#F8FAFC] border border-[#E4E7EC] rounded-lg space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-[#101828]">{attr.label}</span>
                  <span className="font-mono text-[#667085]">({attr.key})</span>
                </div>
                <span className="text-xs text-[#667085]">Internal Attribute</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {platforms.map((plat) => {
                  const currentValue =
                    (platformMappings[plat.key as keyof PlatformMapping] || {})[attr.key] ||
                    (plat.key === 'meesho' ? attr.label : attr.key);

                  return (
                    <div
                      key={plat.key}
                      className="bg-white p-2.5 rounded-lg border border-[#E4E7EC] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#101828]">{plat.name}</span>
                        <span className="text-[#667085]">{plat.status}</span>
                      </div>

                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) =>
                          handleUpdateMapping(plat.key as any, attr.key, e.target.value)
                        }
                        placeholder={`e.g. ${attr.label}`}
                        className="w-full text-xs bg-[#F8FAFC] border border-[#E4E7EC] rounded-md px-2.5 py-1 text-[#101828] font-mono focus:outline-none focus:border-[#14B8A6]"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
