<template>
  <div class = "hashtags-list">
    <q-input
      v-model="newTag"
      color="orange"
      :label="_('Placeholder hashtag')"
      @keyup.enter="addTag"
    >
    </q-input>
      <div v-if="tags.length">
        <q-chip
          class="hashtag-chip"
          square
          removable
          @remove="deleteTag(tag)"
          v-for="tag, index in tags" :key="index">
          {{tag}}
        </q-chip>
      </div>
  </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  props: [],
  emits: ['tagsModified'],
  setup (props, context) {
    const tags = ref([])
    const newTag = ref()
    const $store = useStore()
    const _ = function (text) {
      return $store.getters['app/getText'](text)
    }

    const deleteTag = function (tag) {
      const index = tags.value.indexOf(tag)
      tags.value.splice(index, 1)
      context.emit('tagsModified', tags.value)
    }

    const addTag = function () {
      newTag.value = newTag.value.toLowerCase()
      tags.value.push(newTag.value)
      newTag.value = ''
      context.emit('tagsModified', tags.value)
    }

    onMounted(function () {
      const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
      tags.value = defaults.HASHTAGS
    })

    return {
      _,
      newTag,
      tags,
      deleteTag,
      addTag
    }
  }
}
</script>

<style scoped lang="scss">
.hashtags-list label{
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
.q-field__marginal{
  height:unset;
}
.q-chip{
  background: #ccc;
  color: white;
  margin-left:0px;
}
.q-chip__icon {
  color: unset;
}
</style>
