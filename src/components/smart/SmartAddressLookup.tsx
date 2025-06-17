import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { cvrService } from '../../services/cvrService';

interface AddressSuggestion {
  id: string;
  tekst: string;
  adresse: {
    vejnavn: string;
    husnr: string;
    postnr: string;
    postnrnavn: string;
  };
}

interface SmartAddressLookupProps {
  onAddressSelected: (address: {
    street: string;
    postalCode: string;
    city: string;
    fullAddress: string;
  }) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function SmartAddressLookup({ 
  onAddressSelected, 
  placeholder = "Indtast adresse...",
  initialValue = ""
}: SmartAddressLookupProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchAddresses = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      const result = await cvrService.searchAddresses(query);
      
      if (result.data) {
        setSuggestions(result.data);
        setShowSuggestions(result.data.length > 0);
      }
      
      setIsLoading(false);
    };

    const timeoutId = setTimeout(searchAddresses, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    const addressData = {
      street: `${suggestion.adresse.vejnavn} ${suggestion.adresse.husnr}`,
      postalCode: suggestion.adresse.postnr,
      city: suggestion.adresse.postnrnavn,
      fullAddress: suggestion.tekst
    };

    setQuery(suggestion.tekst);
    setShowSuggestions(false);
    onAddressSelected(addressData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center transition-colors ${
                index === selectedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {suggestion.adresse.vejnavn} {suggestion.adresse.husnr}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.adresse.postnr} {suggestion.adresse.postnrnavn}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-2 px-4 text-sm text-gray-500 ring-1 ring-black ring-opacity-5">
          Ingen adresser fundet for "{query}"
        </div>
      )}
    </div>
  );
}