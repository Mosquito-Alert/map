<template>
  <div class = "hashtags-list">
    <q-input
      v-model="newTag"
      :loading="isFilteringTag"
      color="orange"
      :label="_('Placeholder hashtag')"
      @keyup.enter="addTag"
    >
    </q-input>
      <div v-if="tags.length">
        <q-chip
          class="hashtag-chip"
          :class="tag.startsWith(':') ? 'report-tag':''"
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
import { ref, onMounted, computed } from 'vue'
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
      context.emit('tagsModified', {
        tags: tags.value,
        mode: 'deletedTag',
        tag: tag
      })
    }

    const addTag = function () {
      if (newTag.value.startsWith(':')) {
        $store.commit('app/setFilteringTag', { value: true })
        tags.value = []
      } else {
        // If normal tag
        newTag.value = newTag.value.toLowerCase()
      }

      if (!tags.value.includes(newTag.value)) {
        tags.value.push(newTag.value)
      }

      context.emit('tagsModified', {
        tags: tags.value,
        mode: 'addedTag',
        tag: newTag.value
      })

      newTag.value = ''
    }

    function setTags (t) {
      tags.value.push(...t)
    }

    onMounted(function () {
      const defaults = JSON.parse(JSON.stringify($store.getters['app/getDefaults']))
      tags.value = defaults.hashtags
    })

    // const tagis = computed(() => {
    //   return $store.getters['app/getDefaults'].hashtags
    // })

    return {
      _,
      setTags,
      newTag,
      tags,
      // tagis,
      deleteTag,
      addTag,
      isFilteringTag: computed(() => $store.getters['app/isFilteringTag'])
    }
  }
}
</script>

<style lang="scss">
.hashtags-list label{
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
.q-field__marginal{
  height:unset;
}
.q-chip{
  background: $primary-color;
  margin-left:0px;
}
.q-chip__icon {
  color: unset;
}
.hashtags-list .hashtag-chip,
.hashtags-list .hashtag-chip .q-chip__icon--remove {
  color: white;
  opacity: 1;
}
.q-chip.report-tag{
  background-color: $filter-grey;
}
</style>
