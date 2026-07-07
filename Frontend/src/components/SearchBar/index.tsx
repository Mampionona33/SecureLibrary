import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { styles } from './styles'; // 👈 Importation du style isolé

interface SearchBarProps<T> {
  data: T[]; 
  searchKeys: (keyof T)[]; 
  onFilterResults: (filteredData: T[]) => void; 
  placeholder?: string;
}

export function SearchBar<T>({
  data,
  searchKeys,
  onFilterResults,
  placeholder = "Rechercher...",
}: SearchBarProps<T>) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      onFilterResults(data);
      return;
    }

    const formattedQuery = query.toLowerCase().trim();

    const filtered = data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (value !== null && value !== undefined) {
          return String(value).toLowerCase().includes(formattedQuery);
        }
        return false;
      });
    });

    onFilterResults(filtered);
  }, [query, data, searchKeys]);

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
