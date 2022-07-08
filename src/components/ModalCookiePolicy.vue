<template>
  <transition name="backdrop">
      <div class="backdrop" v-if="open"></div>
  </transition>
  <transition name="modal">
    <div class="dialog" v-if="open">
      <dialog open :class="mobile?'mobile':''">
        <slot></slot>
        <div class="scroll">
            <p>Las galletas o cookies son pequeños archivos de texto que se instalan en los equipos desde los cuales se accede a nuestro sitio web. Entre otras finalidades, las cookies registran las preferencias y los hábitos de navegación de un usuario. Se asocian al usuario y a su equipo, pero no proporcionan datos directamente identificativos. Algunas cookies, por ejemplo las que permiten elaborar estadísticas o anuncios, necesitan el consentimiento del usuario de nuestro sitio web. En cambio otras cookies, las de carácter técnico o las necesarias para ofrecer un servicio solicitado por el usuario, son imprescindibles para el funcionamiento del sitio. Las cookies se pueden clasificar según su vigencia, quien las gestiona o su finalidad.</p>
            <p>Según la vigencia</p>
              <ul>
                <li>De sesión: son temporales y quedan en el archivo de galletas de vuestro navegador hasta el momento que abandonáis el sitio web</li>
                <li>Persistentes: quedan almacenadas y el sitio web les lee cada vez que hacéis una visita.</li>
              </ul>

            <p>Según quién las gestione</p>
            <ul>
              <li>Propias: son las propias del titular del sitio web desde lo que se prestan los servicios al usuario.</li>
              <li>De terceros: se envían al usuario por parte de uno tercero, diferente al titular del lugar.</li>
            </ul>

            <p>Según la finalidad</p>
            <ul>
              <li>Necesarias: las imprescindibles para facilitar vuestra conexión. No hay opción de inhabilitarlas, dado que son las necesarias por el funcionamiento del sitio web.</li>
              <li>Técnicas: las que permiten controlar el tráfico y comunicación de datos, identificar la sesión y acceder a páginas de acceso restringido, entre otros.</li>
              <li>Analíticas: proporcionan información estadística y permiten mejorar los servicios.</li>
            </ul>

          <p>Listado de cookies utilizadas</p>
          <table class="cookies-list">
            <tr>
              <th>Finalidad</th>
              <th>Proveedor</th>
              <th>Nombre de la cookie</th>
              <th>Gestión</th>
              <th>Vigencia</th>
              <th>Función</th>
            </tr>

            <tr>
              <td>Necesarias</td>
              <td>MOSQQUITO ALERT</td>
              <td>ma-visited</td>
              <td>Propia</td>
              <td>Persistente</td>
              <td>Mostrar la ventana informativa solo en la primera visita</td>
            </tr>
            <tr>
              <td>Analíticas</td>
              <td>Google</td>
              <td>_ga</td>
              <td>3eros</td>
              <td>2 años</td>
              <td>Registra una identificación única que se utiliza para generar datos estadísticos sobre cómo se utiliza el visitante el sitio web</td>
            </tr>
            <tr>
              <td></td>
              <td>Google</td>
              <td>_ga_ZLD12V4W3V</td>
              <td>1 año</td>
              <td>Analíticas</td>
              <td></td>
            </tr>
          </table>
        </div>
        <div class="buttons">
          <div class="download-buttons">
            <button @click="close" class="close">{{ _('Close') }}</button>
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
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const mobile = computed(() => {
      return $store.getters['app/getIsMobile']
    })

    return {
      mobile,
      open,
      close,
      _
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
  // background-color: rgba(0, 0, 0, 0.75);
  background: transparent
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
  max-width: 50vw;
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
</style>
