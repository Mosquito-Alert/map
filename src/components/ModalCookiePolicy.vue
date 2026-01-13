<template>
  <transition name="backdrop">
      <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog" v-if="open">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
        <div class="scroll">
            <h4>{{ $t("cookies_policy") }}</h4>
            <p>{{ $t('las_galletas_o_cookies_son_pequenos_archivos_de_texto_que_se_instalan_en_los_equipos_desde_los_cuales_se_accede_a_nuestro_sitio_web_entre_otras_finalidades_las_cookies_registran_las_preferencias_y_los_habitos_de_navegacion_de_un_usuario') }}</p>
            <p>{{ $t('se_asocian_al_usuario_y_a_su_equipo_pero_no_proporcionan_datos_directamente_identificativos_algunas_cookies_por_ejemplo_las_que_permiten_elaborar_estadisticas_o_anuncios_necesitan_el_consentimiento_del_usuario_de_nuestro_sitio_web_en_cambio_otras_cookies_las_de_caracter_tecnico_o_las_necesarias_para_ofrecer_un_servicio_solicitado_por_el_usuario_son_imprescindibles_para_el_funcionamiento_del_sitio') }}</p>
            <p>{{ $t('las_cookies_se_pueden_clasificar_segun_su_vigencia_quien_las_gestiona_o_su_finalidad') }}</p>
            <h5>{{ $t('segun_la_vigencia')}} </h5>
              <ul>
                <li>{{ $t('de_sesion_son_temporales_y_quedan_en_el_archivo_de_galletas_de_vuestro_navegador_hasta_el_momento_que_abandonais_el_sitio_web') }}</li>
                <li>{{ $t('persistentes_quedan_almacenadas_y_el_sitio_web_les_lee_cada_vez_que_haceis_una_visita') }}</li>
              </ul>

            <h5>{{ $t('segun_quien_las_gestione') }}</h5>
            <ul>
              <li>{{ $t('propias_son_las_propias_del_titular_del_sitio_web_desde_lo_que_se_prestan_los_servicios_al_usuario') }}</li>
              <li>{{ $t('de_terceros_se_envian_al_usuario_por_parte_de_uno_tercero_diferente_al_titular_del_lugar') }}</li>
            </ul>

            <h5>{{ $t('segun_la_finalidad') }}</h5>
            <ul>
              <li>{{ $t('necesarias') }}: {{ $t('las_imprescindibles_para_facilitar_vuestra_conexion_no_hay_opcion_de_inhabilitarlas_dado_que_son_las_necesarias_por_el_funcionamiento_del_sitio_web') }}</li>
              <li>{{ $t('tecnicas') }}: {{ $t('las_que_permiten_controlar_el_trafico_y_comunicacion_de_datos_identificar_la_sesion_y_acceder_a_paginas_de_acceso_restringido_entre_otros') }}</li>
              <li>{{ $t('analiticas') }}: {{ $t('proporcionan_informacion_estadistica_y_permiten_mejorar_los_servicios') }}</li>
            </ul>

          <h5>{{ $t('listado_de_cookies_utilizadas') }}</h5>
          <p>{{ $t('en_la_web_de_mosquito_alert_utilizamos_una_unica_cookie_de_tipo_tecnico_y_las_cookies_de_google_analytics') }}</p>
          <p>{{ $t('las_cookies_de_google_analytics_permiten_analizar_estadisticamente_la_informacion_a_que_acceden_los_usuarios_de_nuestro_lugar_los_datos_recopilados_pueden_incluir_la_actividad_del_navegador_del_usuario_cuando_nos_visita_la_ruta_que_siguen_los_usuarios_en_nuestro_lugar_informacion_del_proveedor_de_servicios_de_internet_del_visitante_el_numero_a_veces_que_los_usuarios_acceden_al_lugar_y_el_comportamiento_de_los_usuarios_en_nuestro_lugar_paginas_que_ha_visitado_formularios_que_se_han_completado_y_similares') }}</p>

          <p>{{ $t('puedes_obtener_mas_informacion_sobre_google_analytics_a') }} <a href="//www.google.com/analytics/">www.google.com/analytics/</a>.
             <!-- {{ $t('Para controlar la recopilación de datos con finalidades analiticas por parte de Google Analytics, puedes ir a') }} -->
              <a href="//tools.google.com/dlpage/gaoptout?hl=en">https://tools.google.com/dlpage/gaoptout?hl=en</a></p>

          <p>{{ $t('a_continuacion_mostramos_una_tabla_con_las_cookies_utilizadas_para_cada_cookie_incluimos_los_siguientes_atributos_finalidad_proveedor_nombre_de_la_cookie_gestion_vigencia_y_funcion') }}</p>
          <table class="cookies-list">
            <tr>
              <th>{{ $t('finalidad') }}</th>
              <th>{{ $t('proveedor') }}</th>
              <th>{{ $t('nombre_de_la_cookie') }}</th>
              <th>{{ $t('gestion') }}</th>
              <th>{{ $t('vigencia') }}</th>
              <th>{{ $t('funcion')}} </th>
            </tr>
            <tr>
              <td>{{ $t('necesarias') }}</td>
              <td>{{ $t('mosqquito_alert') }}</td>
              <td>ma-visited</td>
              <td>{{ $t('propia') }}</td>
              <td>{{ $t('persistente') }}</td>
              <td>{{ $t('mostrar_la_ventana_informativa_solo_en_la_primera_visita') }}</td>
            </tr>
            <tr>
              <td>{{ $t('necesarias') }}</td>
              <td>{{ $t('mosqquito_alert') }}</td>
              <td>lang</td>
              <td>{{ $t('propia') }}</td>
              <td>{{ $t('persistente') }}</td>
              <td>{{ $t('permite_recordar_el_idioma_seleccionado_con_anterioridad') }}</td>
            </tr>
            <tr>
              <td>{{ $t('necesarias') }}</td>
              <td>{{ $t('mosqquito_alert') }}</td>
              <td>cookie-comply</td>
              <td>{{ $t('propia') }}</td>
              <td>{{ $t('persistente') }}</td>
              <td>{{ $t('permite_recordar_las_cookies_aceptadas_con_anterioridad') }}</td>
            </tr>
            <tr>
              <td>{{ $t('analiticas') }}</td>
              <td>Google</td>
              <td>_ga</td>
              <td>{{ $t('terceros') }}</td>
              <td>{{ $t('2_anos') }}</td>
              <td rowspan="2">{{ $t('registra_una_identificacion_unica_que_se_utiliza_para_generar_datos_estadisticos_sobre_como_se_utiliza_el_visitante_el_sitio_web') }}</td>
            </tr>
            <tr>
              <td>{{ $t('analiticas') }}</td>
              <td>Google</td>
              <td>_ga_ZLD12V4W3V</td>
              <td>{{ $t('terceros') }}</td>
              <td>{{ $t('1_ano') }}</td>
            </tr>
          </table>
        </div>
        <div class="buttons">
          <div class="download-buttons">
            <button @click="showModalCookieSettings" class="ma-btn">
              {{ $t('manage_cookies') }}
            </button>
            <button @click="close" class="ma-btn">{{ $t('close') }}</button>
          </div>
        </div>
      </dialog>
    </div>
  </transition>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  emits: ['close', 'newReport'],
  setup (props, context) {
    const $store = useStore()

    const open = computed(() => {
      return $store.getters['app/getModals'].cookiePolicy.visibility
    })

    const close = function () {
      $store.commit('app/setModal', { id: 'cookiePolicy', content: { visibility: false } })
    }
    const trans = function (text) {
      return $store.getters['app/getText'](text)
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    const showModalCookieSettings = function () {
      close()
      $store.commit('app/setModal', { id: 'cookieSettings', content: { visibility: true } })
    }

    return {
      mobile,
      open,
      close,
      showModalCookieSettings,
      trans
    }
  }
}
</script>

