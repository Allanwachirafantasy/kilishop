import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role client to bypass RLS for server-side import
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ImportProductBody {
  name: string;
  description: string;
  category: string;
  price: number;
  mainImage: string;
  images?: string[];
  colors?: string[];
  hasVariants?: boolean;
  variantType?: string;
  supplier?: string;
  supplierUrl?: string;
  status?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function getOrCreateCategory(categoryName: string): Promise<string | null> {
  // Try to find existing category
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('id')
    .ilike('name', categoryName)
    .single();

  if (existing) return existing.id;

  // Auto-create category if not found
  let slug = generateSlug(categoryName);
  const { data: created, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: categoryName,
      slug,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) return null;
  return created.id;
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { data } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!data) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function POST(request: NextRequest) {
  // --- API Key Authentication ---
  const importApiKey = request.headers.get('x-import-api-key');
  const expectedKey = process.env.IMPORT_API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Import API key is not configured on the server.' },
      { status: 500 }
    );
  }

  if (!importApiKey || importApiKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Invalid or missing x-import-api-key header.' },
      { status: 401 }
    );
  }

  // --- Parse Body ---
  let body: ImportProductBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  // --- Validate Required Fields ---
  const requiredFields: (keyof ImportProductBody)[] = ['name', 'description', 'category', 'price', 'mainImage'];
  const missingFields = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      },
      { status: 400 }
    );
  }

  if (typeof body.price !== 'number' || body.price < 0) {
    return NextResponse.json(
      { success: false, error: 'Field "price" must be a non-negative number.' },
      { status: 400 }
    );
  }

  // --- Resolve Category ---
  const categoryId = await getOrCreateCategory(body.category);
  if (!categoryId) {
    return NextResponse.json(
      { success: false, error: `Failed to resolve or create category: ${body.category}` },
      { status: 500 }
    );
  }

  // --- Generate Unique Slug ---
  const baseSlug = generateSlug(body.name);
  let slug = await ensureUniqueSlug(baseSlug);

  // --- Insert Product ---
  const productData = {
    name: body.name,
    slug,
    description: body.description,
    category_id: categoryId,
    price: body.price,
    cover_image_url: body.mainImage,
    image_url: body.mainImage,
    colors: body.colors ?? [],
    has_variants: body.hasVariants ?? false,
    variant_type: body.variantType ?? '',
    supplier: body.supplier ?? '',
    supplier_url: body.supplierUrl ?? '',
    is_active: body.status === 'active' || body.status === undefined,
    stock: 0,
  };

  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert(productData)
    .select('id')
    .single();

  if (productError || !product) {
    return NextResponse.json(
      {
        success: false,
        error: productError?.message ?? 'Failed to insert product.',
      },
      { status: 500 }
    );
  }

  const productId = product.id;

  // --- Insert Cover Image into product_images ---
  const imageInserts: { product_id: string; image_url: string; is_cover: boolean; sort_order: number }[] = [
    {
      product_id: productId,
      image_url: body.mainImage,
      is_cover: true,
      sort_order: 0,
    },
  ];

  // --- Insert Extra Gallery Images ---
  if (Array.isArray(body.images) && body.images.length > 0) {
    body.images.forEach((url, index) => {
      if (url) {
        imageInserts.push({
          product_id: productId,
          image_url: url,
          is_cover: false,
          sort_order: index + 1,
        });
      }
    });
  }

  const { error: imagesError } = await supabaseAdmin
    .from('product_images')
    .insert(imageInserts);

  if (imagesError) {
    // Product was created but images failed — return partial success with warning
    return NextResponse.json(
      {
        success: true,
        productId,
        warning: `Product created but images could not be saved: ${imagesError.message}`,
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      productId,
      message: `Product "${body.name}" imported successfully.`,
    },
    { status: 201 }
  );
}
