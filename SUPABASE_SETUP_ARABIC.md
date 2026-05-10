# 🎯 دليل Supabase خطوة بخطوة

## الخطوة 1️⃣: إنشاء Bucket

```
1. افتح: https://app.supabase.com
2. اختر مشروعك
3. من القائمة اليسار: Storage → Buckets
4. انقر زر "New bucket" (أزرق)
5. اكتب الاسم: audit-evidence
6. علامة ✓ عند "Public bucket"
7. انقر "Create new bucket"
```

## الخطوة 2️⃣: إضافة جداول قاعدة البيانات

```
1. من القائمة اليسار: SQL Editor
2. انقر "New Query"
3. انسخ الكود التالي:
```

### النص الذي تنسخه:

```sql
-- إنشاء جدول الملفات
create table if not exists audit_files (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null,
  file_name text not null,
  file_path text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- تفعيل الأمان
alter table audit_files enable row level security;

-- سياسات الوصول
create policy "public read"
on audit_files for select
using (true);

create policy "authenticated insert"
on audit_files for insert
with check (auth.uid() is not null);

create policy "user delete"
on audit_files for delete
using (auth.uid() = uploaded_by);
```

**ثم:**
```
- انقر زر "Run" (الزر الأزرق)
- انتظر: "Success"
```

## الخطوة 3️⃣: إضافة سياسات Storage

```
1. اذهب: Storage → Buckets → audit-evidence
2. ستجد tabs في الأعلى
3. اختر "Policies" tab
4. انقر "+ New policy"
5. اختر: "For INSERT"
6. ضع اسم: allow-insert
7. اختر: Authenticated users
8. انقر "Create"
```

**ثم كرّر لـ SELECT و DELETE:**

```
عادّل وأضف:
- SELECT policy: allow-select
- DELETE policy: allow-delete
```

## الخطوة 4️⃣: إعدادات CORS

```
1. اذهب: Storage → Configuration
2. في CORS Settings، ستجد قائمة
3. تأكد أن الآتي موجود:
```

**الآتي يجب أن يكون موجود:**
```
http://localhost:3000
http://localhost:3001
https://yourdomain.com
```

إذا ما في حاجة:
```
1. انقر "Add Allowed Origin"
2. اكتب: http://localhost:3000
3. انقر "Save"
```

## الخطوة 5️⃣: التحقق من Environment Variables

**في ملفك `.env.local`:**

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
ANTHROPIC_API_KEY=YOUR_CLAUDE_KEY
```

**كيف تحصل عليها:**
```
1. اذهب: Settings → API
2. انسخ "Project URL"
3. انسخ "anon (public)" تحت Keys
```

## 🧪 اختبار الرفع

```
1. افتح التطبيق: http://localhost:3000
2. اذهب إلى audit
3. اضغط Upload Photo
4. اختر صورة
5. يجب تشوف: ✓ تم الرفع بنجاح!
```

## ❌ إذا ما اشتغل؟

### خطأ: "Bucket not found"
```
الحل: تأكد من اسم البوكيت: audit-evidence
```

### خطأ: "Access denied"
```
الحل: أضف سياسات الأمان (خطوة 3)
```

### خطأ: CORS error
```
الحل: أضف localhost:3000 بـ CORS (خطوة 4)
```

## 📝 ملاحظات مهمة:

✅ البوكيت اسمه يجب يكون: `audit-evidence` بالضبط  
✅ Public bucket: علامة ✓  
✅ جدول audit_files: مهم جداً  
✅ سياسات الأمان: يجب تضيفها  
✅ CORS: يجب تكون localhost:3000 موجود  

---

**هل خلصت من هذه الخطوات كلها؟**  
إذا عندك مشكلة، قول لي أي خطوة مو واضحة! 🤔