<style scoped lang="scss">
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.75);
}

.dialog {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2001;
}
dialog {
  max-width: 60vw;
  max-height: 80vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 5rem 5rem 3rem 5rem;
  background-color: white;
  z-index: 2001;
  border: none;
  overflow:auto;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
.backdrop-enter-active,
.backdrop-leave-active {
  transition: all .25s ease-in;
}
.modal-enter-from {
  opacity: 0;
  top: -5vh;
}
.modal-enter-active,
.modal-leave-active {
  transition: all .25s ease-in;
}
.modal-leave-to {
  opacity: 0;
  top: 5vh;
}
button.disabled {
  background: #ccc;
  pointer: not-allowed;
}
button {
  background: $primary-button-background;
  border: none;
  color: white;
  text-transform: uppercase;
  padding: 15px 50px;
  cursor: pointer;
  font-weight: bold;
  margin: 10px;
}
button:hover {
  background: $primary-button-background-hover;
  color: #644a0f;
}
.download-buttons{
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.error-message{
  color: crimson;
  text-align: center;
  font-weight: bold;
}
.modal-title{
  font-size: 1.5em;
  padding-bottom: 10px;
}

// MOBILE
dialog.mobile {
  max-width: 90vw;
  max-height: 90vh;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  padding: 1rem 1rem 1rem 1rem;
}

dialog.mobile button{
  padding: 5px 10px;
}
table.cookies-list{
  border: 1px solid black;
  background:#ccc;
}

table.cookies-list td{
  border-bottom: 1px solid black;
}
</style>
