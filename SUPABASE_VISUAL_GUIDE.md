# 🎬 صور توضيحية (نصية) لـ Supabase Setup

## 1️⃣ صفحة Storage

```
┌─────────────────────────────────────────┐
│ Supabase Console                        │
├─────────────────────────────────────────┤
│ Left Sidebar:                           │
│ ├─ Home                                 │
│ ├─ SQL Editor                           │
│ ├─ Authentication                       │
│ ├─ Storage ← اضغط هنا                   │
│ │  ├─ Buckets                           │
│ │  └─ Configuration                     │
│ └─ ...                                  │
└─────────────────────────────────────────┘
```

## 2️⃣ أنشئ Bucket جديد

```
┌──────────────────────────────────┐
│ Storage / Buckets                │
├──────────────────────────────────┤
│ [+ New bucket] (أزرق)            │
│                                  │
│ Existing Buckets:                │
│ ├─ (إذا ما في buckets،           │
│ │  رح تشوف "No buckets yet")     │
└──────────────────────────────────┘
```

## 3️⃣ نافذة Create Bucket

```
┌──────────────────────────────────┐
│ Create a new bucket              │
├──────────────────────────────────┤
│ Name: [audit-evidence________]   │
│                                  │
│ ☑ Public bucket                  │
│   (يجب يكون مختار!)              │
│                                  │
│ [Cancel]  [Create new bucket]   │
└──────────────────────────────────┘
```

## 4️⃣ SQL Editor - انسخ الكود

```
┌──────────────────────────────────┐
│ SQL Editor                       │
├──────────────────────────────────┤
│ [+ New Query]                    │
│                                  │
│ -- اكتب أو انسخ الكود هنا        │
│ create table if not exists...   │
│                                  │
│ [Run]  [Format]  [Save]         │
│                                  │
│ ✓ Success                        │
└──────────────────────────────────┘
```

## 5️⃣ Policies Tab

```
┌──────────────────────────────────┐
│ audit-evidence / Policies        │
├──────────────────────────────────┤
│ Tabs:                            │
│ - Overview                       │
│ - Policies ← اختر هنا            │
│ - Objects                        │
│                                  │
│ [+ New Policy]                   │
│                                  │
│ Existing Policies:               │
│ ├─ (سيظهر بعد إضافة)            │
└──────────────────────────────────┘
```

## 6️⃣ CORS Configuration

```
┌──────────────────────────────────┐
│ Storage / Configuration          │
├──────────────────────────────────┤
│ CORS Allowed Origins:            │
│                                  │
│ Origins (line separated):        │
│ ┌──────────────────────────┐     │
│ │ http://localhost:3000    │     │
│ │ http://localhost:3001    │     │
│ │ https://yourdomain.com   │     │
│ └──────────────────────────┘     │
│                                  │
│ [+ Add Allowed Origin]           │
│ [Save]                           │
└──────────────────────────────────┘
```

## 7️⃣ الملفات بعد الرفع

```
┌──────────────────────────────────┐
│ audit-evidence / Objects         │
├──────────────────────────────────┤
│ Folders:                         │
│ ├─ AUDIT-ID-1/                   │
│ │  ├─ site-cover/                │
│ │  │  └─ 123456_photo.jpg        │
│ │  ├─ 123456_doc.pdf             │
│ │  └─ 123456_image.png           │
│ └─ AUDIT-ID-2/                   │
│    └─ ...                        │
└──────────────────────────────────┘
```

## 📋 Checklist نهائي:

```
✅ Storage > Buckets
   ✓ Bucket اسمه "audit-evidence"
   ✓ Public bucket: مختار

✅ SQL Editor
   ✓ جدول audit_files: موجود
   ✓ RLS: فعّل (enabled)

✅ Policies
   ✓ select policy: موجود
   ✓ insert policy: موجود
   ✓ delete policy: موجود

✅ Configuration
   ✓ CORS: localhost:3000 موجود

✅ .env.local
   ✓ SUPABASE_URL: موجود
   ✓ SUPABASE_ANON_KEY: موجود

✅ في التطبيق:
   ✓ Upload يشتغل
   ✓ صور تظهر
```

---

## 🎥 الترتيب الصحيح:

1. ✅ افتح Supabase
2. ✅ اذهب Storage → Buckets
3. ✅ اعمل New Bucket: audit-evidence
4. ✅ اذهب SQL Editor
5. ✅ اجري الكود (جدول + RLS)
6. ✅ اذهب audit-evidence → Policies
7. ✅ أضف 3 policies
8. ✅ اذهب Configuration
9. ✅ أضف CORS origins
10. ✅ في .env.local أضف المتغيرات
11. ✅ جرّب الرفع في التطبيق

---

**الحين جاهز للعمل!** 🚀
