# Bilingual Admin Pages Update Guide

## Overview
This guide shows how to update admin management pages to support bilingual (English + Arabic) content input.

## General Pattern

For each admin page that manages database content, you need to:

1. **Update the TypeScript interface** to include Arabic fields
2. **Update the form state** to include Arabic fields
3. **Add Arabic input fields** to the form with `dir="rtl"` and `text-right`
4. **Update save/update operations** to include Arabic fields
5. **Update the data fetching** to include Arabic columns

## Example: NewsManagement.tsx

### Step 1: Update Interface

```typescript
interface Article {
  id: string;
  title: string;
  title_ar: string;  // Add this
  excerpt: string;
  description_ar: string;  // Add this (maps to excerpt)
  content: string;
  content_ar: string;  // Add this
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
}
```

### Step 2: Update Form State

```typescript
const [formData, setFormData] = useState({
  title: '',
  title_ar: '',  // Add this
  excerpt: '',
  description_ar: '',  // Add this
  content: '',
  content_ar: '',  // Add this
  category: 'Community',
  author: 'YCA Birmingham',
  image_url: '',
});
```

### Step 3: Update handleOpenModal for Editing

```typescript
const handleOpenModal = (article?: Article) => {
  if (article) {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      title_ar: article.title_ar || '',  // Add this
      excerpt: article.excerpt,
      description_ar: article.description_ar || '',  // Add this
      content: article.content,
      content_ar: article.content_ar || '',  // Add this
      category: article.category,
      author: article.author,
      image_url: article.image_url || '',
    });
  } else {
    setEditingArticle(null);
    setFormData({
      title: '',
      title_ar: '',  // Add this
      excerpt: '',
      description_ar: '',  // Add this
      content: '',
      content_ar: '',  // Add this
      category: 'Community',
      author: 'YCA Birmingham',
      image_url: '',
    });
  }
  setShowModal(true);
};
```

### Step 4: Add Arabic Input Fields to Form

Add Arabic fields right after their English counterparts:

```typescript
{/* English Title */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Title (English)
  </label>
  <input
    type="text"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    required
  />
</div>

{/* Arabic Title */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Title (Arabic) - العنوان
  </label>
  <input
    type="text"
    value={formData.title_ar}
    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
    dir="rtl"
    placeholder="أدخل العنوان بالعربية"
  />
</div>

{/* English Excerpt */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Excerpt (English)
  </label>
  <textarea
    value={formData.excerpt}
    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
    rows={3}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    required
  />
</div>

{/* Arabic Excerpt */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Excerpt (Arabic) - الوصف
  </label>
  <textarea
    value={formData.description_ar}
    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
    rows={3}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
    dir="rtl"
    placeholder="أدخل الوصف بالعربية"
  />
</div>

{/* English Content */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Content (English)
  </label>
  <textarea
    value={formData.content}
    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
    rows={10}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
    required
  />
</div>

{/* Arabic Content */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Content (Arabic) - المحتوى
  </label>
  <textarea
    value={formData.content_ar}
    onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
    rows={10}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-right"
    dir="rtl"
    placeholder="أدخل المحتوى بالعربية"
  />
</div>
```

### Step 5: Update handleSubmit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);

  try {
    const articleData = {
      title: formData.title,
      title_ar: formData.title_ar,  // Add this
      excerpt: formData.excerpt,
      description_ar: formData.description_ar,  // Add this
      content: formData.content,
      content_ar: formData.content_ar,  // Add this
      category: formData.category,
      author: formData.author,
      image_url: formData.image_url || null,
      published_at: editingArticle?.published_at || new Date().toISOString(),
    };

    if (editingArticle) {
      const { error } = await supabase
        .from('news')
        .update(articleData)
        .eq('id', editingArticle.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from('news').insert([articleData]);

      if (error) throw error;
    }

    await fetchArticles();
    handleCloseModal();
  } catch (error) {
    console.error('Error saving article:', error);
    alert('Failed to save article. Please try again.');
  } finally {
    setSaving(false);
  }
};
```

## Admin Pages That Need Updates

Apply this pattern to the following admin pages:

### 1. **NewsManagement.tsx**
- Fields: `title_ar`, `description_ar`, `content_ar`

### 2. **EventsManagement.tsx**
- Fields: `title_ar`, `description_ar`, `location_ar`

### 3. **ServicesManagement.tsx**
- Fields: `title_ar`, `description_ar`

### 4. **ProgrammesManagement.tsx**
- Fields: `title_ar`, `description_ar`, `content_ar`

### 5. **ResourcesManagement.tsx**
- Fields: `title_ar`, `description_ar`

### 6. **TeamManagement.tsx**
- Fields: `role_ar`, `bio_ar`

### 7. **HeroManagement.tsx**
- Fields: `title_ar`, `description_ar`

### 8. **ContentManagement.tsx**
- This one is special - the `content` field is JSON and should support:
  ```json
  {
    "text_en": "English text",
    "text_ar": "Arabic text",
    "image": "url"
  }
  ```
- Also add: `title_ar` field

## Important CSS Classes for Arabic Input

Always use these classes for Arabic input fields:

```typescript
className="... text-right"  // Right-align text
dir="rtl"  // Right-to-left direction
placeholder="النص بالعربية"  // Arabic placeholder
```

## Frontend Display Logic

When displaying content from the database on frontend pages, use this pattern:

```typescript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { language } = useLanguage();
  const [data, setData] = useState(null);

  // Fetch data including Arabic fields
  const fetchData = async () => {
    const { data } = await supabase
      .from('news')
      .select('*');
    setData(data);
  };

  // Display with fallback to English
  const getTitle = (item) => {
    return language === 'ar' && item.title_ar
      ? item.title_ar
      : item.title;
  };

  return (
    <div>
      <h1>{getTitle(data)}</h1>
    </div>
  );
}
```

## Database Schema Reference

The following columns have been added via migration:

```sql
-- hero_slides
title_ar text
description_ar text

-- services_content
title_ar text
description_ar text

-- programmes_items
title_ar text
description_ar text
content_ar text

-- resources_items
title_ar text
description_ar text

-- team_members
role_ar text
bio_ar text

-- events
title_ar text
description_ar text
location_ar text

-- news
title_ar text
description_ar text
content_ar text

-- page_content
title_ar text
description_ar text

-- content_sections
title_ar text
```

## Testing Checklist

After updating each admin page:

1. ✅ Can add new item with English + Arabic
2. ✅ Can edit existing item and update both languages
3. ✅ Arabic inputs show RTL and right-aligned
4. ✅ Frontend displays correct language based on toggle
5. ✅ Falls back to English when Arabic is empty
6. ✅ All fields save correctly to database

## Notes

- **Arabic fields are optional** - the system will fallback to English if Arabic is not provided
- **English is the primary language** - always required
- **No auto-translation** - admins must manually enter Arabic content
- **RTL is critical** - always use `dir="rtl"` for Arabic inputs
- **Test thoroughly** - verify both languages display correctly on frontend
