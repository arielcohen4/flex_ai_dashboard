import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface FamilyToLogo {
  [key: string]: string;
}

interface SearchableSelectProps<T> {
  options: T[];
  onValueChange: (value: string) => void;
  placeholder: string;
  familyToLogo: FamilyToLogo;
  renderOption?: (option: T) => React.ReactNode;
  isOptionDisabled?: (option: T) => boolean;
}

const SearchableSelect = ({
  options,
  onValueChange,
  placeholder,
  familyToLogo,
  renderOption,
  isOptionDisabled,
}: SearchableSelectProps<any>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Select
      onValueChange={(value) => {
        onValueChange(value);
        setIsOpen(false);
      }}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger onClick={() => setIsOpen(true)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {filteredOptions.map((option) => (
          <SelectItem
            key={option.id}
            value={option.name}
            disabled={isOptionDisabled?.(option)}
          >
            {renderOption ? (
              renderOption(option)
            ) : (
              <div className="flex items-center gap-2">
                {option.family &&
                  familyToLogo.hasOwnProperty(option.family) && (
                    <Image
                      src={`/model_families/${familyToLogo[option.family]}`}
                      alt={option.name}
                      width={14}
                      height={14}
                      className="rounded-lg"
                    />
                  )}
                <span>{option.name}</span>
              </div>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SearchableSelect;
