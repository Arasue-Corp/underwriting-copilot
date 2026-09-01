import io
with io.open('web/src/app/actions/quote.ts', 'r', encoding='utf-8') as f:
    c = f.read()

# updateQuoteStatus
c = c.replace(
    '  const { error } = await supabase\n    .from(\"quote_requests\")\n    .update(updates)\n    .eq(\"id\", quoteId)\n\n  if (error) {',
    '  const { error } = await supabase\n    .from(\"quote_requests\")\n    .update(updates)\n    .eq(\"id\", quoteId)\n\n  if (!error && status === \"ACCEPTED\") {\n    await autoCreatePolicies(quoteId, supabase)\n  }\n\n  if (error) {'
)

# acceptClientQuote
c = c.replace(
    '  const { error } = await supabase\n    .from(\"quote_requests\")\n    .update(updates)\n    .eq(\"id\", quoteId)\n\n  if (error) {\n    console.error(\"Error updating quote status:\", error)\n  }',
    '  const { error } = await supabase\n    .from(\"quote_requests\")\n    .update(updates)\n    .eq(\"id\", quoteId)\n\n  if (!error) {\n    await autoCreatePolicies(quoteId, supabase)\n  }\n\n  if (error) {\n    console.error(\"Error updating quote status:\", error)\n  }'
)

with io.open('web/src/app/actions/quote.ts', 'w', encoding='utf-8') as f:
    f.write(c)
