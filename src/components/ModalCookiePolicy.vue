<template>
  <transition name="backdrop">
      <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog" v-if="open">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
        <div class="scroll">
            <h4>{{ trans("Cookies policy") }}</h4>
            <p>{{ trans('Las galletas o cookies son pequeños archivos de texto que se instalan en los equipos desde los cuales se accede a nuestro sitio web. Entre otras finalidades, las cookies registran las preferencias y los hábitos de navegación de un usuario.') }}</p>
            <p>{{ trans('Se asocian al usuario y a su equipo, pero no proporcionan datos directamente identificativos. Algunas cookies, por ejemplo las que permiten elaborar estadísticas o anuncios, necesitan el consentimiento del usuario de nuestro sitio web. En cambio otras cookies, las de carácter técnico o las necesarias para ofrecer un servicio solicitado por el usuario, son imprescindibles para el funcionamiento del sitio.') }}</p>
            <p>{{ trans('Las cookies se pueden clasificar según su vigencia, quien las gestiona o su finalidad.') }}</p>
            <h5>{{ trans('Según la vigencia')}} </h5>
              <ul>
                <li>{{ trans('De sesión: son temporales y quedan en el archivo de galletas de vuestro navegador hasta el momento que abandonáis el sitio web') }}</li>
                <li>{{ trans('Persistentes: quedan almacenadas y el sitio web les lee cada vez que hacéis una visita') }}</li>
              </ul>

            <h5>{{ trans('Según quién las gestione') }}</h5>
            <ul>
              <li>{{ trans('Propias: son las propias del titular del sitio web desde lo que se prestan los servicios al usuario') }}</li>
              <li>{{ trans('De terceros: se envían al usuario por parte de uno tercero, diferente al titular del lugar') }}</li>
            </ul>

            <h5>{{ trans('Según la finalidad') }}</h5>
            <ul>
              <li>{{ trans('Necesarias') }}: {{ trans('las imprescindibles para facilitar vuestra conexión. No hay opción de inhabilitarlas, dado que son las necesarias por el funcionamiento del sitio web') }}</li>
              <li>{{ trans('Técnicas') }}: {{ trans('las que permiten controlar el tráfico y comunicación de datos, identificar la sesión y acceder a páginas de acceso restringido, entre otros') }}</li>
              <li>{{ trans('Analíticas') }}: {{ trans('proporcionan información estadística y permiten mejorar los servicios') }}</li>
            </ul>

          <h5>{{ trans('Listado de cookies utilizadas') }}</h5>
          <p>{{ trans('En la web de Mosquito Alert utilizamos una única cookie de tipo técnico y las cookies de Google Analytics') }}</p>
          <p>{{ trans('Las cookies de Google Analytics, permiten analizar estadísticamente la información a que acceden los usuarios de nuestro lugar. Los datos recopilados pueden incluir la actividad del navegador del usuario cuando nos visita, la ruta que siguen los usuarios en nuestro lugar, información del proveedor de servicios de Internet del visitante, el número a veces que los usuarios acceden al lugar y el comportamiento de los usuarios en nuestro lugar (páginas que ha visitado, formularios que se han completado y similares)') }}</p>

          <p>{{ trans('Puedes obtener más información sobre Google Analytics a') }} <a href="//www.google.com/analytics/">www.google.com/analytics/</a>. {{ trans('Para controlar la recopilación de datos con finalidades analíticas por parte de Google Analytics, puedes ir a') }} <a href="//tools.google.com/dlpage/gaoptout?hl=en">https://tools.google.com/dlpage/gaoptout?hl=en</a></p>

          <p>{{ trans('A continuación mostramos una tabla con las cookies utilizadas. Para cada cookie incluimos los siguientes atributos: finalidad, proveedor, nombre de la cookie, gestión, vigencia y función') }}</p>
          <table class="cookies-list">
            <tr>
              <th>{{ trans('Finalidad') }}</th>
              <th>{{ trans('Proveedor') }}</th>
              <th>{{ trans('Nombre de la cookie') }}</th>
              <th>{{ trans('Gestión') }}</th>
              <th>{{ trans('Vigencia') }}</th>
              <th>{{ trans('Función')}} </th>
            </tr>
            <tr>
              <td>{{ trans('Necesarias') }}</td>
              <td>{{ trans('MOSQQUITO ALERT') }}</td>
              <td>ma-visited</td>
              <td>{{ trans('Propia') }}</td>
              <td>{{ trans('Persistente') }}</td>
              <td>{{ trans('Mostrar la ventana informativa solo en la primera visita') }}</td>
            </tr>
            <tr>
              <td>{{ trans('Necesarias') }}</td>
              <td>{{ trans('MOSQQUITO ALERT') }}</td>
              <td>lang</td>
              <td>{{ trans('Propia') }}</td>
              <td>{{ trans('Persistente') }}</td>
              <td>{{ trans('Permite recordar el idioma seleccionado con anterioridad') }}</td>
            </tr>
            <tr>
              <td>{{ trans('Necesarias') }}</td>
              <td>{{ trans('MOSQQUITO ALERT') }}</td>
              <td>cookie-comply</td>
              <td>{{ trans('Propia') }}</td>
              <td>{{ trans('Persistente') }}</td>
              <td>{{ trans('Permite recordar las cookies aceptadas con anterioridad') }}</td>
            </tr>
            <tr>
              <td>{{ trans('Analíticas') }}</td>
              <td>Google</td>
              <td>_ga</td>
              <td>{{ trans('terceros') }}</td>
              <td>{{ trans('2 años') }}</td>
              <td rowspan="2">{{ trans('Registra una identificación única que se utiliza para generar datos estadísticos sobre cómo se utiliza el visitante el sitio web') }}</td>
            </tr>
            <tr>
              <td>{{ trans('Analíticas') }}</td>
              <td>Google</td>
              <td>_ga_ZLD12V4W3V</td>
              <td>{{ trans('terceros') }}</td>
              <td>{{ trans('1 año') }}</td>
            </tr>
          </table>
        </div>
        <div class="buttons">
          <div class="download-buttons">
            <button @click="showModalCookieSettings" class="ma-btn">
              {{ trans('Manage cookies') }}
            </button>
            <button @click="close" class="ma-btn">{{ trans('Close') }}</button>
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
