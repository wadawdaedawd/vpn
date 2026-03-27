import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SOURCES = [
  "https://tartaness.webs.vc:2096/sub/c19uhchreg7q3640",
  "https://connect.stealthsurf.app/to/97da937798b713f2f55895d7a42999b5"
];

async function fetchAndDecode(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) return "";
    
    let text = await response.text();
    text = text.trim();

    // Проверяем, не зашифрован ли контент в Base64 (стандарт для многих подписок)
    try {
      return atob(text);
    } catch {
      // Если это не Base64, возвращаем как есть (набор строк vless://)
      return text;
    }
  } catch (err) {
    console.error(`Ошибка при загрузке ${url}:`, err);
    return "";
  }
}

serve(async (req: Request) => {
  // Собираем данные со всех источников параллельно
  const results = await Promise.all(SOURCES.map(fetchAndDecode));
  
  // Объединяем, убираем пустые строки и дубликаты
  const combined = results
    .join("\n")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const uniqueConfigs = Array.from(new Set(combined)).join("\n");

  return new Response(uniqueConfigs, {
    headers: { 
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache" 
    },
  });
});
