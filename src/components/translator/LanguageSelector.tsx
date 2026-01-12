'use client';

import { createListCollection, Select } from '@chakra-ui/react';
import { LanguageInfo } from '@/types/translator';

interface LanguageSelectorProps {
  label: string;
  value: string[];
  options: LanguageInfo[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function LanguageSelector({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: LanguageSelectorProps) {
  const collection = createListCollection({
    items: options.map((lang) => ({
      label: `${lang.flag} ${lang.name}`,
      value: lang.code,
    })),
  });

  return (
    <Select.Root
      collection={collection}
      value={value}
      onValueChange={(details: { value: string[] }) => onChange(details.value)}
      disabled={disabled}
      size="lg"
      width="full"
      positioning={{
        strategy: 'fixed',
        placement: 'bottom-start',
        offset: { mainAxis: 4 },
      }}
    >
      <Select.Label>{label}</Select.Label>
      <Select.Trigger>
        <Select.ValueText placeholder="Select language" />
      </Select.Trigger>
      <Select.Content>
        {options.map((lang) => (
          <Select.Item key={lang.code} item={lang.code}>
            <Select.ItemText>
              {lang.flag} {lang.name}
            </Select.ItemText>
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
