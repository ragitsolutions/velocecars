/**
 * Observador de los revelados al hacer scroll (components/motion/reveal.tsx). Va en línea al
 * final del <body>: se ejecuta mientras se lee el HTML, antes de hidratar, y un
 * MutationObserver recoge lo que se añade al navegar. Marca cada elemento con `data-inview`
 * (atributo que React no gestiona, así que no se pierde al volver a renderizar).
 * La clase `js-reveal` del <html> (CONSENT_BOOT_SCRIPT) es la que oculta lo pendiente: sin
 * JavaScript o sin IntersectionObserver todo se ve desde el principio.
 */
export const REVEAL_SCRIPT = `(function(){var d=document,h=d.documentElement,S='[data-reveal],[data-reveal-group],[data-reveal-text],[data-reveal-image]';
if(!('IntersectionObserver' in window)){h.classList.remove('js-reveal');return}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.setAttribute('data-inview','');io.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px'});
function scan(r){if(r.matches&&r.matches(S)&&!r.hasAttribute('data-inview'))io.observe(r);r.querySelectorAll(S).forEach(function(el){if(!el.hasAttribute('data-inview'))io.observe(el)})}
scan(d);new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})})}).observe(d.body,{childList:true,subtree:true})})();`;
