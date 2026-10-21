import { NextResponse, type NextRequest } from "next/server";

/**
 * Inventario: `/vehiculos` y `/vehiculos/[marca]` son estáticas (sin filtros). Si la URL trae
 * filtros, orden, vista o página, se reescribe a la versión dinámica `/inventario-filtrado/…`
 * sin cambiar la URL visible. `_rsc` lo añade Next en las navegaciones y no cuenta como filtro.
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasFilters = [...searchParams.keys()].some((key) => key !== "_rsc");
  if (!hasFilters) return NextResponse.next();

  const marca = pathname.match(/^\/vehiculos\/([a-z0-9-]+)$/)?.[1];
  if (marca === "comparar") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = marca ? `/inventario-filtrado/${marca}` : "/inventario-filtrado";
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/vehiculos", "/vehiculos/:marca"] };
