import React, { useEffect, useState } from 'react';
import './Cabecera.css';

// Enlaces a la web oficial de Bizkaibus (bizkaia.eus)
const ENLACES_OFICIALES = [
  { texto: 'Lineak', descripcion: 'Líneas', href: 'https://www.bizkaia.eus/eu/web/bizkaibus/lineak' },
  { texto: 'Geralekuak', descripcion: 'Paradas', href: 'https://www.bizkaia.eus/eu/web/bizkaibus/geralekuak' },
  { texto: 'Tarifak', descripcion: 'Tarifas', href: 'https://www.bizkaia.eus/eu/web/bizkaibus/tarifak' },
  { texto: 'Bezero arreta', descripcion: 'Atención al cliente', href: 'https://www.bizkaia.eus/eu/web/bizkaibus/bezero-arreta' },
  { texto: 'Bizkaibusi buruz', descripcion: 'Sobre Bizkaibus', href: 'https://www.bizkaia.eus/eu/web/bizkaibus/bizkaibusi-buruz' },
];

function IconoBus() {
  return (
    <svg className="cab-logo-icono" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3" width="16" height="15" rx="3" fill="currentColor" />
      <rect x="6.5" y="5.5" width="11" height="5.5" rx="1" fill="var(--cab-fondo)" />
      <circle cx="8.5" cy="14.5" r="1.3" fill="var(--cab-fondo)" />
      <circle cx="15.5" cy="14.5" r="1.3" fill="var(--cab-fondo)" />
      <rect x="6" y="18" width="3" height="3" rx="1" fill="currentColor" />
      <rect x="15" y="18" width="3" height="3" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconoExterno() {
  return (
    <svg className="cab-externo" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9 2h5v5M14 2 7.5 8.5M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"
        fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Cabecera() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cerrar el menú móvil con Escape
  useEffect(() => {
    if (!menuAbierto) return;
    const alPulsar = (e) => { if (e.key === 'Escape') setMenuAbierto(false); };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [menuAbierto]);

  return (
    <header className="cab">
      <div className="cab-barra">
        <a className="cab-marca" href="/" aria-label="Bizkaiko Busak, hasiera / inicio">
          <IconoBus />
          <span className="cab-marca-texto">
            <span className="cab-titulo">Bizkaiko Busak</span>
            <span className="cab-subtitulo">Autobusak denbora errealean · Autobuses en tiempo real</span>
            <span className="cab-insignia cab-insignia--movil">Ez ofiziala · No oficial</span>
          </span>
        </a>

        <span className="cab-insignia cab-insignia--escritorio" title="Proyecto personal, sin relación con la Diputación Foral de Bizkaia">
          Ez ofiziala · No oficial
        </span>

        <button
          type="button"
          className="cab-boton-menu"
          aria-expanded={menuAbierto}
          aria-controls="cab-nav"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        >
          <span className="cab-hamburguesa" aria-hidden="true"><span /><span /><span /></span>
          <span className="cab-sr">{menuAbierto ? 'Itxi menua / Cerrar menú' : 'Ireki menua / Abrir menú'}</span>
        </button>

        <nav id="cab-nav" className={`cab-nav ${menuAbierto ? 'cab-nav--abierto' : ''}`} aria-label="Bizkaibus web ofiziala / Web oficial de Bizkaibus">
          <span className="cab-nav-etiqueta">Web ofiziala</span>
          <ul className="cab-lista">
            {ENLACES_OFICIALES.map((enlace) => (
              <li key={enlace.href}>
                <a
                  className="cab-enlace"
                  href={enlace.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${enlace.descripcion} · bizkaia.eus`}
                  onClick={() => setMenuAbierto(false)}
                >
                  {enlace.texto}
                  <IconoExterno />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
