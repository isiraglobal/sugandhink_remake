'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ChevronDown, X } from 'lucide-react';
import { ScentFamily, Occasion } from '@/types/product.types';

interface AdvancedFiltersProps {
  onFiltersChange?: (filters: FiltersState) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export interface FiltersState {
  scentFamilies: ScentFamily[];
  occasions: Occasion[];
  priceRange: [number, number];
  longevity: string[];
  sillage: string[];
}

const SCENT_FAMILIES: { value: ScentFamily; label: string }[] = [
  { value: 'fresh', label: 'Fresh' },
  { value: 'citrus', label: 'Citrus' },
  { value: 'floral', label: 'Floral' },
  { value: 'fruity', label: 'Fruity' },
  { value: 'woody', label: 'Woody' },
  { value: 'oriental', label: 'Oriental' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'aquatic', label: 'Aquatic' },
  { value: 'oud', label: 'Oud' },
  { value: 'gourmand', label: 'Gourmand' },
];

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: 'daily-wear', label: 'Daily Wear' },
  { value: 'date-night', label: 'Date Night' },
  { value: 'formal', label: 'Formal' },
  { value: 'evening', label: 'Evening' },
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
];

/**
 * Advanced Product Filters Component
 * Luxury filtering UI with animations
 */
export const AdvancedFilters = ({
  onFiltersChange,
  isOpen = false,
  onClose,
}: AdvancedFiltersProps) => {
  const [filters, setFilters] = useState<FiltersState>({
    scentFamilies: [],
    occasions: [],
    priceRange: [300, 1500],
    longevity: [],
    sillage: [],
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['scent'])
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    if (isOpen) {
      gsap.to(contentRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      gsap.to(contentRef.current, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        ease: 'power2.in',
      });
    }
  }, [isOpen]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleScentFamilyChange = (family: ScentFamily) => {
    const newFamilies = filters.scentFamilies.includes(family)
      ? filters.scentFamilies.filter((f) => f !== family)
      : [...filters.scentFamilies, family];

    const newFilters = { ...filters, scentFamilies: newFamilies };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleOccasionChange = (occasion: Occasion) => {
    const newOccasions = filters.occasions.includes(occasion)
      ? filters.occasions.filter((o) => o !== occasion)
      : [...filters.occasions, occasion];

    const newFilters = { ...filters, occasions: newOccasions };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleClearAll = () => {
    const newFilters: FiltersState = {
      scentFamilies: [],
      occasions: [],
      priceRange: [300, 1500],
      longevity: [],
      sillage: [],
    };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const totalFiltersApplied =
    filters.scentFamilies.length +
    filters.occasions.length +
    filters.longevity.length +
    filters.sillage.length;

  return (
    <div ref={containerRef} className="relative">
      {/* Sidebar */}
      <div
        ref={contentRef}
        className="opacity-0 -translate-x-5 fixed md:relative left-0 top-0 w-full md:w-64 h-screen md:h-auto bg-white md:bg-transparent z-40 md:z-auto overflow-y-auto"
      >
        <div className="p-6 md:p-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-xl font-serif text-[#18191a]">Filters</h3>
            <div className="flex items-center gap-2">
              {totalFiltersApplied > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-[#9b7a42] hover:text-[#18191a] font-medium"
                >
                  Clear All ({totalFiltersApplied})
                </button>
              )}
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scent Family Filter */}
          <FilterSection
            title="Scent Family"
            isExpanded={expandedSections.has('scent')}
            onToggle={() => toggleSection('scent')}
          >
            <div className="space-y-3">
              {SCENT_FAMILIES.map((family) => (
                <label
                  key={family.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.scentFamilies.includes(family.value)}
                    onChange={() => handleScentFamilyChange(family.value)}
                    className="w-4 h-4 rounded border-2 border-[#d4af37] bg-white checked:bg-[#9b7a42] accent-[#9b7a42]"
                  />
                  <span className="text-sm text-[#666] group-hover:text-[#18191a] transition-colors">
                    {family.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Occasion Filter */}
          <FilterSection
            title="Occasion"
            isExpanded={expandedSections.has('occasion')}
            onToggle={() => toggleSection('occasion')}
          >
            <div className="space-y-3">
              {OCCASIONS.map((occasion) => (
                <label
                  key={occasion.value}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.occasions.includes(occasion.value)}
                    onChange={() => handleOccasionChange(occasion.value)}
                    className="w-4 h-4 rounded border-2 border-[#d4af37] bg-white checked:bg-[#9b7a42] accent-[#9b7a42]"
                  />
                  <span className="text-sm text-[#666] group-hover:text-[#18191a] transition-colors">
                    {occasion.label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Price Range Filter */}
          <FilterSection
            title="Price Range"
            isExpanded={expandedSections.has('price')}
            onToggle={() => toggleSection('price')}
          >
            <div className="space-y-4">
              <input
                type="range"
                min="300"
                max="1500"
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const newFilters = {
                    ...filters,
                    priceRange: [filters.priceRange[0], parseInt(e.target.value)],
                  };
                  setFilters(newFilters);
                  onFiltersChange?.(newFilters);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#9b7a42]"
              />
              <div className="flex justify-between text-sm text-[#666]">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
            </div>
          </FilterSection>

          {/* Longevity Filter */}
          <FilterSection
            title="Longevity"
            isExpanded={expandedSections.has('longevity')}
            onToggle={() => toggleSection('longevity')}
          >
            <div className="space-y-3">
              {['Light', 'Moderate', 'Long-lasting', 'Extreme'].map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-2 border-[#d4af37] bg-white checked:bg-[#9b7a42] accent-[#9b7a42]"
                  />
                  <span className="text-sm text-[#666] group-hover:text-[#18191a] transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  );
};

/**
 * Filter Section Component
 */
const FilterSection = ({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isExpanded) {
      gsap.to(contentRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
    }
  }, [isExpanded]);

  return (
    <div className="mb-6 pb-6 border-b border-[#e8e0d5]">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <h4 className="font-medium text-[#18191a] group-hover:text-[#9b7a42] transition-colors">
          {title}
        </h4>
        <ChevronDown
          size={18}
          className={`text-[#9b7a42] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden opacity-0"
        style={{ height: isExpanded ? 'auto' : 0 }}
      >
        {children}
      </div>
    </div>
  );
};
