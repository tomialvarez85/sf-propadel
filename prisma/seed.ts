import { Genero, PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// Next.js Image Optimization blocks SVG by default, and placehold.co serves
// SVG unless a raster format is requested explicitly via the extension.
const PLACEHOLDER_IMAGE = "https://placehold.co/800x800/e4e4e7/71717a.png";

async function main() {
  const categories = await Promise.all(
    [
      { nombre: "Paletas", slug: "paletas", orden: 1 },
      { nombre: "Indumentaria", slug: "indumentaria", orden: 2 },
      { nombre: "Calzado", slug: "calzado", orden: 3 },
      { nombre: "Accesorios", slug: "accesorios", orden: 4 },
      { nombre: "Bolsos", slug: "bolsos", orden: 5 },
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      }),
    ),
  );
  const [paletas, indumentaria, calzado, accesorios, bolsos] = categories;

  const brands = await Promise.all(
    [
      { nombre: "Adidas", slug: "adidas" },
      { nombre: "Nox", slug: "nox" },
      { nombre: "Bullpadel", slug: "bullpadel" },
      { nombre: "Head", slug: "head" },
    ].map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: {},
        create: brand,
      }),
    ),
  );
  const [adidas, nox, bullpadel, head] = brands;

  const products = [
    {
      nombre: "Paleta Adidas Metalbone 3.3",
      slug: "paleta-adidas-metalbone-3-3",
      descripcion:
        "Paleta de gama alta con forma de diamante, ideal para jugadores de ataque.",
      precio: 320000,
      precioAnterior: 380000,
      stock: 8,
      destacado: true,
      enOferta: true,
      categoryId: paletas.id,
      brandId: adidas.id,
      variants: [],
    },
    {
      nombre: "Paleta Nox AT10 Genius",
      slug: "paleta-nox-at10-genius",
      descripcion: "Paleta redonda de control, firma Agustín Tapia.",
      precio: 295000,
      stock: 10,
      destacado: true,
      enOferta: false,
      categoryId: paletas.id,
      brandId: nox.id,
      variants: [],
    },
    {
      nombre: "Paleta Bullpadel Vertex 04",
      slug: "paleta-bullpadel-vertex-04",
      descripcion:
        "Paleta híbrida de gran polivalencia entre control y potencia.",
      precio: 270000,
      precioAnterior: 305000,
      stock: 6,
      destacado: false,
      enOferta: true,
      categoryId: paletas.id,
      brandId: bullpadel.id,
      variants: [],
    },
    {
      nombre: "Paleta Head Extreme Pro",
      slug: "paleta-head-extreme-pro",
      descripcion: "Paleta de forma diamante pensada para jugadores avanzados.",
      precio: 260000,
      stock: 12,
      destacado: false,
      enOferta: false,
      categoryId: paletas.id,
      brandId: head.id,
      variants: [],
    },
    {
      nombre: "Remera Adidas Padel Tee",
      slug: "remera-adidas-padel-tee",
      descripcion: "Remera técnica transpirable para jugar con comodidad.",
      precio: 35000,
      stock: 30,
      genero: Genero.HOMBRE,
      destacado: false,
      enOferta: false,
      categoryId: indumentaria.id,
      brandId: adidas.id,
      variants: [
        { tipo: "Talle", valor: "S", stock: 6 },
        { tipo: "Talle", valor: "M", stock: 10 },
        { tipo: "Talle", valor: "L", stock: 8 },
        { tipo: "Talle", valor: "XL", stock: 6 },
      ],
    },
    {
      nombre: "Short Bullpadel Competición",
      slug: "short-bullpadel-competicion",
      descripcion: "Short deportivo con tejido elástico de secado rápido.",
      precio: 28000,
      precioAnterior: 34000,
      stock: 20,
      genero: Genero.MUJER,
      destacado: false,
      enOferta: true,
      categoryId: indumentaria.id,
      brandId: bullpadel.id,
      variants: [
        { tipo: "Talle", valor: "S", stock: 5 },
        { tipo: "Talle", valor: "M", stock: 8 },
        { tipo: "Talle", valor: "L", stock: 7 },
      ],
    },
    {
      nombre: "Campera Head Club Jacket",
      slug: "campera-head-club-jacket",
      descripcion: "Campera liviana rompeviento para entrada en calor.",
      precio: 62000,
      stock: 15,
      genero: Genero.UNISEX,
      destacado: true,
      enOferta: false,
      categoryId: indumentaria.id,
      brandId: head.id,
      variants: [
        { tipo: "Talle", valor: "M", stock: 7 },
        { tipo: "Talle", valor: "L", stock: 8 },
      ],
    },
    {
      nombre: "Zapatillas Adidas Adizero Ubersonic",
      slug: "zapatillas-adidas-adizero-ubersonic",
      descripcion: "Zapatillas de alta estabilidad para superficies de pádel.",
      precio: 145000,
      stock: 14,
      genero: Genero.HOMBRE,
      destacado: true,
      enOferta: false,
      categoryId: calzado.id,
      brandId: adidas.id,
      variants: [
        { tipo: "Talle", valor: "40", stock: 3 },
        { tipo: "Talle", valor: "41", stock: 4 },
        { tipo: "Talle", valor: "42", stock: 4 },
        { tipo: "Talle", valor: "43", stock: 3 },
      ],
    },
    {
      nombre: "Zapatillas Nox ML10",
      slug: "zapatillas-nox-ml10",
      descripcion:
        "Zapatillas de amortiguación reforzada, firma Miguel Lamperti.",
      precio: 130000,
      precioAnterior: 155000,
      stock: 9,
      genero: Genero.MUJER,
      destacado: false,
      enOferta: true,
      categoryId: calzado.id,
      brandId: nox.id,
      variants: [
        { tipo: "Talle", valor: "39", stock: 2 },
        { tipo: "Talle", valor: "40", stock: 3 },
        { tipo: "Talle", valor: "41", stock: 4 },
      ],
    },
    {
      nombre: "Grip Bullpadel Overgrip x3",
      slug: "grip-bullpadel-overgrip-x3",
      descripcion: "Pack de 3 overgrips de alta adherencia.",
      precio: 12000,
      stock: 50,
      destacado: false,
      enOferta: false,
      categoryId: accesorios.id,
      brandId: bullpadel.id,
      variants: [
        { tipo: "Color", valor: "Negro", stock: 25 },
        { tipo: "Color", valor: "Blanco", stock: 25 },
      ],
    },
    {
      nombre: "Muñequera Head Terry",
      slug: "munequera-head-terry",
      descripcion: "Muñequera absorbente de algodón, par.",
      precio: 8000,
      stock: 40,
      destacado: false,
      enOferta: false,
      categoryId: accesorios.id,
      brandId: head.id,
      variants: [],
    },
    {
      nombre: "Paletero Nox Team Bag",
      slug: "paletero-nox-team-bag",
      descripcion: "Bolso paletero con compartimento térmico para 3 paletas.",
      precio: 78000,
      precioAnterior: 92000,
      stock: 11,
      destacado: true,
      enOferta: true,
      categoryId: bolsos.id,
      brandId: nox.id,
      variants: [
        { tipo: "Color", valor: "Negro", stock: 6 },
        { tipo: "Color", valor: "Azul", stock: 5 },
      ],
    },
  ];

  for (const { variants, ...product } of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });

    await prisma.productImage.upsert({
      where: { id: `${created.id}-seed-image` },
      update: {},
      create: {
        id: `${created.id}-seed-image`,
        productId: created.id,
        url: PLACEHOLDER_IMAGE,
        orden: 1,
      },
    });

    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { id: `${created.id}-${variant.tipo}-${variant.valor}` },
        update: {},
        create: {
          id: `${created.id}-${variant.tipo}-${variant.valor}`,
          productId: created.id,
          ...variant,
        },
      });
    }
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      whatsapp: "5491122334455",
      instagram: "https://instagram.com/sfpropadel",
      email: "hola@sfpropadel.com.ar",
      direccion: "Av. Siempre Viva 1234, San Fernando, Buenos Aires",
      textoEnvioGratis: "Envío gratis en compras mayores a $100.000",
      textoCuotas: "6 cuotas sin interés",
    },
  });

  console.log(
    `Seed OK: ${categories.length} categorías, ${brands.length} marcas, ${products.length} productos, 1 SiteSettings.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
