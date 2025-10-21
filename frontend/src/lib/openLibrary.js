export const searchOpenLibrary = async (q, limit = 20) => {
  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!res.ok) throw new Error('OpenLibrary error');
  const data = await res.json();
  return (data.docs || []).map(doc => ({
    id: doc.key?.replace('/works/','') || doc.cover_edition_key || doc.edition_key?.[0] || (doc.isbn && doc.isbn[0]) || doc.key,
    title: doc.title,
    author: doc.author_name?.[0] || 'Autor desconocido',
    createdAt: doc.first_publish_year ? new Date(String(doc.first_publish_year)).toISOString() : null,
    genre: doc.subject?.[0] || 'Sin género',
    description: typeof doc.first_sentence === 'string' ? doc.first_sentence : (doc.first_sentence?.join(' ') || '')
  }));
};