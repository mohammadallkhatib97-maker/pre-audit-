# 📁 Supabase Storage Setup Guide

## المشكلة: الملفات لا تُرفع

إذا كنت تواجه مشاكل في رفع الصور أو الملفات، اتبع هذه الخطوات:

## ✅ الخطوات المطلوبة:

### 1️⃣ إنشاء Storage Bucket

```
في Supabase Console:
1. اذهب إلى Storage → Buckets
2. انقر على "New bucket"
3. اسم Bucket: audit-evidence
4. اجعله Public: تشغيل ✓
5. انقر Create
```

### 2️⃣ تعيين سياسات الأمان (Policies)

```sql
-- For authenticated users to upload
create policy "Allow authenticated users to upload"
on storage.objects
for insert
with check (
  bucket_id = 'audit-evidence' 
  and auth.role() = 'authenticated'
);

-- For public read access
create policy "Allow public read access"
on storage.objects
for select
using (bucket_id = 'audit-evidence');

-- For users to delete their own files
create policy "Allow users to delete their own files"
on storage.objects
for delete
using (
  bucket_id = 'audit-evidence'
  and auth.uid() = owner
);
```

### 3️⃣ التحقق من CORS

```
في Supabase Console:
1. اذهب إلى Storage → Configuration
2. في CORS، تأكد من وجود:
   - http://localhost:3000 (for development)
   - https://yourdomain.com (for production)
```

### 4️⃣ جدول قاعدة البيانات

تأكد من وجود جدول `audit_files`:

```sql
create table if not exists audit_files (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references audits(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  uploaded_by uuid references auth.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table audit_files enable row level security;

-- Create policies
create policy "Allow users to read files for their audits"
on audit_files for select
using (auth.uid() = uploaded_by);

create policy "Allow users to insert files"
on audit_files for insert
with check (auth.uid() = uploaded_by);

create policy "Allow users to delete their files"
on audit_files for delete
using (auth.uid() = uploaded_by);
```

## 🔧 استكشاف الأخطاء:

### المشكلة: "Bucket not found"
✅ الحل: تأكد من إنشاء bucket باسم `audit-evidence`

### المشكلة: "Access denied"
✅ الحل: تحقق من سياسات الأمان (Policies)

### المشكلة: CORS Error
✅ الحل: أضف دومينك في إعدادات CORS

### المشكلة: الملف يُرفع لكن الصورة لا تظهر
✅ الحل: تأكد من أن Bucket عام (Public)

## 📋 الحد الأقصى للملفات:

- **صور الموقع**: 5 MB
- **الملفات الأخرى**: 50 MB

## 🧪 اختبار الرفع:

1. افتح النموذج
2. اختر ملف
3. انقر "رفع"
4. يجب أن تظهر رسالة "✓ تم الرفع بنجاح!"
5. إذا حدث خطأ، افحص console (F12)

## 📞 للمساعدة:

- افتح Developer Tools (F12)
- انسخ رسالة الخطأ من Console
- شارك الرسالة مع فريق الدعم

---

**ملاحظة**: جميع الملفات المرفوعة تُخزن في `audit-evidence` bucket ويمكن الوصول إليها من خلال الـ public URLs.
