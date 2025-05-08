import React from 'react';
import styles from './header.css'; // Asegúrate del nombre correcto del archivo de módulos CSS

export function Cabecera() {
  return (
    <header id="banner" role="banner" className={styles.banner}>
      {/* Eliminar la etiqueta <link> CDN */}
      {/* <link href="..." rel="stylesheet" integrity="..." crossorigin="anonymous"></link> */}
      <div id="heading" className={`${styles.heading} affix-top`}>
        <div className="container">
          <div className={`site-title affix-top ${styles.siteTitle}`}>
            <a data-senna-off="true" className={`logo default-logo`} href="https://www.bizkaia.eus/eu/web/bizkaibus">
              <span className="sr-only">
                Bizkaia - Bizkaibus
              </span>
            </a>
          </div>
          <div className={`navbar navbar-expand-md slide-nav ${styles.navbar}`}> 
            <div className="navbar-header">
              {/* Este botón está correcto con los atributos de Bootstrap 4 */}
              <button type="button" className={`navbar-toggle collapsed ${styles.navbarToggle}`} data-toggle="collapse" data-target="#collapsar" aria-expanded="false">
                <span className="bipo_txtmenu">Menua</span>
                <span className="bipoicon bipoicon-menu"></span> {/* Este debería mostrar las 3 rayas */}
              </button>
            </div>
            {/*
              Este es el DIV que modificamos.
              Las clases 'collapse' y 'navbar-collapse' son de Bootstrap.
              La visibilidad en móvil la maneja el JS de Bootstrap basado en data-*.
            */}
            <div id="collapsar" className={`collapse navbar-collapse slidemenu bipo-navbar-top-container ${styles.slidemenu}`}>
              <nav id="navbar-main" role="navigation" aria-label="Menu nagusia" className={`affix-top ${styles.navbarMain}`}>
                <div className="bipo_nav">
                  <div>
                    <ul className={`navbar-nav ${styles.navbarNav}`}>
                      <li className={`nav-item lfr-nav-item ${styles.navItem}`} id="layout_11">
                        <a data-senna-off="true" href="https://www.bizkaia.eus/eu/web/bizkaibus/lineak" target="_self" className={`firstMenuLink ${styles.firstMenuLink}`}><span className="bipo_estadomenu">LINEAK</span></a>
                      </li>
                      <li className={`nav-item lfr-nav-item ${styles.navItem}`} id="layout_11">
                        <a data-senna-off="true" href="https://www.bizkaia.eus/eu/web/bizkaibus/geralekuak" target="_self" className={`firstMenuLink ${styles.firstMenuLink}`}><span className="bipo_estadomenu">GERALEKUAK</span></a>
                      </li>
                      <li className={`nav-item lfr-nav-item ${styles.navItem}`} id="layout_11">
                        <a data-senna-off="true" href="https://www.bizkaia.eus/eu/web/bizkaibus/tarifak" target="_self" className={`firstMenuLink ${styles.firstMenuLink}`}><span className="bipo_estadomenu">TARIFAK</span></a>
                      </li>
                      <li className={`nav-item lfr-nav-item ${styles.navItem}`} id="layout_11">
                        <a data-senna-off="true" href="https://www.bizkaia.eus/eu/web/bizkaibus/bezero-arreta" target="_self" className={`firstMenuLink ${styles.firstMenuLink}`}><span className="bipo_estadomenu">BEZERO ARRETA</span></a>
                      </li>
                      <li className={`nav-item lfr-nav-item ${styles.navItem}`} id="layout_11">
                        <a data-senna-off="true" href="https://www.bizkaia.eus/eu/web/bizkaibus/bizkaibusi-buruz" target="_self" className={`firstMenuLink ${styles.firstMenuLink}`}><span className="bipo_estadomenu">BIZKAIBUSI BURUZ</span></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
        <div className={`inverse ${styles.inverse}`} id="navbar-height-col"></div><div className="overlay"></div>
      </div>
      <div className={`bipo_navbgcolor ${styles.bipoNavbgcolor}`}></div>
    </header>
  );
}