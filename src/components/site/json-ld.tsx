/** Renders a schema.org JSON-LD block. `<` is escaped so no field value
 * (product name/description pulled from the DB) can break out of the
 * <script> tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
