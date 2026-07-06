export interface Category {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  coverEmoji: string; // Pratique pour simuler une couverture sans charger d'images lourdes
  fileUrl: string;    // URL d'un PDF de test public pour ton BookReader
}

export const MOCK_CATEGORIES: Category[] = [
  { id: 'all', name: 'Tous les livres' },
  { id: 'cat-1', name: 'Sécurité & Hacking' },
  { id: 'cat-2', name: 'Cryptographie' },
  { id: 'cat-3', name: 'Réseaux Archivés' },
];

export const MOCK_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Manuel de Pentest Réseau',
    author: 'Alexandre Ivanov',
    categoryId: 'cat-1',
    coverEmoji: '💻',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'book-2',
    title: 'Introduction au Chiffrement Quantique',
    author: 'Hélène Curie',
    categoryId: 'cat-2',
    coverEmoji: '🔐',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'book-3',
    title: 'Protocoles Réseaux Souterrains',
    author: 'Marc Protocole',
    categoryId: 'cat-3',
    coverEmoji: '🌐',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'book-4',
    title: 'Analyse de Malwares Avancée',
    author: 'Alexandre Ivanov',
    categoryId: 'cat-1',
    coverEmoji: '☣️',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];
