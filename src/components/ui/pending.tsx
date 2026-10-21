/** Marcador visible para datos que debe aportar el cliente (docs/pendientes-cliente.md). */
export function Pending({ children }: { children: string }) {
  const text = children.startsWith("[[") ? children : `[[PENDIENTE: ${children}]]`;
  return (
    <span className="pending-marker" title="Dato pendiente de confirmar por el cliente">
      {text}
    </span>
  );
}

/** Renderiza un texto que puede contener marcadores [[PENDIENTE: …]] destacándolos. */
export function WithPending({ text }: { text: string }) {
  const parts = text.split(/(\[\[PENDIENTE:[^\]]*\]\])/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("[[PENDIENTE") ? <Pending key={i}>{part}</Pending> : part,
      )}
    </>
  );
}
