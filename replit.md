# مركز البيانات العالمي - Enterprise Hub

منظومة إدارية واستعلامية متعددة الدول لمعالجة البيانات الضخمة بدون اتصال إنترنت، مع دعم الفرز الذكي واستخراج العوائل.

## Run & Operate

- `pnpm --filter @workspace/iraq-data-hub run dev` — تشغيل التطبيق الرئيسي (الواجهة الأمامية)
- `pnpm --filter @workspace/api-server run dev` — تشغيل خادم API الاحتياطي
- `pnpm run typecheck` — فحص أنواع TypeScript

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS v4 (RTL Arabic)
- **Storage**: Dexie.js (IndexedDB) — تخزين محلي كامل بدون قاعدة بيانات خارجية
- **Parsers**: CSV, Excel (xlsx), JSON, XML, SQL, ZIP
- **Icons**: Lucide React

## Where things live

- `artifacts/iraq-data-hub/src/App.tsx` — الكومبوننت الرئيسي
- `artifacts/iraq-data-hub/src/services/db.ts` — قاعدة البيانات المحلية (Dexie/IndexedDB)
- `artifacts/iraq-data-hub/src/services/nerEngine.ts` — محرك استخراج البيانات العربية (NER)
- `artifacts/iraq-data-hub/src/services/queueManager.ts` — إدارة طابور معالجة الملفات
- `artifacts/iraq-data-hub/src/services/parsers/` — محللات الملفات (CSV, Excel, JSON, XML, SQL, ZIP)
- `artifacts/iraq-data-hub/src/components/` — جميع مكونات الواجهة

## Product Features

- **رفع الملفات**: دعم CSV, Excel, JSON, XML, SQL, ZIP مع طابور معالجة حي
- **استعلام المحافظات**: بحث حسب المحافظة لكافة دول النطاق المحلي/العالمي
- **البحث العميق**: تصفية متعددة المعايير (الاسم، العمر، المحافظة، الوظيفة)
- **البحث الموحد للهواتف**: استعلام فوري عبر شبكات زين وآسيا سيل وكورك
- **استخراج العائلات**: جلب أفراد العائلة من رقم العائلة
- **مسودة الحركات**: سجل زمني لجميع العمليات
- **إعدادات النظام**: إدارة الدول والمحافظات والقطاعات والملفات

## Countries Supported

العراق، سوريا، مصر، الأردن، المملكة العربية السعودية (مع دعم إضافة دول جديدة)

## User preferences

_Populate as you build._
